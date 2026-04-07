# _CONTEXT.md — V3 Task Runner Context
> **ĐỌC FILE NÀY TRƯỚC KHI THỰC HIỆN BẤT KỲ TASK NÀO**

---

## Cách dùng hệ thống task này

Agent nhận lệnh dạng:
> "Đọc `docs/tasks/v3/_CONTEXT.md` và thực hiện `TASK-301`"

Agent sẽ:
1. Đọc file này (_CONTEXT.md) — bắt buộc
2. Đọc các file conventions được liệt kê bên dưới — bắt buộc
3. Đọc file task cụ thể (ví dụ: `TASK-301-be-ai-module.md`)
4. Implement theo đúng spec trong task file
5. Chạy quality gates được chỉ định trong task
6. Cập nhật `_STATUS.md` khi xong

---

## Bắt buộc đọc trước khi bắt đầu (theo thứ tự)

1. `AGENTS.md` (root) — Architectural principles, monorepo rules
2. `apps/api/AGENTS.md` — Backend: thin controller, tenantId, exceptions
3. `apps/web/AGENTS.md` — Frontend: component size limits, UI library checklist
4. `docs/standards/BACKEND_STANDARDS.md` — Module structure, DTO, security checklist
5. `docs/standards/FRONTEND_STANDARDS.md` — Loading/error/empty states, form pattern
6. `docs/designs/DESIGN-00003.md` — Source of truth cho V3: API contracts, schema, architecture
7. `docs/requirements/REQ-00003.md` — Business requirements & acceptance criteria

---

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS 11 + Prisma + PostgreSQL |
| Frontend | Next.js 14 App Router + MUI + next-intl |
| AI Service | Python 3.11 + FastAPI + Anthropic SDK + OpenAI SDK |
| Types | `packages/types` — contracts-first, làm TRƯỚC HẾT |
| Monorepo | pnpm workspaces + Turborepo |

---

## Thứ tự thực hiện (KHÔNG được đảo ngược)

```text
PHASE 1 — TYPES (làm trước tất cả BE + FE)
  TASK-101  Types: AI types + endpoints
  ↓ GATE: pnpm --filter @supportops/types build PASS

PHASE 2 — DATABASE
  TASK-201  DB Migration: TenantAiSettings
  ↓ GATE: prisma generate PASS (DB không khả dụng locally → tạo SQL thủ công)

PHASE 3 — BACKEND (NestJS Proxy)
  TASK-301  BE: AI Module (proxy + settings CRUD)
  ↓ GATE: pnpm --filter @supportops/api build PASS

PHASE 4 — AI SERVICE (Python)
  TASK-401  AI Service: FastAPI + Adapters + Tool + DB queries
  ↓ GATE: uvicorn main:app khởi động không crash

PHASE 5 — FRONTEND
  TASK-501  FE: AI Assistant Chat Panel
  TASK-502  FE: AI Settings Page
  TASK-503  FE: Dashboard Integration (layout + RBAC gate)
  ↓ GATE: pnpm typecheck PASS + pnpm lint PASS
```

---

## Quy tắc bất biến (KHÔNG cần PO nhắc lại)

### Backend
- `KHÔNG` để logic trong controller — chỉ delegate sang service
- `KHÔNG` query Prisma thiếu `tenantId` — mọi query phải filter theo tenant
- `KHÔNG` return raw Prisma object — phải map qua response DTO
- `KHÔNG` dùng `any` — dùng type từ `@supportops/types`
- `tenantId` luôn lấy từ JWT (`@CurrentTenant()`) — KHÔNG tin body hay query param

### AI Service (Python)
- `tenantId` CHỈ đọc từ `x-tenant-id` header (do NestJS inject) — KHÔNG từ request body
- `KHÔNG` để AI tự sinh số liệu — bắt buộc gọi tool `get_report_data` trước khi trả lời
- `KHÔNG` INSERT/UPDATE/DELETE trong DB queries — read-only hoàn toàn
- API keys (Anthropic + OpenAI) chỉ trong env của AI Service — không log, không expose

### Frontend
- `KHÔNG` tạo UI component nếu `packages/ui` đã có (xem checklist trong `apps/web/AGENTS.md`)
- `KHÔNG` import `apiClient` trực tiếp trong component — phải qua `service → hook → component`
- `KHÔNG` hardcode string UI text — dùng `next-intl` keys
- AI Chat Panel chỉ render khi `canUseAiAssistant(role) === true` — không cần 403 handling ở FE

### Packages
- `KHÔNG` thêm package mới vào `packages/` — đóng băng theo V3.1 scope
- `apps/ai-service` là Python app độc lập — không nằm trong pnpm workspace

---

## Quality gates

| Gate | Command | Khi nào |
|---|---|---|
| Types build | `pnpm --filter @supportops/types build` | Sau PHASE 1 |
| Types check | `pnpm typecheck` | Sau mỗi task |
| Lint | `pnpm lint` | Sau mỗi task |
| BE build | `pnpm --filter @supportops/api build` | Sau PHASE 3 |
| FE typecheck | `pnpm --filter @supportops/web typecheck` | Sau PHASE 5 |

---

## Báo cáo sau mỗi task

```text
✅ TASK-XXX hoàn thành
- Files tạo mới: [list]
- Files sửa: [list]
- typecheck: PASS / FAIL (nếu FAIL: lý do)
- lint: PASS / FAIL
- Task tiếp theo: TASK-XXX
```
