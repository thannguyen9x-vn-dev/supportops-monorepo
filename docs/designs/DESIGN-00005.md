# DESIGN-00005 — Bulk Import Service Requests

> **Ngày tạo:** 2026-04-07
> **Tạo bởi:** Tech Lead Agent
> **Status:** Draft
> **Requirement:** [REQ-00005.md](../requirements/REQ-00005.md)
> **Task tracking:** [AGENT_TASKS.md](../AGENT_TASKS.md)

---

## 1. Overview

Triển khai hai phương án import song song: (A) CSV/Excel file upload xử lý async qua BullMQ worker + in-app notification khi hoàn tất; (B) JSON bulk API xử lý synchronous trả về kết quả ngay lập tức. Worker (`apps/worker`) đã có BullMQ + Redis infrastructure — chỉ cần thêm queue `import-requests` và processor mới. Migration tối thiểu: thêm `BULK_IMPORT_COMPLETED` vào enum `NotificationEventType` để hỗ trợ in-app notification.

### Design Decisions (Tech Lead)

| # | Quyết định | Lý do |
|---|---|---|
| D1 | `/requests/bulk` JSON API = **synchronous** | AC-009 yêu cầu immediate response; ≤ 100 rows đủ nhanh (< 500ms). NFR-004 "tất cả async" được scope lại cho file import. |
| D2 | **Không tạo `ImportAuditLog` table** | Dùng `AuditLog` hiện có với `entityType: 'BulkImportJob'` — đủ đáp ứng FR-012 mà không cần migration mới. |
| D3 | `dueDate` **bỏ khỏi template MVP** | Không có trường tương ứng trong `ServiceRequest` schema. Đưa vào roadmap sau khi có migration riêng. |
| D4 | `reporterEmail` — **Hybrid rule** | Empty → dùng importing user làm requester. Có điền nhưng không tìm thấy trong tenant → skip row + báo lỗi. Lý do: nếu coordinator điền email cụ thể mà silently fallback sẽ tạo dữ liệu sai reporter mà không ai biết. |
| D5 | `request.import` là **permission mới** | Tách khỏi `request.create` để RBAC granular hơn. Assign cho OPS_COORDINATOR + TENANT_ADMIN. |
| D6 | **Duplicate detection — 2 loại** | (1) Intra-file: same `title + serviceTypeCode + reporterEmail` trong cùng file → hard error đỏ, bị skip. (2) Cross-import: same combination đã tạo trong 24h qua → warning vàng, coordinator có thể bỏ tick. Khác `requesterId` = KHÔNG phải duplicate. |
| D7 | Excel template có **sheet "Hướng dẫn"** | PO confirmed. Sheet 1 = data, Sheet 2 = hướng dẫn (mô tả columns, valid values, ví dụ). |
| D8 | **No retention policy** cho import audit log | MVP chưa có compliance requirement. Log lưu indefinitely trong `AuditLog` hiện có. Revisit khi có ISO 27001 / SOC 2 requirement. |

---

## 2. API Design

### 2.1 Phương án A — File Import

---

#### GET /requests/import/template

```
GET /api/v1/requests/import/template?format=csv|xlsx
Auth: Bearer JWT (required)
Permission: request.import

Query params:
  format: "csv" | "xlsx"  (default: "csv")

Response 200: file download (Content-Disposition: attachment)
  CSV: columns = title,description,serviceTypeCode,priority,locationId,reporterEmail
       Row 1 = headers, Row 2 = example row (generated với service types của tenant)

  XLSX: Sheet 1 "Data" — cấu trúc giống CSV ở trên
        Sheet 2 "Hướng dẫn" — gồm:
          - Mô tả từng column (bắt buộc / tùy chọn)
          - Valid values cho `priority`: LOW, MEDIUM, HIGH, URGENT
          - Danh sách serviceTypeCode hợp lệ của tenant (dynamic, lấy từ DB)
          - Quy tắc reporterEmail: để trống = người import; có điền = phải là member của tenant
          - Ví dụ 3 rows mẫu

Response 403:
  { "error": { "code": "PERMISSION_DENIED", "message": "Insufficient permissions" } }
```

---

#### POST /requests/import/upload

```
POST /api/v1/requests/import/upload
Auth: Bearer JWT (required)
Permission: request.import
Content-Type: multipart/form-data
Rate limit: 10 requests/phút per tenant

Request body (form):
  file: File  (CSV or .xlsx, max 5MB, max 500 rows)

Response 202:
{
  "data": {
    "jobId": "uuid",
    "status": "queued",
    "fileName": "import_2026-04-07.csv",
    "uploadedAt": "2026-04-07T10:00:00.000Z"
  }
}

Response 400:
{
  "error": {
    "code": "IMPORT_FILE_TOO_LARGE",
    "message": "File exceeds 5MB limit"
  }
}

Response 400:
{
  "error": {
    "code": "IMPORT_INVALID_FORMAT",
    "message": "Only .csv and .xlsx files are accepted"
  }
}
```

**Server flow:**
1. Validate: file type (csv/xlsx), size ≤ 5MB
2. Upload file lên MinIO: `imports/{tenantId}/{jobId}/original.{ext}`
3. Enqueue BullMQ job `import-requests` với data: `{ jobId, tenantId, userId, fileKey, mimeType }`
4. Return `{ jobId, status: 'queued' }` ngay lập tức

---

#### GET /requests/import/jobs/:jobId

```
GET /api/v1/requests/import/jobs/:jobId
Auth: Bearer JWT (required)
Permission: request.import

Path param: jobId (UUID)

Response 200 — still processing:
{
  "data": {
    "jobId": "uuid",
    "status": "processing",
    "progress": 45
  }
}

Response 200 — completed:
{
  "data": {
    "jobId": "uuid",
    "status": "completed",
    "result": {
      "totalRows": 50,
      "created": 48,
      "failed": 2,
      "errors": [
        { "row": 5, "field": "serviceTypeCode", "message": "serviceTypeCode 'IT_UNKNOWN' không tồn tại trong tenant" },
        { "row": 12, "field": "reporterEmail", "message": "reporterEmail 'unknown@example.com' không phải member của tenant" }
      ]
    }
  }
}

Response 200 — failed:
{
  "data": {
    "jobId": "uuid",
    "status": "failed",
    "error": "File parse error: invalid CSV format at row 3"
  }
}

Response 403: tenantId của job không khớp với caller
Response 404: job không tồn tại
```

---

### 2.2 Phương án B — JSON Bulk API

---

#### POST /requests/bulk

```
POST /api/v1/requests/bulk
Auth: Bearer JWT (required)
Permission: request.import
Content-Type: application/json

Request body:
{
  "items": [
    {
      "title": "Laptop bị lỗi màn hình",
      "description": "Màn hình xuất hiện đường kẻ ngang",
      "serviceTypeCode": "IT_HARDWARE",
      "priority": "HIGH",
      "locationId": "HN-FLOOR-3",
      "reporterEmail": "user@company.com"    // optional
    }
    // ... tối đa 100 items
  ]
}

Response 200:
{
  "data": {
    "created": 3,
    "failed": 1,
    "errors": [
      { "index": 2, "field": "serviceTypeCode", "message": "serviceTypeCode 'UNKNOWN' không tồn tại" }
    ]
  }
}

Response 400:
{
  "error": {
    "code": "BULK_ITEMS_LIMIT_EXCEEDED",
    "message": "Maximum 100 items per bulk request"
  }
}
```

**Server flow (synchronous):** Validate tất cả items → batch lookup serviceTypes → resolve reporterEmails → `prisma.$transaction` tạo tất cả valid requests → return summary.

---

---

#### POST /requests/import/jobs/:jobId/confirm

```
POST /api/v1/requests/import/jobs/:jobId/confirm
Auth: Bearer JWT (required)
Permission: request.import

Path param: jobId (UUID)

Request body:
{
  "skipRowIndices": [3, 7, 12]   // rows coordinator chọn KHÔNG import (0-based index)
                                 // empty array = import tất cả valid rows (bao gồm duplicate warnings)
}

Response 202:
{
  "data": {
    "jobId": "uuid",
    "status": "queued"
  }
}

Response 409 — job đã được confirm trước đó:
{
  "error": { "code": "IMPORT_JOB_ALREADY_CONFIRMED", "message": "Job already confirmed" }
}

Response 403 — job của tenant khác
Response 404 — job không tồn tại
```

**Flow:**
1. Worker phase 1 (sau upload): parse + validate → lưu preview result vào Redis key `import:preview:{jobId}` → job status = `preview_ready`
2. Frontend: poll đến `preview_ready` → hiển thị preview table
3. Coordinator review → bỏ tick duplicate warnings → nhấn "Confirm import"
4. FE gửi `POST /jobs/:jobId/confirm { skipRowIndices: [...] }`
5. API: validate job ownership → enqueue phase 2 job với `skipRowIndices` → trả về `{ status: 'queued' }`
6. Worker phase 2: tạo requests (bỏ qua các `skipRowIndices`) → tạo notification → xóa MinIO file

> **Lưu ý:** Flow 2 phases thay cho flow 1 phase ban đầu. Job status flow: `queued` → `preview_ready` → `processing` → `completed` | `failed`

---

### 2.3 Modified Endpoints

Không thay đổi endpoint hiện có.

---

## 3. Database Changes

### 3.1 Schema Changes

**Migration bắt buộc:** Thêm `BULK_IMPORT_COMPLETED` vào enum `NotificationEventType`.

```prisma
// apps/api/prisma/schema.prisma — chỉ thay đổi enum này

enum NotificationEventType {
  REQUEST_CREATED
  REQUEST_ASSIGNED
  REQUEST_STATUS_CHANGED
  REQUEST_COMMENTED
  REQUEST_MENTIONED
  SLA_NEAR_BREACH_RESPONSE
  SLA_NEAR_BREACH_RESOLUTION
  BULK_IMPORT_COMPLETED   // ← THÊM MỚI
}
```

> Lý do migration là cần thiết: AC-011b yêu cầu in-app notification khi job hoàn tất. `Notification.type` là NOT NULL enum → không thể dùng existing types mà không hack. Đây là migration nhỏ nhất có thể.

**Không cần table mới:** Import audit log dùng `AuditLog` hiện có:
```
entityType: "BulkImportJob"
entityId:   <jobId>
action:     "BULK_IMPORT_COMPLETED" | "BULK_IMPORT_FAILED"
actorId:    <userId>
afterData:  { totalRows, created, failed, errors: [...] }
```

### 3.2 Key Prisma Queries

```typescript
// Validate serviceTypeCodes cho import (batch lookup)
const validServiceTypes = await prisma.serviceType.findMany({
  where: {
    tenantId,                                    // ← LUÔN có tenantId
    code: { in: uniqueCodesFromFile },
    isActive: true,
  },
  select: { id: true, code: true },
});

// Resolve reporterEmails (batch lookup)
// Rule D4: chỉ lookup emails có điền — empty email sẽ fallback về importingUserId
const nonEmptyEmails = rowsWithEmail.map((r) => r.reporterEmail!);
const reporters = await prisma.user.findMany({
  where: {
    tenantId,                                    // ← LUÔN có tenantId
    email: { in: nonEmptyEmails },
    status: 'ACTIVE',
  },
  select: { id: true, email: true },
});
// reporterMap[email] = userId | undefined
// Row validation: nếu row.reporterEmail có điền nhưng không có trong reporterMap → skip row (error)
// Row validation: nếu row.reporterEmail rỗng → requesterId = importingUserId (fallback)

// Duplicate detection — intra-file (D6)
// Group rows by (title + serviceTypeCode + reporterEmail)
// Nếu count > 1 → tất cả duplicate rows được mark là ERROR (giữ row đầu tiên, skip các row sau)

// Duplicate detection — cross-import (D6)
// Batch check: tìm ServiceRequest tồn tại trong 24h qua cùng tenant
const recentRequests = await prisma.serviceRequest.findMany({
  where: {
    tenantId,                                    // ← LUÔN có tenantId
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    title: { in: validRows.map((r) => r.title) },
  },
  select: { title: true, serviceTypeId: true, requesterId: true },
});
// Nếu match (title + serviceTypeId + requesterId) → mark row là WARNING (vàng)
// Worker: WARNING rows vẫn được tạo trừ khi frontend gửi `skipRowIndices`

// Batch create requests (trong transaction — chỉ confirmed rows)
await prisma.$transaction(
  confirmedRows.map((row) =>
    prisma.serviceRequest.create({
      data: {
        tenantId,                                // ← inject từ JWT, không từ file
        title: row.title,
        description: row.description ?? '',
        serviceTypeId: serviceTypeMap[row.serviceTypeCode],
        priority: row.priority,
        locationId: row.locationId,
        requesterId: row.reporterEmail
          ? reporterMap[row.reporterEmail]       // đã validated — chắc chắn tồn tại
          : importingUserId,                     // fallback khi reporterEmail rỗng
        status: 'SUBMITTED',
        sourceChannel: 'API',
      },
    }),
  ),
);

// Tạo notification cho importing user khi job done
await prisma.notification.create({
  data: {
    tenantId,                                    // ← LUÔN có tenantId
    userId: importingUserId,
    type: 'BULK_IMPORT_COMPLETED',
    title: 'Import hoàn tất',
    body: `${created} requests đã được tạo, ${failed} lỗi.`,
    metadata: { jobId, created, failed },
  },
});
```

---

## 4. Types Contract

> Thêm vào `packages/types/` **trước khi implement** BE và FE.

### 4.1 New File: `packages/types/src/types/import.types.ts`

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

### 4.2 Update: `packages/types/src/service-ops/endpoints.ts`

```typescript
// Thêm vào SERVICE_OPS_ENDPOINTS.REQUESTS:
IMPORT_TEMPLATE: "/requests/import/template",
IMPORT_UPLOAD: "/requests/import/upload",
IMPORT_JOB_STATUS: (jobId: string) => `/requests/import/jobs/${jobId}`,
IMPORT_JOB_CONFIRM: (jobId: string) => `/requests/import/jobs/${jobId}/confirm`,
BULK_CREATE: "/requests/bulk",
```

### 4.3 Update: `packages/types/src/rbac.ts`

```typescript
// Thêm vào RBAC_PERMISSIONS:
REQUEST_IMPORT: "request.import",

// Thêm vào ROLE_PERMISSION_MATRIX:
// OPS_COORDINATOR: [...existing, RBAC_PERMISSIONS.REQUEST_IMPORT]
// TENANT_ADMIN: Object.values(RBAC_PERMISSIONS)  // đã có via spread — tự động
```

### 4.4 Update: `packages/types/src/enums/notification.enums.ts`

```typescript
// Thêm vào NotificationEventType enum:
BULK_IMPORT_COMPLETED = 'BULK_IMPORT_COMPLETED',
```

### 4.5 Update: `packages/types/src/index.ts`

```typescript
export * from './types/import.types';
```

---

## 5. Frontend Architecture

### 5.1 Route & Entry Point

Import không cần route riêng — dialog trigger từ trang Requests List hiện có.

```
apps/web/src/app/[locale]/(dashboard)/requests/
  └── page.tsx          ← Đã có — KHÔNG thay đổi
```

Import button được thêm vào `RequestListView.tsx` (chỉ visible với `request.import` permission).

### 5.2 Component Tree

```
RequestListView.tsx                          ← existing, thêm <ImportRequestButton>
  └── ImportRequestButton.tsx               ← ~25 lines, hiển thị theo permission
      └── ImportRequestModal.tsx            ← ~100 lines, orchestrates multi-step flow
          ├── ImportUploadStep.tsx           ← ~90 lines, file dropzone + template download
          ├── ImportPreviewStep.tsx          ← ~100 lines, preview table + row highlighting
          │   └── ImportPreviewTable.tsx     ← ~90 lines, MUI Table với checkbox per row
          └── ImportResultStep.tsx          ← ~60 lines, success/fail/skipped summary
```

**Tất cả components nằm trong:**
```
apps/web/src/features/service-ops/requests/components/import/
├── ImportRequestButton.tsx     ← ~25 lines
├── ImportRequestModal.tsx      ← ~100 lines  (dùng FormDialog từ @supportops/ui-dialog)
├── ImportUploadStep.tsx        ← ~90 lines   (dùng FileUploadField từ @supportops/ui-file-upload)
├── ImportPreviewStep.tsx       ← ~100 lines  (orchestrate table + confirm action)
├── ImportPreviewTable.tsx      ← ~90 lines   (MUI Table: đỏ=error, vàng=warning, checkbox để untick)
└── ImportResultStep.tsx        ← ~60 lines
```

**Màu sắc trong preview table:**
- Row đỏ = validation error (bị skip tự động, không thể tick)
- Row vàng = duplicate warning (mặc định bỏ tick, coordinator có thể tick lại để override)
- Row trắng = hợp lệ (mặc định được tick)

### 5.3 Hook

```
apps/web/src/features/service-ops/requests/hooks/useImportRequests.ts  ← ~120 lines
```

```typescript
// State machine: idle → uploading → previewing → confirming → result | error
// Mutations:
//   - uploadImportFile(file: File): Promise<{ jobId }>
//   - pollJobStatus(jobId: string): void  (interval 3s, stops when status=completed/failed)
//   - confirmImport(jobId: string, skipRowIndices: number[]): void
//     → skipRowIndices = rows coordinator đã bỏ tick (gồm duplicate warnings bị skip)
//   - downloadTemplate(format: 'csv' | 'xlsx'): void
// State:
//   - step: 'upload' | 'processing' | 'preview' | 'result'
//   - preview: ImportPreviewResult | null   (errors + warnings)
//   - skippedRows: Set<number>              (rows coordinator bỏ tick)
//   - jobStatus: ImportJobStatusResponse | null
//   - isUploading: boolean
//   - error: string | null
```

### 5.4 Service

```
apps/web/src/features/service-ops/requests/services/import-requests.service.ts  ← ~60 lines
```

```typescript
// API calls:
// downloadTemplate(format): void
//   → GET /requests/import/template?format=csv|xlsx
// uploadImportFile(file): Promise<BulkImportJobEnqueuedResponse>
//   → POST /requests/import/upload
// getJobStatus(jobId): Promise<ImportJobStatusResponse>
//   → GET /requests/import/jobs/:jobId
// confirmImport(jobId, skipRowIndices): Promise<BulkImportJobEnqueuedResponse>
//   → POST /requests/import/jobs/:jobId/confirm  { skipRowIndices: number[] }
```

### 5.5 i18n Keys (en.json + vi.json)

```json
{
  "requests.import.button": "Import",
  "requests.import.modal.title": "Import Service Requests",
  "requests.import.upload.title": "Upload CSV or Excel file",
  "requests.import.upload.hint": "Max 5MB · Max 500 rows · CSV or .xlsx",
  "requests.import.upload.downloadTemplate": "Download Template",
  "requests.import.processing.title": "Processing import...",
  "requests.import.processing.hint": "You will receive a notification when done.",
  "requests.import.result.success": "{{count}} requests created successfully",
  "requests.import.result.errors": "{{count}} rows failed",
  "requests.import.result.errorDetail": "Row {{row}}: {{message}}",
  "requests.import.preview.title": "Review before importing",
  "requests.import.preview.validRows": "{{count}} rows ready to import",
  "requests.import.preview.errorRows": "{{count}} rows with errors (will be skipped)",
  "requests.import.preview.warningRows": "{{count}} possible duplicates",
  "requests.import.preview.duplicateInFile": "Duplicate row within this file",
  "requests.import.preview.duplicateRecent": "Similar request created in the last 24 hours",
  "requests.import.preview.confirmButton": "Import {{count}} rows",
  "requests.import.error.fileTooLarge": "File must be under 5MB",
  "requests.import.error.invalidFormat": "Only .csv and .xlsx files are supported",
  "requests.import.error.reporterNotFound": "Reporter email '{{email}}' is not a member of this tenant"
}
```

---

## 6. Worker Changes (`apps/worker`)

Worker đã có BullMQ + Redis infrastructure. Chỉ cần thêm:

### 6.1 `apps/worker/src/config.ts`

```typescript
export const QUEUE_NAMES = {
  // ... existing ...
  IMPORT_REQUESTS: 'import-requests',   // ← THÊM
} as const;
```

### 6.2 New File: `apps/worker/src/jobs/import-requests.job.ts`

```typescript
// Phase 1 job data (sau upload)
export interface ImportRequestsPhase1JobData {
  phase: 1;
  jobId: string;
  tenantId: string;
  userId: string;
  fileKey: string;     // MinIO: imports/{tenantId}/{jobId}/original.{ext}
  mimeType: string;
}

// Phase 2 job data (sau confirm)
export interface ImportRequestsPhase2JobData {
  phase: 2;
  jobId: string;
  tenantId: string;
  userId: string;
  fileKey: string;
  mimeType: string;
  skipRowIndices: number[];  // rows coordinator muốn bỏ qua
}

export type ImportRequestsJobData = ImportRequestsPhase1JobData | ImportRequestsPhase2JobData;

// Phase 1 Processor:
// 1. Download file từ MinIO
// 2. Parse CSV (csv-parse) hoặc Excel (exceljs) → rows[]
// 3. Validate required fields, serviceTypeCode (tenantId filter), priority enum
// 4. reporterEmail rule D4: empty → null (will use importingUser); filled not found → error row
// 5. Duplicate check — intra-file: group by (title+serviceTypeCode+reporterEmail) → error nếu count > 1
// 6. Duplicate check — cross-import: query last 24h (tenantId filter) → warning nếu match
// 7. Lưu preview result vào Redis: SET import:preview:{jobId} <json> EX 3600
// 8. Update job status → 'preview_ready'

// Phase 2 Processor:
// 1. Load preview từ Redis: GET import:preview:{jobId}
// 2. Filter out: error rows + skipRowIndices
// 3. prisma.$transaction — batch create ServiceRequest (tenantId từ jobData, không từ file)
// 4. prisma.auditLog.create — entityType: 'BulkImportJob', action: 'BULK_IMPORT_COMPLETED'
// 5. prisma.notification.create — type: 'BULK_IMPORT_COMPLETED', userId từ jobData
// 6. MinIO delete temp file
// 7. DEL import:preview:{jobId} từ Redis
```

### 6.3 `apps/worker/src/worker-runtime.ts`

```typescript
// Thêm worker mới vào startWorkers():
workers.push(
  new Worker(
    QUEUE_NAMES.IMPORT_REQUESTS,
    async (job: Job) => {
      await processImportRequestsJob(job.data as ImportRequestsJobData, { prisma });
    },
    { connection },
  ),
);
```

### 6.4 New npm dependencies (worker)

| Package | Version | Lý do | Alternatives xem xét |
|---|---|---|---|
| `csv-parse` | ^5.x | Streaming CSV parse, TypeScript native, 0 deps | `papaparse` (browser-focused), `fast-csv` (similar) |
| `exceljs` | ^4.x | Read/write .xlsx, streaming support, active maintenance | `xlsx` (SheetJS) — license concerns (bản free), `node-xlsx` (simpler but less control) |

> **Lưu ý:** `exceljs` có thể đã có trong `apps/ai-service` (dùng cho export). Check trước khi add mới. Nếu đã có trong workspace root hoặc ai-service, hoist lên root để tránh duplicate.

---

## 7. Backend Module Structure

```
apps/api/src/modules/service-ops/request/
├── request.module.ts              ← Thêm RequestImportService vào providers
├── request.controller.ts          ← Thêm 5 endpoints mới
├── request-import.service.ts      ← NEW: upload, template gen, job status, confirm
├── request-bulk.service.ts        ← NEW: synchronous bulk create
└── dto/
    ├── bulk-create-request.dto.ts       ← NEW
    ├── import-upload.dto.ts             ← NEW (Multer validation)
    ├── import-confirm.dto.ts            ← NEW { skipRowIndices: number[] }
    └── import-job-status-response.dto.ts ← NEW (response)
```

### Security Checklist — mỗi endpoint mới

| Endpoint | `JwtAuthGuard` | `PermissionsGuard` | `@Permissions()` | `tenantId` từ JWT | `tenantId` filter | Response DTO | Typed exception |
|---|---|---|---|---|---|---|---|
| `GET /template` | ✅ | ✅ | `request.import` | ✅ | ✅ (serviceType lookup) | ✅ | ✅ |
| `POST /upload` | ✅ | ✅ | `request.import` | ✅ | ✅ | ✅ | ✅ |
| `GET /jobs/:id` | ✅ | ✅ | `request.import` | ✅ | ✅ (verify job.tenantId) | ✅ | ✅ |
| `POST /jobs/:id/confirm` | ✅ | ✅ | `request.import` | ✅ | ✅ (verify job.tenantId) | ✅ | ✅ |
| `POST /bulk` | ✅ | ✅ | `request.import` | ✅ | ✅ | ✅ | ✅ |

---

## 8. Implementation Order

> Thực hiện theo thứ tự — mỗi step là 1 PR.

```
Step 1: Types
  [ ] packages/types/src/types/import.types.ts  — tạo mới
  [ ] packages/types/src/rbac.ts               — thêm REQUEST_IMPORT permission
  [ ] packages/types/src/service-ops/endpoints.ts — thêm import endpoints
  [ ] packages/types/src/enums/notification.enums.ts — thêm BULK_IMPORT_COMPLETED
  [ ] packages/types/src/index.ts              — re-export
  [ ] pnpm typecheck (packages/types)

Step 2: DB Migration
  [ ] Cập nhật apps/api/prisma/schema.prisma   — thêm BULK_IMPORT_COMPLETED
  [ ] prisma migrate dev --name add-bulk-import-notification
  [ ] Cập nhật seed nếu cần (AuthPermission: thêm 'request.import')
  [ ] Cập nhật seed: assign permission cho OPS_COORDINATOR role

Step 3: Worker — import-requests queue
  [ ] apps/worker/src/config.ts               — thêm IMPORT_REQUESTS queue name
  [ ] apps/worker/src/jobs/import-requests.job.ts — tạo mới (phase 1 + phase 2 processor)
  [ ] apps/worker/src/jobs/import-requests.job.test.ts — unit tests
  [ ] apps/worker/src/worker-runtime.ts       — register new Worker
  [ ] pnpm --filter @supportops/worker build + test

Step 4: Backend
  [ ] dto/bulk-create-request.dto.ts               — tạo mới
  [ ] dto/import-upload.dto.ts                     — tạo mới
  [ ] dto/import-confirm.dto.ts                    — tạo mới { skipRowIndices }
  [ ] dto/import-job-status-response.dto.ts        — tạo mới
  [ ] request-import.service.ts                    — MinIO upload, template gen (có sheet Hướng dẫn), job enqueue, status, confirm
  [ ] request-bulk.service.ts                      — synchronous bulk validate + create (duplicate check intra-array)
  [ ] request.controller.ts                        — 5 endpoints mới
  [ ] request.module.ts                            — register services
  [ ] pnpm --filter @supportops/api build + test

Step 5: Frontend
  [ ] services/import-requests.service.ts          — tạo mới (+ confirmImport method)
  [ ] hooks/useImportRequests.ts                   — tạo mới (state machine với preview step)
  [ ] components/import/ImportRequestButton.tsx
  [ ] components/import/ImportRequestModal.tsx
  [ ] components/import/ImportUploadStep.tsx
  [ ] components/import/ImportPreviewStep.tsx
  [ ] components/import/ImportPreviewTable.tsx     — tạo mới (checkbox per row, màu đỏ/vàng/trắng)
  [ ] components/import/ImportResultStep.tsx
  [ ] RequestListView.tsx                          — thêm ImportRequestButton
  [ ] i18n: en.json + vi.json                     — thêm keys
  [ ] pnpm --filter @supportops/web build + test

Step 6: Wire + Smoke Test
  [ ] E2E flow: upload CSV → poll jobId → notification received
  [ ] E2E flow: POST /requests/bulk → immediate result
  [ ] pnpm typecheck (toàn monorepo)
  [ ] pnpm lint (toàn monorepo)
```

---

## 9. Testing Plan

### 9.1 Backend — `request-import.service.spec.ts`

| Test case | Expected |
|---|---|
| Upload CSV hợp lệ (< 5MB, < 500 rows) | Upload lên MinIO, enqueue job, return `{ jobId, status: 'queued' }` |
| Upload file > 5MB | throw `BadRequestException('IMPORT_FILE_TOO_LARGE')` |
| Upload file type .txt | throw `BadRequestException('IMPORT_INVALID_FORMAT')` |
| GET job status — job completed | return `{ status: 'completed', result: { created, failed, errors } }` |
| GET job của tenant khác | throw `ForbiddenException('IMPORT_JOB_FORBIDDEN')` |
| Download template CSV | Response có đúng headers, row ví dụ chứa valid serviceTypeCode của tenant |

### 9.2 Backend — `request-bulk.service.spec.ts`

| Test case | Expected |
|---|---|
| 3 items hợp lệ | `{ created: 3, failed: 0, errors: [] }`, 3 ServiceRequest được tạo với đúng tenantId |
| Item thiếu `title` | item đó failed, các item khác vẫn created |
| `serviceTypeCode` không tồn tại trong tenant | item failed, error message rõ ràng |
| `reporterEmail` không phải member của tenant | item failed với clear error |
| 101 items (vượt limit) | throw `BadRequestException('BULK_ITEMS_LIMIT_EXCEEDED')` |
| EMPLOYEE role gọi endpoint | `403 Forbidden` |
| tenantId trong body bị inject | bị ignore — tenantId từ JWT được dùng |

### 9.3 Worker — `import-requests.job.spec.ts` (unit)

| Test case | Expected |
|---|---|
| **Phase 1** — Parse CSV 5 rows hợp lệ | Preview result lưu vào Redis, status = `preview_ready`, 0 errors, 0 warnings |
| **Phase 1** — Row có serviceTypeCode không hợp lệ | Row đó → error, valid rows → preview_ready |
| **Phase 1** — `reporterEmail` để trống | requesterId = importingUserId (fallback), không phải error |
| **Phase 1** — `reporterEmail` có điền, không tìm thấy | Row đó → error với message rõ ràng |
| **Phase 1** — 2 rows giống nhau (intra-file) | Row thứ 2 → error `duplicate_in_file` |
| **Phase 1** — Row trùng request được tạo < 24h trước | Row đó → warning `duplicate_recent` |
| **Phase 1** — File parse error (malformed CSV) | Job status = failed |
| **Phase 2** — Confirm với skipRowIndices = [] | Tất cả valid rows được tạo, AuditLog ghi, Notification tạo |
| **Phase 2** — Confirm với skipRowIndices = [2, 4] | Row index 2 và 4 bị bỏ qua, các row khác được tạo |
| **Phase 2** — Redis preview key expired | throw error, job fails |
| Job completion → notification | `Notification.type = 'BULK_IMPORT_COMPLETED'` tạo đúng userId, đúng tenantId |

### 9.4 Frontend — Component Tests

| Component | Test cases |
|---|---|
| `ImportRequestButton` | Visible với `request.import` permission; ẩn với EMPLOYEE role |
| `ImportUploadStep` | File > 5MB → client-side error trước khi upload; .xlsx → accepted; .txt → rejected |
| `ImportPreviewTable` | Error rows = đỏ + disabled checkbox; warning rows = vàng + unchecked by default; valid rows = trắng + checked; coordinator tick warning row → included in confirm |
| `ImportPreviewStep` | "Import N rows" button count phản ánh đúng số rows đang được tick; click confirm → gọi `confirmImport` với đúng `skipRowIndices` |
| `ImportResultStep` | Hiển thị created / failed / skipped counts; "Close" dismiss modal |
| `useImportRequests` | idle→uploading→preview_ready (show preview)→confirming→completed; polling stops khi `preview_ready`; polling resume sau confirm; polling stops khi `completed`/`failed` |

---

## 10. Risks & Constraints

| Risk | Mức độ | Mitigation |
|---|---|---|
| Memory spike nếu parse file lớn trong worker memory | High | Dùng streaming mode của `csv-parse` và `exceljs`; hard limit 5MB + 500 rows trước khi upload |
| `tenantId` bị inject qua file content (security) | High | **Luôn** lấy `tenantId` từ JWT trong worker job data, không đọc từ file |
| Worker process crash giữa chừng → job stuck | Medium | BullMQ auto-retry (max 3 attempts); orphaned MinIO files được cleanup sau 24h via lifecycle policy |
| MinIO temp file không được xóa nếu worker crash | Low | Add cleanup job hoặc MinIO object lifecycle rule `imports/*` expire 24h |
| `exceljs` parse file Excel giả mạo (zip bomb) | Medium | Validate file signature + MIME type; set `exceljs` file size limit trước khi open |
| Rate limit bypass qua nhiều requests nhỏ | Low | Implement per-tenant rate limit middleware (Redis-backed) trên `POST /upload` |
| Coordinator confirm duplicate warning rows → vẫn tạo request trùng | Low | Đây là intended behavior (override), nhưng cần document rõ trong sheet "Hướng dẫn" của template |
| Redis preview key expire trước khi coordinator confirm (TTL 1h) | Low | Session timeout warning ở FE sau 50 phút; nếu expire → user phải upload lại |
| Job status polling quá nhiều → API overload | Low | Frontend poll interval ≥ 3s; stop polling sau max 5 phút (timeout error) |

---

## 11. Forbidden Actions

- [x] KHÔNG tạo migration mới ngoài `BULK_IMPORT_COMPLETED` enum value
- [x] KHÔNG tạo `ImportAuditLog` table mới — dùng `AuditLog` hiện có
- [x] KHÔNG sửa legacy modules (`billing`, `invoice`, `kanban`, `message`, `product`, `subscription`)
- [x] KHÔNG thêm npm dependency mới mà không note lý do (đã note tại §6.4)
- [x] KHÔNG đọc `tenantId` từ file upload — luôn từ JWT
- [x] KHÔNG bỏ `tenantId` filter trên bất kỳ Prisma query nào
- [x] KHÔNG thiếu `@Permissions({ all: ['request.import'] })` trên bất kỳ endpoint mới nào
- [x] KHÔNG return raw Prisma object — luôn qua response DTO

---

## 12. Tóm tắt cho PO

### Implementation Order ưu tiên

```
1. Types + Permission   (1 ngày)  → unblock tất cả subsequent steps
2. DB Migration         (0.5 ngày)
3. Worker job           (1.5 ngày)
4. Backend endpoints    (2 ngày)
5. Frontend UI          (2 ngày)
6. Wire + test          (1 ngày)
                Total:  ~8 ngày dev
```

### Dependencies cần unlock trước

| Dependency | Status | Action |
|---|---|---|
| `apps/worker` BullMQ + Redis | ✅ **ĐÃ CÓ** — không phải placeholder | Chỉ cần add queue name + processor |
| MinIO đang hoạt động | ✅ Đã có (dùng cho file upload) | Không cần setup mới |
| `csv-parse` + `exceljs` | ❓ Chưa confirm có trong worker | Check package.json trước khi add |

> **Good news cho PO:** Worker KHÔNG phải "❌ TODO placeholder" như REQ ghi. Worker đã có BullMQ + Redis + SLA monitoring đang chạy. Đây giảm thiểu đáng kể risk của Step 3.

### Quyết định đã confirmed (2026-04-07)

| # | Quyết định |
|---|---|
| Q3 | Hybrid: `reporterEmail` rỗng → fallback về importing user; có điền nhưng not found → skip row + error ✅ |
| Q4 | No retention policy cho MVP; revisit khi có compliance requirement ✅ |
| Q5 | Excel template có sheet "Hướng dẫn" ✅ |
| Duplicate | Intra-file → hard error (đỏ); cross-import 24h → warning vàng, coordinator có thể override ✅ |

### Không còn open questions — DESIGN sẵn sàng để implement
