# _CONTEXT.md — V2 Task Runner Context
> **ĐỌC FILE NÀY TRƯỚC KHI THỰC HIỆN BẤT KỲ TASK NÀO**

---

## Cách dùng hệ thống task này

Agent nhận lệnh dạng:
> "Đọc `docs/tasks/v2/_CONTEXT.md` và thực hiện `TASK-301`"

Agent sẽ:
1. Đọc file này (_CONTEXT.md) — bắt buộc
2. Đọc các file conventions được liệt kê bên dưới — bắt buộc
3. Đọc file task cụ thể (ví dụ: `TASK-301-be-notification-module.md`)
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
6. `docs/designs/DESIGN-00002.md` — Source of truth cho V2: API contracts, schema, RBAC
7. `docs/requirements/REQ-00002.md` — Business requirements & acceptance criteria

---

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS 11 + Prisma + PostgreSQL |
| Frontend | Next.js 14 App Router + MUI + TanStack Query |
| Worker | BullMQ + Redis |
| Types | `packages/types` — contracts-first, làm TRƯỚC HẾT |
| Monorepo | pnpm workspaces + Turborepo |

---

## Thứ tự thực hiện (KHÔNG được đảo ngược)

```text
PHASE 0 — BOOTSTRAP
  TASK-000  Worker Bootstrap ← CRITICAL, unblock TASK-401 + TASK-402

PHASE 1 — TYPES (làm trước tất cả BE + FE)
  TASK-101  Types: Notification
  TASK-102  Types: Knowledge Base
  TASK-103  Types: Canned Response
  TASK-104  Types: Reporting
  TASK-105  Types: Watcher + Endpoints
  ↓ GATE: pnpm typecheck PASS

PHASE 2 — DATABASE
  TASK-201  DB Migration (Prisma schema + migrate dev)
  TASK-202  Backfill script (UserPreference → NotificationPreference)
  ↓ GATE: prisma migrate dev PASS

PHASE 3 — BACKEND
  TASK-301  BE: Notification Module
  TASK-302  BE: Notification Preferences
  TASK-303  BE: Request Watcher
  TASK-304  BE: Notification Fan-out Service
  TASK-305  BE: Knowledge Base Module
  TASK-306  BE: Canned Response Module
  TASK-307  BE: Reporting Module
  TASK-308  BE: SLA Extend (pause/resume)
  ↓ GATE: pnpm --filter @supportops/api build PASS

PHASE 4 — WORKER
  TASK-401  Worker: SLA near-breach job
  TASK-402  Worker: Email dispatch (immediate + digest)
  ↓ GATE: worker start không crash

PHASE 5 — FRONTEND
  TASK-501  FE: Notification Bell + Popover
  TASK-502  FE: Notification Preferences Page
  TASK-503  FE: SLA Badges in Request UI
  TASK-504  FE: Knowledge Base Pages + KB Picker
  TASK-505  FE: Canned Response + Picker in Comment
  TASK-506  FE: Reporting Dashboard
  ↓ GATE: pnpm --filter @supportops/web build PASS

FINAL
  Cập nhật docs/AGENT_TASKS.md (đổi [ ] → [x] cho AC đã pass)
```

---

## Quy tắc bất biến (KHÔNG cần PO nhắc lại)

### Backend
- `KHÔNG` để logic trong controller — chỉ delegate sang service
- `KHÔNG` query Prisma thiếu `tenantId` — mọi query phải filter theo tenant
- `KHÔNG` return raw Prisma object — phải map qua response DTO
- `KHÔNG` dùng `any` — dùng type từ `@supportops/types`
- `KHÔNG` tạo module mới nếu đã tồn tại — kiểm tra trước khi tạo

### Frontend
- `KHÔNG` tạo UI component nếu `packages/ui` đã có (xem checklist trong `apps/web/AGENTS.md`)
- `KHÔNG` import `apiClient` trực tiếp trong component — phải qua `service → hook → component`
- `KHÔNG` hardcode string UI text — dùng `next-intl` keys
- `KHÔNG` để component vượt giới hạn kích thước (xem `apps/web/AGENTS.md §Component Size`)

### Testing
- Mọi component mới → phải có `.test.tsx`
- Mọi service method mới → phải có `.spec.ts` coverage
- Mọi endpoint mới → phải pass security checklist (`BACKEND_STANDARDS.md §14`)

### Commits
- Format: `feat(module): description` (conventional commits)
- Ví dụ: `feat(notification): add unread count endpoint`

---

## Quality gates

| Gate | Command | Khi nào |
|---|---|---|
| Types check | `pnpm typecheck` | Sau PHASE 1 và sau mỗi task |
| Lint | `pnpm lint` | Sau mỗi task |
| BE test | `pnpm --filter @supportops/api test` | Sau mỗi BE task |
| FE test | `pnpm --filter @supportops/web test` | Sau mỗi FE task |
| BE build | `pnpm --filter @supportops/api build` | Sau PHASE 3 |
| FE build | `pnpm --filter @supportops/web build` | Sau PHASE 5 |

---

## Báo cáo sau mỗi task

```text
✅ TASK-XXX hoàn thành
- Files tạo mới: [list]
- Files sửa: [list]
- typecheck: PASS / FAIL (nếu FAIL: lý do)
- lint: PASS / FAIL
- test: PASS / X failures
- Task tiếp theo: TASK-XXX
```
