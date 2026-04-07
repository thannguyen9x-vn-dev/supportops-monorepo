# TASK-101 — Types Contract

**Phase:** 1 — Types Contract
**Depends on:** —
**Blocks:** TASK-201, TASK-301, TASK-401, TASK-501

---

## Mục tiêu

Tạo và cập nhật tất cả type definitions trong `packages/types/` trước khi implement BE và FE. `packages/types` là nguồn sự thật duy nhất cho contract giữa FE ↔ BE ↔ Worker.

---

## Danh sách file cần thay đổi

### 1. TẠO MỚI: `packages/types/src/types/import.types.ts`

```typescript
import type { RequestPriority } from '../enums';

// ─── Job Status ───────────────────────────────────────────────

export type ImportJobStatus = 'queued' | 'preview_ready' | 'processing' | 'completed' | 'failed';

export interface BulkImportJobEnqueuedResponse {
  jobId: string;
  status: 'queued';
  fileName: string;
  uploadedAt: string;
}

export interface ImportJobStatusResponse {
  jobId: string;
  status: ImportJobStatus;
  progress?: number;              // 0-100 (for 'processing')
  preview?: ImportPreviewResult;  // present when 'preview_ready'
  result?: BulkImportResult;      // present when 'completed'
  error?: string;                 // present when 'failed'
}

export interface ConfirmImportInput {
  skipRowIndices: number[];       // 0-based row indices coordinator muốn bỏ qua
}

// ─── Import Results ───────────────────────────────────────────

export interface BulkImportResult {
  totalRows: number;
  created: number;
  failed: number;
  errors: ImportRowError[];
}

export interface ImportRowError {
  row: number;
  field?: string;
  message: string;
}

export interface ImportRowWarning {
  row: number;
  type: 'duplicate_in_file' | 'duplicate_recent';
  message: string;
}

// Preview response — returned by worker after parse+validate (before confirm)
export interface ImportPreviewResult {
  totalRows: number;
  validRows: number;
  errorRows: ImportRowError[];
  warningRows: ImportRowWarning[];  // yellow — coordinator can untick
}

// ─── Bulk JSON API ────────────────────────────────────────────

export interface BulkCreateRequestItem {
  title: string;
  description?: string;
  serviceTypeCode: string;
  priority: RequestPriority;
  locationId: string;
  reporterEmail?: string;
}

export interface BulkCreateRequestInput {
  items: BulkCreateRequestItem[];
}

export interface BulkCreateRequestResult {
  created: number;
  failed: number;
  errors: Array<{ index: number; field?: string; message: string }>;
}
```

---

### 2. SỬA: `packages/types/src/service-ops/endpoints.ts`

Tìm object `SERVICE_OPS_ENDPOINTS.REQUESTS` (hoặc tương đương), thêm vào:

```typescript
IMPORT_TEMPLATE: '/requests/import/template',
IMPORT_UPLOAD: '/requests/import/upload',
IMPORT_JOB_STATUS: (jobId: string) => `/requests/import/jobs/${jobId}`,
IMPORT_JOB_CONFIRM: (jobId: string) => `/requests/import/jobs/${jobId}/confirm`,
BULK_CREATE: '/requests/bulk',
```

> Đọc file hiện tại trước để biết pattern export chính xác (có thể là `as const`, `enum`, hoặc plain object).

---

### 3. SỬA: `packages/types/src/rbac.ts`

Thêm permission mới:

```typescript
// Trong RBAC_PERMISSIONS (hoặc AppPermission enum — đọc file để biết pattern):
REQUEST_IMPORT: 'request.import',
```

Thêm vào `ROLE_PERMISSION_MATRIX`:
```typescript
// OPS_COORDINATOR: [...existing, RBAC_PERMISSIONS.REQUEST_IMPORT]
// TENANT_ADMIN: đã có toàn bộ permissions — kiểm tra xem có tự động spread không
```

> Đọc file trước để hiểu cấu trúc chính xác.

---

### 4. SỬA: `packages/types/src/enums/notification.enums.ts`

Thêm vào enum `NotificationEventType`:

```typescript
BULK_IMPORT_COMPLETED = 'BULK_IMPORT_COMPLETED',
```

---

### 5. SỬA: `packages/types/src/index.ts`

Thêm re-export:

```typescript
export * from './types/import.types';
```

> Đọc file hiện tại trước, đảm bảo không duplicate export nào.

---

## Quality Gate

```bash
pnpm --filter @supportops/types typecheck
```

**Phải pass 0 errors trước khi báo Done.**

---

## Checklist

- [ ] `import.types.ts` tạo mới với tất cả types theo spec
- [ ] `endpoints.ts` — 5 endpoints mới được thêm đúng format
- [ ] `rbac.ts` — `request.import` permission thêm vào constant và role matrix
- [ ] `notification.enums.ts` — `BULK_IMPORT_COMPLETED` thêm vào enum
- [ ] `index.ts` — re-export `import.types`
- [ ] `pnpm --filter @supportops/types typecheck` → PASS
- [ ] `_STATUS.md` cập nhật → ✅ Done
