# TASK-401 — Backend: DTOs + Services + Controller + Module

**Phase:** 3 — Backend
**Depends on:** TASK-101 (types), TASK-201 (migration + seed), TASK-301 (worker types + queue name)
**Blocks:** TASK-501, TASK-502

---

## Mục tiêu

Implement 5 endpoints import mới trong `apps/api/src/modules/service-ops/request/`:
1. `GET /requests/import/template` — download template CSV/XLSX
2. `POST /requests/import/upload` — upload file, enqueue job, return jobId
3. `GET /requests/import/jobs/:jobId` — poll job status + preview/result
4. `POST /requests/import/jobs/:jobId/confirm` — confirm import (enqueue phase 2)
5. `POST /requests/bulk` — synchronous JSON bulk create

**Module structure bắt buộc** (thin controller, logic trong service):
```
apps/api/src/modules/service-ops/request/
├── request.module.ts                    ← SỬA: thêm providers + imports
├── request.controller.ts                ← SỬA: thêm 5 endpoints
├── request-import.service.ts            ← TẠO MỚI
├── request-bulk.service.ts              ← TẠO MỚI
└── dto/
    ├── bulk-create-request.dto.ts        ← TẠO MỚI
    ├── import-upload.dto.ts              ← TẠO MỚI
    ├── import-confirm.dto.ts             ← TẠO MỚI
    └── import-job-status-response.dto.ts ← TẠO MỚI
```

---

## 1. DTOs

### `dto/bulk-create-request.dto.ts`

```typescript
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested, ArrayMaxSize } from 'class-validator';
import { RequestPriority } from '@supportops/types';

export class BulkCreateRequestItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  serviceTypeCode: string;

  @IsEnum(RequestPriority)
  priority: RequestPriority;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsOptional()
  @IsEmail()
  reporterEmail?: string;
}

export class BulkCreateRequestDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BulkCreateRequestItemDto)
  items: BulkCreateRequestItemDto[];
}
```

---

### `dto/import-upload.dto.ts`

Dùng Multer — không có DTO class (validation ở service). File này có thể chỉ export type helper:

```typescript
// Multer file validation được thực hiện trong RequestImportService
// File size ≤ 5MB, MIME type: text/csv hoặc application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
export const IMPORT_ALLOWED_MIMETYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const IMPORT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

---

### `dto/import-confirm.dto.ts`

```typescript
import { IsArray, IsInt, Min } from 'class-validator';

export class ImportConfirmDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  skipRowIndices: number[];
}
```

---

### `dto/import-job-status-response.dto.ts`

Response DTO — chỉ dùng để document Swagger, không cần validate:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { ImportJobStatus, ImportPreviewResult, BulkImportResult } from '@supportops/types';

export class ImportJobStatusResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty({ enum: ['queued', 'preview_ready', 'processing', 'completed', 'failed'] })
  status: ImportJobStatus;

  @ApiProperty({ required: false })
  progress?: number;

  @ApiProperty({ required: false })
  preview?: ImportPreviewResult;

  @ApiProperty({ required: false })
  result?: BulkImportResult;

  @ApiProperty({ required: false })
  error?: string;
}
```

---

## 2. `request-import.service.ts` — TẠO MỚI

### Inject
- `PrismaService`
- `MinioStorageService` (hoặc tương đương hiện có — đọc `apps/api/src/common/storage/` trước)
- `Queue` from `@nestjs/bullmq` với queue name `IMPORT_REQUESTS`
- `Redis` client (nếu cần đọc job status từ Redis)

### Methods

#### `downloadTemplate(tenantId: string, format: 'csv' | 'xlsx'): Promise<Buffer>`

- Fetch `serviceType`s của tenant: `prisma.serviceType.findMany({ where: { tenantId, isActive: true }, select: { code: true, name: true } })`
- **CSV**: Tạo string với headers `title,description,serviceTypeCode,priority,locationId,reporterEmail` + 1 example row dùng serviceType đầu tiên
- **XLSX** (Design Decision D7 — sheet "Hướng dẫn"):
  - Sheet 1 "Data": cấu trúc giống CSV
  - Sheet 2 "Hướng dẫn":
    - Mô tả từng column (bắt buộc / tùy chọn)
    - Valid values cho `priority`: LOW, MEDIUM, HIGH, URGENT
    - Danh sách serviceTypeCode hợp lệ của tenant
    - Quy tắc reporterEmail: trống = người import; có điền = phải là member của tenant
    - 3 rows ví dụ
- Return Buffer

#### `uploadAndEnqueue(tenantId: string, userId: string, file: Express.Multer.File): Promise<BulkImportJobEnqueuedResponse>`

- Validate: MIME type phải là CSV hoặc XLSX — nếu không throw `BadRequestException('IMPORT_INVALID_FORMAT', ...)`
- Validate: size ≤ 5MB — nếu không throw `BadRequestException('IMPORT_FILE_TOO_LARGE', ...)`
- Generate `jobId = uuid()`
- Upload file lên MinIO: key = `imports/{tenantId}/{jobId}/original.{ext}`
- Enqueue BullMQ job phase 1:
  ```typescript
  await this.importQueue.add('import-requests', {
    phase: 1,
    jobId,
    tenantId,
    userId,
    fileKey: `imports/${tenantId}/${jobId}/original.${ext}`,
    mimeType: file.mimetype,
  });
  ```
- Return `{ jobId, status: 'queued', fileName: file.originalname, uploadedAt: new Date().toISOString() }`

#### `getJobStatus(tenantId: string, jobId: string): Promise<ImportJobStatusResponse>`

- Đọc job status từ BullMQ (hoặc Redis key nếu có lưu) — pattern tùy thuộc vào cách worker lưu status
- Verify `job.data.tenantId === tenantId` — nếu không throw `ForbiddenException('IMPORT_JOB_FORBIDDEN', ...)`
- Nếu không tìm thấy job: throw `NotFoundException('IMPORT_JOB_NOT_FOUND', ...)`
- Nếu status `preview_ready`: đọc preview từ Redis `import:preview:{jobId}` và include vào response
- Return `ImportJobStatusResponse`

#### `confirmJob(tenantId: string, userId: string, jobId: string, dto: ImportConfirmDto): Promise<{ jobId: string; status: 'queued' }>`

- Đọc current job status — verify `preview_ready`
- Nếu job đã confirmed: throw `ConflictException('IMPORT_JOB_ALREADY_CONFIRMED', ...)`
- Verify `job.data.tenantId === tenantId` — nếu không throw `ForbiddenException(...)`
- Enqueue phase 2 job:
  ```typescript
  await this.importQueue.add('import-requests', {
    phase: 2,
    jobId,
    tenantId,
    userId,
    fileKey: job.data.fileKey,
    mimeType: job.data.mimeType,
    skipRowIndices: dto.skipRowIndices,
  });
  ```
- Return `{ jobId, status: 'queued' }`

---

## 3. `request-bulk.service.ts` — TẠO MỚI

### Inject
- `PrismaService`

### Method: `bulkCreate(tenantId: string, userId: string, dto: BulkCreateRequestDto): Promise<BulkCreateRequestResult>`

Logic (synchronous):

1. Validate limit: `dto.items.length > 100` → throw `BadRequestException('BULK_ITEMS_LIMIT_EXCEEDED', ...)`
2. Extract unique `serviceTypeCode`s, batch lookup:
   ```typescript
   await prisma.serviceType.findMany({
     where: { tenantId, code: { in: uniqueCodes }, isActive: true },
     select: { id: true, code: true },
   });
   ```
3. Extract non-empty `reporterEmail`s, batch lookup:
   ```typescript
   await prisma.user.findMany({
     where: { tenantId, email: { in: nonEmptyEmails }, status: 'ACTIVE' },
     select: { id: true, email: true },
   });
   ```
4. Validate từng item:
   - `serviceTypeCode` không có trong lookup map → error `{ index, field: 'serviceTypeCode', message: ... }`
   - `reporterEmail` có điền nhưng không tìm thấy → error `{ index, field: 'reporterEmail', message: ... }`
5. Intra-array duplicate detection (Design Decision D6):
   - Group by `title + serviceTypeCode + reporterEmail`
   - Duplicate rows (sau row đầu) → error
6. Batch create valid items trong `$transaction`:
   ```typescript
   await prisma.$transaction(
     validItems.map((item) =>
       prisma.serviceRequest.create({
         data: {
           tenantId,    // ← từ JWT, không từ dto
           title: item.title,
           description: item.description ?? '',
           serviceTypeId: serviceTypeMap[item.serviceTypeCode],
           priority: item.priority,
           locationId: item.locationId,
           requesterId: item.reporterEmail
             ? reporterMap[item.reporterEmail]
             : userId,  // fallback to calling user
           status: 'SUBMITTED',
           sourceChannel: 'API',
         },
       }),
     ),
   );
   ```
7. Tạo AuditLog:
   ```typescript
   await prisma.auditLog.create({
     data: {
       tenantId,
       entityType: 'BulkImportJob',
       entityId: `bulk-${Date.now()}`,
       action: 'BULK_IMPORT_COMPLETED',
       actorId: userId,
       afterData: { created, failed, errors },
     },
   });
   ```
8. Return `{ created, failed, errors }`

---

## 4. Controller — SỬA `request.controller.ts`

Thêm 5 endpoints mới. Dùng `@ApiTags`, `@ApiBearerAuth`, `@Permissions`, `@CurrentTenant`, `@CurrentUser`.

```typescript
// GET /requests/import/template?format=csv|xlsx
@Get('import/template')
@Permissions({ all: ['request.import'] })
@Header('Content-Disposition', 'attachment')
async downloadTemplate(
  @CurrentTenant() tenantId: string,
  @Query('format') format: 'csv' | 'xlsx' = 'csv',
  @Res() res: Response,
): Promise<void>

// POST /requests/import/upload
@Post('import/upload')
@Permissions({ all: ['request.import'] })
@UseInterceptors(FileInterceptor('file'))
async uploadImportFile(
  @CurrentTenant() tenantId: string,
  @CurrentUser('sub') userId: string,
  @UploadedFile() file: Express.Multer.File,
)

// GET /requests/import/jobs/:jobId
@Get('import/jobs/:jobId')
@Permissions({ all: ['request.import'] })
async getImportJobStatus(
  @CurrentTenant() tenantId: string,
  @Param('jobId', ParseUUIDPipe) jobId: string,
)

// POST /requests/import/jobs/:jobId/confirm
@Post('import/jobs/:jobId/confirm')
@Permissions({ all: ['request.import'] })
async confirmImport(
  @CurrentTenant() tenantId: string,
  @CurrentUser('sub') userId: string,
  @Param('jobId', ParseUUIDPipe) jobId: string,
  @Body() dto: ImportConfirmDto,
)

// POST /requests/bulk
@Post('bulk')
@Permissions({ all: ['request.import'] })
async bulkCreate(
  @CurrentTenant() tenantId: string,
  @CurrentUser('sub') userId: string,
  @Body() dto: BulkCreateRequestDto,
)
```

> **KHÔNG** wrap response trong `{ data: ... }` — `ResponseTransformInterceptor` xử lý tự động.
> `GET /template` là exception — dùng `@Res()` để stream binary file, phải gọi `res.send(buffer)` thủ công.

---

## 5. Module — SỬA `request.module.ts`

```typescript
// Thêm vào imports: BullModule.registerQueue({ name: QUEUE_NAMES.IMPORT_REQUESTS })
// Thêm vào providers: RequestImportService, RequestBulkService
```

> Đọc module hiện tại trước để đảm bảo import đúng pattern.

---

## Security Checklist (bắt buộc verify từng endpoint)

| Endpoint | JwtAuthGuard | PermissionsGuard | `@Permissions('request.import')` | tenantId từ JWT | tenantId filter |
|---|---|---|---|---|---|
| GET /template | ✅ | ✅ | ✅ | ✅ | ✅ (serviceType lookup) |
| POST /upload | ✅ | ✅ | ✅ | ✅ | ✅ (fileKey) |
| GET /jobs/:id | ✅ | ✅ | ✅ | ✅ | ✅ (verify job.tenantId) |
| POST /jobs/:id/confirm | ✅ | ✅ | ✅ | ✅ | ✅ (verify job.tenantId) |
| POST /bulk | ✅ | ✅ | ✅ | ✅ | ✅ (all queries) |

---

## Test files cần tạo

### `request-import.service.spec.ts`

| Test case | Expected |
|---|---|
| Upload CSV hợp lệ | MinIO upload, enqueue job, return `{ jobId, status: 'queued' }` |
| Upload file > 5MB | throw `BadRequestException('IMPORT_FILE_TOO_LARGE')` |
| Upload file .txt | throw `BadRequestException('IMPORT_INVALID_FORMAT')` |
| GET job status completed | return `{ status: 'completed', result: { created, failed, errors } }` |
| GET job của tenant khác | throw `ForbiddenException('IMPORT_JOB_FORBIDDEN')` |
| Download template CSV | Buffer có đúng headers + example row |

### `request-bulk.service.spec.ts`

| Test case | Expected |
|---|---|
| 3 items hợp lệ | `{ created: 3, failed: 0 }`, 3 ServiceRequest với đúng tenantId |
| Item thiếu `title` | Bị reject bởi ValidationPipe trước khi vào service |
| `serviceTypeCode` không tồn tại | `{ created: 0, failed: 1, errors: [...] }` |
| `reporterEmail` không phải member | item failed với error rõ ràng |
| 101 items | throw `BadRequestException('BULK_ITEMS_LIMIT_EXCEEDED')` |
| EMPLOYEE role | 403 Forbidden |
| tenantId trong body bị inject | bị ignore — tenantId từ JWT được dùng |

---

## Quality Gate

```bash
pnpm --filter @supportops/api build
pnpm --filter @supportops/api test
```

**Cả hai phải pass 0 errors trước khi báo Done.**

---

## Checklist

- [ ] `dto/bulk-create-request.dto.ts` tạo mới
- [ ] `dto/import-upload.dto.ts` tạo mới (constants)
- [ ] `dto/import-confirm.dto.ts` tạo mới
- [ ] `dto/import-job-status-response.dto.ts` tạo mới
- [ ] `request-import.service.ts` tạo mới (4 methods)
- [ ] `request-bulk.service.ts` tạo mới (bulkCreate)
- [ ] `request.controller.ts` — 5 endpoints mới, mỗi endpoint có đúng guards
- [ ] `request.module.ts` — register 2 services mới + BullMQ queue
- [ ] `request-import.service.spec.ts` tạo mới
- [ ] `request-bulk.service.spec.ts` tạo mới
- [ ] Security checklist verify qua cho 5 endpoints
- [ ] `pnpm --filter @supportops/api build` → PASS
- [ ] `pnpm --filter @supportops/api test` → PASS
- [ ] `_STATUS.md` cập nhật → ✅ Done
