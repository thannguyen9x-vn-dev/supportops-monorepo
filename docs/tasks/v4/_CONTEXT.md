# _CONTEXT.md — v1 (DESIGN-00004: Export Báo Cáo CSV / Excel / PDF)

## Cách dùng hệ thống task

1. Đọc file này trước — nắm rõ phase, gate, và quy tắc bất biến
2. Đọc file TASK tương ứng được assign
3. Implement theo spec trong task (không tự giải thích thêm)
4. Chạy quality gate được chỉ định
5. Cập nhật `_STATUS.md` → ✅ Done
6. Báo cáo theo format ở cuối file này

---

## Files bắt buộc đọc trước khi bắt đầu (theo thứ tự)

| # | File | Mục đích |
|---|---|---|
| 1 | `docs/designs/DESIGN-00004.md` | Source of truth: API contract, component tree, spec đầy đủ |
| 2 | `docs/requirements/REQ-00004.md` | Acceptance criteria — đối chiếu khi xong |
| 3 | `AGENTS.md` (root) | Architectural principles: multi-tenancy, response format, conventions |
| 4 | `apps/api/AGENTS.md` | BE conventions: thin controller, typed exceptions, PermissionsGuard |
| 5 | `apps/web/AGENTS.md` | FE conventions: component size limits, UI package checklist |

Nếu làm task Python: đọc thêm `apps/ai-service/db/queries.py` để hiểu data shape trả về từ `get_report_data()`.

---

## Stack

| Layer | Tech |
|---|---|
| **Types** | TypeScript — `packages/types/src/` |
| **Python Service** | FastAPI + asyncpg — `apps/ai-service/` |
| **Backend** | NestJS + TypeScript + Prisma — `apps/api/` |
| **Frontend** | Next.js 15 (App Router) + TypeScript + MUI — `apps/web/` |
| **Worker** | Không có — export là sync streaming |

---

## Thứ tự thực hiện (Phase Diagram)

```
┌─────────────────────────────────────────────────┐
│  PHASE 1 — Types Contract                        │
│  TASK-101: Export types + endpoints constant      │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┴──────────────┐
          │ GATE: pnpm --filter @supportops/types typecheck │
          └────────────┬──────────────┘
                       │
       ┌───────────────┴────────────────────────┐
       │                                        │
┌──────▼──────────────────────┐   ┌─────────────▼────────────────┐
│  PHASE 2 — Python Service   │   │  PHASE 3 — NestJS Backend     │
│  TASK-401: Python exporters │   │  TASK-301: Permission seed    │
│     ↓                       │   │     ↓                         │
│  TASK-402: Python router    │   │  TASK-302: Export module      │
└──────────────────────────── ┘   └──────────────────────────────┘
          │                                        │
          │          GATE: pytest + pnpm build     │
          └───────────────────┬────────────────────┘
                              │
          ┌───────────────────▼──────────────────────┐
          │  PHASE 4 — Frontend                       │
          │  TASK-501: Service + Hook                 │
          │     ↓                                     │
          │  TASK-502: Components                     │
          │     ↓                                     │
          │  TASK-503: Route + Navigation + i18n      │
          └───────────────────────────────────────────┘
                              │
             GATE: pnpm build + pnpm test (web)
```

**Lưu ý song song:**
- TASK-301 (NestJS permission seed) KHÔNG phụ thuộc TASK-101 → có thể làm song song với PHASE 2
- TASK-401 (Python exporters) KHÔNG phụ thuộc TASK-101 → có thể làm song song với PHASE 1
- TASK-501 chỉ cần TASK-101 xong, KHÔNG cần NestJS module xong

---

## Quy tắc bất biến (copy từ AGENTS.md)

### Multi-tenancy
- KHÔNG BAO GIỜ lấy `tenantId` từ request body — luôn dùng `@CurrentTenant()` decorator (JWT)
- Mọi query DB phải có `tenantId` filter
- Header `x-tenant-id` được inject bởi NestJS proxy, client không được set trực tiếp

### Response Format (NestJS)
- Endpoints thông thường: `ResponseTransformInterceptor` tự wrap → KHÔNG wrap thủ công
- **Export endpoints**: dùng `@Res()` để bypass interceptor hoàn toàn — binary stream, không JSON
- Error format: `{ "error": { "code": "...", "message": "..." } }`

### TypeScript
- Strict mode — KHÔNG dùng `any`
- Types từ `@supportops/types` — không duplicate
- Exceptions: dùng typed exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`)

### Frontend
- KHÔNG hardcode URL — dùng `ENDPOINTS` từ `@supportops/types`
- KHÔNG import `apiClient` trực tiếp vào component — phải qua service → hook
- UI text phải qua `next-intl`
- Kiểm tra `packages/ui` trước khi tạo component mới

### Python Service
- KHÔNG expose Python endpoints trực tiếp ra internet — chỉ qua NestJS proxy
- KHÔNG sửa `get_report_data()` trong `db/queries.py`
- Dùng `StreamingResponse` — KHÔNG buffer toàn bộ file trong RAM
- KHÔNG tạo migration DB

### Forbidden (từ DESIGN-00004 §12)
- KHÔNG tạo migration schema mới
- KHÔNG buffer file trong RAM
- KHÔNG để `ResponseTransformInterceptor` wrap binary response
- KHÔNG thêm biểu đồ/chart vào PDF

---

## Quality Gates

| Thời điểm | Command |
|---|---|
| Sau TASK-101 | `pnpm --filter @supportops/types typecheck` |
| Sau TASK-401, TASK-402 | `cd apps/ai-service && pytest` (nếu có test) |
| Sau TASK-301, TASK-302 | `pnpm --filter @supportops/api build` |
| Sau TASK-302 | `pnpm --filter @supportops/api test` |
| Sau TASK-501, TASK-502, TASK-503 | `pnpm --filter @supportops/web build` |
| Sau TASK-503 | `pnpm lint && pnpm typecheck` |
| Pre-commit toàn bộ | `pnpm lint && pnpm typecheck` |

---

## Format báo cáo sau mỗi task

```
✅ TASK-XXX — {Tên task}
- Files đã tạo/sửa: [list]
- Quality gate: PASSED / FAILED (kèm output nếu FAILED)
- Ghi chú: [nếu có deviation so với spec]
- Task tiếp theo: TASK-YYY
```
