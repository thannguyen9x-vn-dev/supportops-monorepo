# _CONTEXT.md — v5 (DESIGN-00005: Bulk Import Service Requests)

## Cách dùng hệ thống task

1. Đọc file này trước — nắm rõ phase, gate, và quy tắc bất biến
2. Đọc file TASK tương ứng được assign
3. Implement theo spec trong task (không tự diễn giải thêm)
4. Chạy quality gate được chỉ định ở cuối task
5. Cập nhật `_STATUS.md` → ✅ Done
6. Báo cáo theo format ở cuối file này

---

## Files bắt buộc đọc trước khi bắt đầu (theo thứ tự)

| # | File | Mục đích |
|---|---|---|
| 1 | `docs/designs/DESIGN-00005.md` | Source of truth: API contracts, component tree, worker design, implementation order |
| 2 | `docs/requirements/REQ-00005.md` | Acceptance criteria — đối chiếu khi hoàn thành |
| 3 | `AGENTS.md` (root) | Architectural principles: multi-tenancy, response format, git conventions |
| 4 | `apps/api/AGENTS.md` | BE conventions: thin controller, typed exceptions, PermissionsGuard, no raw Error |
| 5 | `apps/web/AGENTS.md` | FE conventions: component size limits, UI package checklist, layer diagram |

---

## Stack

| Layer | Tech | App |
|---|---|---|
| **Types** | TypeScript | `packages/types/src/` |
| **DB Migration** | Prisma + PostgreSQL | `apps/api/prisma/` |
| **Worker** | BullMQ + Redis + csv-parse + exceljs | `apps/worker/src/` |
| **Backend** | NestJS + TypeScript + Prisma + MinIO | `apps/api/src/modules/service-ops/request/` |
| **Frontend** | Next.js 15 (App Router) + TypeScript + MUI | `apps/web/src/features/service-ops/requests/` |

---

## Thứ tự thực hiện (Phase Diagram)

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1 — Types Contract                                     │
│  TASK-101: import.types.ts + endpoints + rbac + enums        │
└──────────────────────────────────┬───────────────────────────┘
                                   │
               ┌───────────────────┴────────────────────┐
               │ GATE: pnpm --filter @supportops/types typecheck │
               └───────────────────┬────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
┌─────────────▼──────────────────┐  ┌──────────────────▼──────────────────┐
│  PHASE 2A — DB Migration        │  │  PHASE 2B — Worker                   │
│  TASK-201: schema.prisma enum   │  │  TASK-301: import-requests job        │
│            migrate + seed       │  │            (phase 1 + phase 2         │
│                                 │  │             processor + register)     │
└─────────────┬──────────────────┘  └──────────────────┬──────────────────┘
              │                                         │
              │ GATE: prisma migrate dev OK             │ GATE: worker build + test
              └──────────────────┬──────────────────────┘
                                 │
              ┌──────────────────▼──────────────────────────────┐
              │  PHASE 3 — Backend                               │
              │  TASK-401: DTOs + services + controller + module │
              └──────────────────┬──────────────────────────────┘
                                 │
              ┌──────────────────┴──────────────────────┐
              │ GATE: pnpm --filter @supportops/api build + test │
              └──────────────────┬──────────────────────┘
                                 │
              ┌──────────────────┴──────────────────────────────┐
              │  PHASE 4 — Frontend                              │
              │  TASK-501: Service + Hook                        │
              │     ↓                                            │
              │  TASK-502: Components (button→modal→steps→table) │
              └──────────────────┬──────────────────────────────┘
                                 │
              ┌──────────────────┴──────────────────────┐
              │ GATE: pnpm --filter @supportops/web build + test │
              └──────────────────┬──────────────────────┘
                                 │
              ┌──────────────────▼──────────────────────────────┐
              │  PHASE 5 — Wire + Smoke Test                     │
              │  TASK-601: E2E smoke + typecheck + lint          │
              └──────────────────────────────────────────────────┘
```

**Lưu ý song song:**
- TASK-201 (DB migration) và TASK-301 (Worker) KHÔNG phụ thuộc nhau → có thể làm song song sau PHASE 1
- TASK-401 cần cả TASK-201 (migration) và TASK-301 (worker types) xong mới bắt đầu
- TASK-501 (FE service+hook) cần TASK-101 xong, không cần TASK-401 xong hoàn toàn — nhưng cần endpoint chạy được để test tay
- TASK-502 (FE components) cần TASK-501 xong trước

---

## Quy tắc bất biến (copy từ AGENTS.md)

### Multi-tenancy — KHÔNG thể thương lượng
- `tenantId` LUÔN lấy từ JWT claims (`@CurrentTenant()` decorator)
- **KHÔNG BAO GIỜ** đọc `tenantId` từ file upload hoặc request body
- Mọi Prisma query trên tenant-scoped data PHẢI có `where: { tenantId }` — không có ngoại lệ
- Worker: `tenantId` lấy từ `job.data.tenantId` (được inject từ API khi enqueue) — không đọc từ file content

### Types Contract — packages/types là nguồn sự thật
- FE và BE đều lấy types từ `@supportops/types`
- Thêm endpoint mới → update `packages/types/src/service-ops/endpoints.ts` TRƯỚC
- Không hardcode endpoint string trong FE service

### Controller — thin, không có logic
- Controller chỉ parse params + gọi service + return
- Mọi business logic nằm trong service

### Exception — dùng typed exceptions
```typescript
// Good
throw new NotFoundException('IMPORT_JOB_NOT_FOUND', 'Job not found');
throw new ForbiddenException('IMPORT_JOB_FORBIDDEN', 'Job belongs to another tenant');
throw new BadRequestException('IMPORT_FILE_TOO_LARGE', 'File exceeds 5MB limit');
// Bad
throw new Error('not found');
throw new HttpException('Forbidden', 403);
```

### Response format — KHÔNG tự wrap `{ data: ... }`
- `ResponseTransformInterceptor` xử lý tự động
- Return raw object/array từ service/controller là đủ

### Frontend — layer diagram bắt buộc
```
Page → Component → Hook → Service → apiClient → Backend
```
- Không import `apiClient` trực tiếp vào component
- Không hardcode URL — dùng endpoints từ `@supportops/types`
- UI text qua `next-intl` — không inline string

### Frontend — kiểm tra UI package trước khi tạo mới
Trước khi tạo component, kiểm tra:
- Modal/dialog → `FormDialog` từ `@supportops/ui-dialog` + `useDialog` từ `@supportops/ui`
- File upload → `FileUploadField` từ `@supportops/ui-file-upload`
- Toast → `useToast` từ `@supportops/ui`
- Form fields → `@supportops/ui-form`

### Component size limits (apps/web/AGENTS.md)
| Loại file | Giới hạn |
|---|---|
| `page.tsx` | ≤ 50 lines |
| View component `*View.tsx` | ≤ 150 lines |
| Section component | ≤ 100 lines |
| Hook `use*.ts` | ≤ 120 lines |

### Security — mọi import endpoint phải có
- `JwtAuthGuard` + `PermissionsGuard` + `@Permissions({ all: ['request.import'] })`
- Rate limit trên `POST /upload`: 10 req/phút per tenant
- Validate file type + size server-side (không tin client-side validation)

---

## Quality Gates

| Gate | Command | Thời điểm chạy |
|---|---|---|
| Types typecheck | `pnpm --filter @supportops/types typecheck` | Sau TASK-101 |
| DB migration | `cd apps/api && npx prisma migrate dev --name add-bulk-import-notification` | Sau TASK-201 |
| Worker build | `pnpm --filter @supportops/worker build` | Sau TASK-301 |
| Worker test | `pnpm --filter @supportops/worker test` | Sau TASK-301 |
| API build | `pnpm --filter @supportops/api build` | Sau TASK-401 |
| API test | `pnpm --filter @supportops/api test` | Sau TASK-401 |
| Web build | `pnpm --filter @supportops/web build` | Sau TASK-502 |
| Web test | `pnpm --filter @supportops/web test` | Sau TASK-502 |
| Full typecheck | `pnpm typecheck` | Sau TASK-601 |
| Full lint | `pnpm lint` | Sau TASK-601 |

---

## Format báo cáo sau mỗi task

```
## TASK-XXX — [Tên task] ✅ Done

**Files đã tạo/sửa:**
- path/to/file.ts (tạo mới / sửa)

**Quality gate:**
- [x] pnpm --filter @supportops/xxx build → PASS

**Lưu ý / Deviation:**
- (nếu có điểm nào khác với spec trong DESIGN-00005 — giải thích lý do)

**Bước tiếp theo:**
- TASK-XXX có thể bắt đầu
```
