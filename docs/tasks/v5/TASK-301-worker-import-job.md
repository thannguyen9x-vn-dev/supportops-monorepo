# TASK-301 — Worker: import-requests Job

**Phase:** 2B — Worker (song song với TASK-201)
**Depends on:** TASK-101
**Blocks:** TASK-401

---

## Mục tiêu

Thêm queue `import-requests` và processor 2 phases vào `apps/worker`. Worker đã có BullMQ + Redis infrastructure — chỉ cần thêm queue name, job processor, và register vào runtime.

> **Quan trọng:** Kiểm tra xem `csv-parse` và `exceljs` đã có trong workspace chưa (đặc biệt `exceljs` có thể đã dùng trong `apps/ai-service`). Nếu có → hoist lên root thay vì add duplicate.

---

## Dependencies cần thêm (nếu chưa có)

```bash
# Kiểm tra trước:
grep -r "csv-parse\|exceljs" apps/ packages/ --include="package.json"

# Nếu chưa có trong worker:
cd apps/worker
pnpm add csv-parse exceljs
```

| Package | Version | Mục đích |
|---|---|---|
| `csv-parse` | ^5.x | Streaming CSV parse |
| `exceljs` | ^4.x | Read .xlsx với streaming mode |

---

## Danh sách file cần thay đổi

### 1. SỬA: `apps/worker/src/config.ts`

Tìm `QUEUE_NAMES` constant, thêm:

```typescript
export const QUEUE_NAMES = {
  // ...existing...
  IMPORT_REQUESTS: 'import-requests',
} as const;
```

---

### 2. TẠO MỚI: `apps/worker/src/jobs/import-requests.job.ts`

File này chứa types + cả 2 phase processors.

#### Types

```typescript
export interface ImportRequestsPhase1JobData {
  phase: 1;
  jobId: string;
  tenantId: string;
  userId: string;
  fileKey: string;     // MinIO: imports/{tenantId}/{jobId}/original.{ext}
  mimeType: string;
}

export interface ImportRequestsPhase2JobData {
  phase: 2;
  jobId: string;
  tenantId: string;
  userId: string;
  fileKey: string;
  mimeType: string;
  skipRowIndices: number[];
}

export type ImportRequestsJobData = ImportRequestsPhase1JobData | ImportRequestsPhase2JobData;
```

#### Phase 1 Processor — parse + validate + lưu preview vào Redis

Logic:
1. Download file từ MinIO theo `fileKey`
2. Parse: CSV → `csv-parse` streaming; `.xlsx` → `exceljs` Workbook streaming
3. Map rows → `{ title, description, serviceTypeCode, priority, locationId, reporterEmail }`
4. Validate từng row:
   - `title` bắt buộc, không rỗng
   - `priority` phải thuộc enum: `LOW | MEDIUM | HIGH | URGENT`
   - `serviceTypeCode` bắt buộc, không rỗng
   - `locationId` bắt buộc
5. Batch lookup `serviceTypeCode` hợp lệ:
   ```typescript
   await prisma.serviceType.findMany({
     where: { tenantId, code: { in: uniqueCodes }, isActive: true },
     select: { id: true, code: true },
   });
   ```
6. `reporterEmail` rule (Design Decision D4):
   - Empty → `requesterId = importingUserId` (fallback, KHÔNG phải error)
   - Có điền → batch lookup:
     ```typescript
     await prisma.user.findMany({
       where: { tenantId, email: { in: nonEmptyEmails }, status: 'ACTIVE' },
       select: { id: true, email: true },
     });
     ```
   - Nếu email có điền nhưng không tìm thấy trong tenant → **error row** (skip), KHÔNG fallback
7. Duplicate detection — **intra-file** (Design Decision D6):
   - Group rows by `title + serviceTypeCode + reporterEmail`
   - Nếu count > 1 → giữ row đầu tiên, các row sau = `ImportRowError` với message `"Duplicate row within this file"`
8. Duplicate detection — **cross-import** (Design Decision D6):
   - Query ServiceRequest trong 24h qua:
     ```typescript
     await prisma.serviceRequest.findMany({
       where: {
         tenantId,
         createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
         title: { in: validRows.map((r) => r.title) },
       },
       select: { title: true, serviceTypeId: true, requesterId: true },
     });
     ```
   - Match `title + serviceTypeId + requesterId` → `ImportRowWarning` với type `'duplicate_recent'`
   - WARNING rows vẫn được tạo trừ khi frontend gửi `skipRowIndices`
9. Build `ImportPreviewResult`:
   ```typescript
   {
     totalRows: rows.length,
     validRows: validRowCount,
     errorRows: [...],    // hard errors — bị skip
     warningRows: [...],  // duplicate warnings — coordinator có thể override
   }
   ```
10. Lưu vào Redis: `SET import:preview:{jobId} <json> EX 3600` (TTL 1 giờ)
11. Cập nhật job status → `preview_ready` (qua BullMQ job update metadata hoặc custom Redis key)

---

#### Phase 2 Processor — tạo requests (sau confirm)

Logic:
1. Load preview từ Redis: `GET import:preview:{jobId}`
   - Nếu không có (TTL expired) → throw error, job fails với message rõ ràng
2. Filter out: error rows + `skipRowIndices` (coordinator đã chọn skip)
3. Build confirmed rows (chỉ valid rows không nằm trong skipRowIndices)
4. Batch create trong transaction:
   ```typescript
   await prisma.$transaction(
     confirmedRows.map((row) =>
       prisma.serviceRequest.create({
         data: {
           tenantId,              // ← từ job.data, KHÔNG từ file
           title: row.title,
           description: row.description ?? '',
           serviceTypeId: serviceTypeMap[row.serviceTypeCode],
           priority: row.priority,
           locationId: row.locationId,
           requesterId: row.reporterEmail
             ? reporterMap[row.reporterEmail]
             : importingUserId,
           status: 'SUBMITTED',
           sourceChannel: 'API',
         },
       }),
     ),
   );
   ```
5. Tạo AuditLog:
   ```typescript
   await prisma.auditLog.create({
     data: {
       tenantId,
       entityType: 'BulkImportJob',
       entityId: jobId,
       action: 'BULK_IMPORT_COMPLETED',
       actorId: userId,
       afterData: { totalRows, created, failed, errors: failedRows },
     },
   });
   ```
6. Tạo Notification cho importing user:
   ```typescript
   await prisma.notification.create({
     data: {
       tenantId,
       userId: importingUserId,
       type: 'BULK_IMPORT_COMPLETED',
       title: 'Import hoàn tất',
       body: `${created} requests đã được tạo, ${failed} lỗi.`,
       metadata: { jobId, created, failed },
     },
   });
   ```
7. Xóa file MinIO: `imports/{tenantId}/{jobId}/original.{ext}`
8. Xóa Redis key: `DEL import:preview:{jobId}`

---

#### Entry point function

```typescript
export async function processImportRequestsJob(
  data: ImportRequestsJobData,
  deps: { prisma: PrismaClient; redis: Redis; minioClient: MinioClient },
): Promise<void> {
  if (data.phase === 1) {
    await processPhase1(data, deps);
  } else {
    await processPhase2(data, deps);
  }
}
```

---

### 3. TẠO MỚI: `apps/worker/src/jobs/import-requests.job.spec.ts`

Unit tests theo spec DESIGN-00005 Section 9.3:

| Test case | Expected |
|---|---|
| Phase 1 — Parse CSV 5 rows hợp lệ | Preview result lưu Redis, status = `preview_ready`, 0 errors, 0 warnings |
| Phase 1 — Row có serviceTypeCode không hợp lệ | Row đó → error, valid rows → `preview_ready` |
| Phase 1 — `reporterEmail` để trống | requesterId = importingUserId (fallback), không phải error |
| Phase 1 — `reporterEmail` điền, không tìm thấy trong tenant | Row đó → error với message rõ ràng |
| Phase 1 — 2 rows giống nhau (intra-file) | Row thứ 2 → error `duplicate_in_file` |
| Phase 1 — Row trùng request trong 24h | Row đó → warning `duplicate_recent` |
| Phase 1 — File parse error (malformed CSV) | Job status = failed |
| Phase 2 — skipRowIndices = [] | Tất cả valid rows được tạo, AuditLog + Notification |
| Phase 2 — skipRowIndices = [2, 4] | Row 2 và 4 bị skip, các row khác được tạo |
| Phase 2 — Redis preview key expired | throw error, job fails |
| Job completion | `Notification.type = 'BULK_IMPORT_COMPLETED'` đúng userId, đúng tenantId |

---

### 4. SỬA: `apps/worker/src/worker-runtime.ts`

Tìm hàm `startWorkers()` (hoặc tương đương), thêm worker mới:

```typescript
import { QUEUE_NAMES } from './config';
import { processImportRequestsJob, ImportRequestsJobData } from './jobs/import-requests.job';

// Trong startWorkers():
workers.push(
  new Worker(
    QUEUE_NAMES.IMPORT_REQUESTS,
    async (job: Job) => {
      await processImportRequestsJob(job.data as ImportRequestsJobData, { prisma, redis, minioClient });
    },
    { connection },
  ),
);
```

> Đọc `worker-runtime.ts` trước để biết chính xác pattern đăng ký worker (tên biến, cấu trúc deps).

---

## Quality Gate

```bash
pnpm --filter @supportops/worker build
pnpm --filter @supportops/worker test
```

**Cả hai phải pass 0 errors trước khi báo Done.**

---

## Checklist

- [ ] Kiểm tra `csv-parse` và `exceljs` đã có trong workspace chưa
- [ ] `config.ts` — `IMPORT_REQUESTS` queue name thêm vào `QUEUE_NAMES`
- [ ] `import-requests.job.ts` tạo mới với Phase 1 + Phase 2 processor
- [ ] Phase 1: validate, batch lookup serviceTypes + reporters với `tenantId` filter
- [ ] Phase 1: duplicate detection intra-file (error) + cross-import (warning)
- [ ] Phase 1: lưu preview vào Redis với TTL 3600s
- [ ] Phase 2: load từ Redis, filter skipRowIndices, batch create trong transaction
- [ ] Phase 2: AuditLog + Notification tạo đúng tenantId từ job.data
- [ ] Phase 2: xóa MinIO file + Redis key sau khi xong
- [ ] `import-requests.job.spec.ts` tạo mới với tất cả test cases
- [ ] `worker-runtime.ts` — register worker mới vào `startWorkers()`
- [ ] `pnpm --filter @supportops/worker build` → PASS
- [ ] `pnpm --filter @supportops/worker test` → PASS
- [ ] `_STATUS.md` cập nhật → ✅ Done
