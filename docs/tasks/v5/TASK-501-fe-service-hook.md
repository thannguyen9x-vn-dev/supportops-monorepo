# TASK-501 — Frontend: Service + Hook

**Phase:** 4 — Frontend (bước 1)
**Depends on:** TASK-101 (types + endpoints), TASK-401 (BE endpoints chạy được)
**Blocks:** TASK-502

---

## Mục tiêu

Tạo service và hook cho import flow. Đây là foundation để TASK-502 build components lên trên.

**Layer diagram (bắt buộc):**
```
Component → Hook → Service → apiClient → Backend
```

---

## 1. TẠO MỚI: `apps/web/src/features/service-ops/requests/services/import-requests.service.ts`

```typescript
// ~60 lines
// Không import apiClient trực tiếp vào component — chỉ service mới được dùng apiClient
```

**4 methods:**

```typescript
// 1. Download template — trigger browser download
downloadTemplate(format: 'csv' | 'xlsx'): void
// → GET SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_TEMPLATE + `?format=${format}`
// → dùng window.location.href hoặc fetch + blob URL trick để trigger download
// Nhớ gửi Authorization header nếu dùng fetch

// 2. Upload file → return jobId
uploadImportFile(file: File): Promise<BulkImportJobEnqueuedResponse>
// → POST SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_UPLOAD
// → multipart/form-data với field "file"
// → return BulkImportJobEnqueuedResponse

// 3. Poll job status
getJobStatus(jobId: string): Promise<ImportJobStatusResponse>
// → GET SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_JOB_STATUS(jobId)
// → return ImportJobStatusResponse

// 4. Confirm import (send skipRowIndices)
confirmImport(jobId: string, skipRowIndices: number[]): Promise<{ jobId: string; status: 'queued' }>
// → POST SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_JOB_CONFIRM(jobId)
// → body: { skipRowIndices }
```

> **Import endpoints từ `@supportops/types`:**
> ```typescript
> import { SERVICE_OPS_ENDPOINTS } from '@supportops/types';
> import type { BulkImportJobEnqueuedResponse, ImportJobStatusResponse } from '@supportops/types';
> ```

---

## 2. TẠO MỚI: `apps/web/src/features/service-ops/requests/hooks/useImportRequests.ts`

```typescript
// ~120 lines — nếu vượt quá, tách state machine ra hook con
```

### State machine

```
idle → uploading → processing → preview_ready → confirming → result | error
```

### State

```typescript
type ImportStep = 'upload' | 'processing' | 'preview' | 'result';

interface UseImportRequestsState {
  step: ImportStep;
  jobId: string | null;
  preview: ImportPreviewResult | null;
  skippedRows: Set<number>;         // rows coordinator bỏ tick
  jobStatus: ImportJobStatusResponse | null;
  isUploading: boolean;
  error: string | null;
}
```

### Actions / mutations

```typescript
// Upload file → nhận jobId → bắt đầu polling
uploadFile(file: File): Promise<void>
  // 1. setState({ isUploading: true, step: 'processing' })
  // 2. gọi importRequestsService.uploadImportFile(file)
  // 3. Lưu jobId, bắt đầu polling

// Polling interval: 3 giây
// Stop khi status = 'preview_ready' | 'completed' | 'failed'
// Timeout sau 5 phút → setState({ error: 'Import timed out' })
// Khi 'preview_ready' → setState({ step: 'preview', preview: data.preview })

// Toggle một row (warning row — coordinator có thể tick/untick)
toggleRow(rowIndex: number): void
  // Nếu rowIndex trong skippedRows → xóa ra (= include lại)
  // Nếu không có → thêm vào (= skip)

// Confirm import với current skippedRows
confirmImport(): Promise<void>
  // 1. gọi importRequestsService.confirmImport(jobId, [...skippedRows])
  // 2. setState({ step: 'processing' })
  // 3. Resume polling
  // 4. Khi 'completed' → setState({ step: 'result', jobStatus: data })
  // 5. Khi 'failed' → setState({ error: data.error })

// Download template (delegated)
downloadTemplate(format: 'csv' | 'xlsx'): void

// Reset về idle (close modal)
reset(): void
```

### Polling logic

```typescript
// useEffect với setInterval 3000ms
// Chạy khi: jobId !== null && step === 'processing'
// Cleanup interval khi unmount hoặc khi không cần poll nữa
// Max duration: 5 * 60 * 1000ms (5 phút)
```

---

## Types import

```typescript
import type {
  ImportPreviewResult,
  ImportJobStatusResponse,
  BulkImportJobEnqueuedResponse,
} from '@supportops/types';
```

---

## Quality Gate

```bash
pnpm --filter @supportops/web build
# Hoặc nhanh hơn:
pnpm --filter @supportops/web typecheck
```

**Phải pass 0 type errors trước khi báo Done.**

---

## Checklist

- [ ] `import-requests.service.ts` tạo mới với 4 methods
- [ ] Service dùng endpoints từ `@supportops/types` — không hardcode URL string
- [ ] `useImportRequests.ts` tạo mới với state machine đầy đủ
- [ ] Hook: polling interval 3s, stop khi `preview_ready` | `completed` | `failed`
- [ ] Hook: timeout sau 5 phút với error message
- [ ] Hook: `toggleRow` chỉ cho phép toggle WARNING rows (error rows luôn bị skip)
- [ ] Hook: `confirmImport` gửi đúng `[...skippedRows]` (error rows + unticked warning rows)
- [ ] Hook: `reset()` đưa state về initial
- [ ] File ≤ 120 lines (nếu vượt → tách hook con)
- [ ] `pnpm --filter @supportops/web build` → PASS
- [ ] `_STATUS.md` cập nhật → ✅ Done
