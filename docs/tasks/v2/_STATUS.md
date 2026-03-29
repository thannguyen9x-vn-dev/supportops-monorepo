# _STATUS.md — V2 Implementation Progress

> Cập nhật sau mỗi task hoàn thành

**REQ:** REQ-00002 | **DESIGN:** DESIGN-00002 | **Started:** _____ | **Target:** _____

---

## Progress Overview

| Phase | Tasks | Done | Status |
|---|---|---|---|
| PHASE 0 — Bootstrap | 1 | 1 | ✅ Done |
| PHASE 1 — Types | 5 | 5 | ✅ Done |
| PHASE 2 — Database | 2 | 2 | ✅ Done |
| PHASE 3 — Backend | 8 | 8 | ✅ Done |
| PHASE 4 — Worker | 2 | 2 | ✅ Done |
| PHASE 5 — Frontend | 6 | 6 | ✅ Done |
| **TOTAL** | **24** | **24** | ✅ COMPLETE |

---

## Task Checklist

### PHASE 0 — Bootstrap
- [x] TASK-000 — Worker Bootstrap

### PHASE 1 — Types
- [x] TASK-101 — Types: Notification
- [x] TASK-102 — Types: Knowledge Base
- [x] TASK-103 — Types: Canned Response
- [x] TASK-104 — Types: Reporting
- [x] TASK-105 — Types: Watcher + Endpoints
- [x] **GATE:** `pnpm typecheck` PASS

### PHASE 2 — Database
- [x] TASK-201 — DB Migration
- [x] TASK-202 — Backfill Script
- [x] **GATE:** `prisma migrate dev` PASS

### PHASE 3 — Backend
- [x] TASK-301 — BE: Notification Module
- [x] TASK-302 — BE: Notification Preferences
- [x] TASK-303 — BE: Request Watcher
- [x] TASK-304 — BE: Notification Fan-out
- [x] TASK-305 — BE: Knowledge Base
- [x] TASK-306 — BE: Canned Response
- [x] TASK-307 — BE: Reporting
- [x] TASK-308 — BE: SLA Extend
- [x] **GATE:** `pnpm --filter @supportops/api build` PASS

### PHASE 4 — Worker
- [x] TASK-401 — Worker: SLA Near-breach
- [x] TASK-402 — Worker: Email Dispatch
- [x] **GATE:** Worker start không crash

### PHASE 5 — Frontend
- [x] TASK-501 — FE: Notification Bell + Popover
- [x] TASK-502 — FE: Notification Preferences Page
- [x] TASK-503 — FE: SLA Badges
- [x] TASK-504 — FE: Knowledge Base Pages
- [x] TASK-505 — FE: Canned Response + Picker
- [x] TASK-506 — FE: Reporting Dashboard
- [x] **GATE:** `pnpm --filter @supportops/web build` PASS

### FINAL
- [x] `docs/AGENT_TASKS.md` updated (AC-E1 → AC-E7 + AC-TQ)

---

## Log

| Task | Completed | Agent | Notes |
|---|---|---|---|
| TASK-000 | 2026-03-29 | Codex | Bootstrap BullMQ workers, Redis config constants, start/runtime wiring, quality gates pass |
| TASK-101 | 2026-03-29 | Codex | Added notification enums/types/schema contracts, exported from types index, added schema validation tests, typecheck+lint pass |
| TASK-102 | 2026-03-29 | Codex | Added knowledge base types and Zod schemas, exported via package index, typecheck+lint pass |
| TASK-103 | 2026-03-29 | Codex | Added canned response types and Zod schemas, exported via package index, typecheck+lint pass |
| TASK-104 | 2026-03-29 | Codex | Added reporting contracts and exported from types index, typecheck+lint pass |
| TASK-105 | 2026-03-29 | Codex | Added watcher contracts, appended V2 service-ops endpoints, monorepo typecheck+lint pass |
| TASK-201 | 2026-03-29 | Codex | Updated Prisma schema for V2 notification/KB/canned/watcher/SLA fields, created and applied migration, prisma validate + monorepo typecheck pass |
| TASK-202 | 2026-03-29 | Codex | Added idempotent backfill script from UserPreference to NotificationPreference, verified rerun success |
| TASK-301 | 2026-03-29 | Codex | Implemented notification module (REST + SSE), added DTOs/service/controller tests, api notification tests + typecheck + lint pass |
| TASK-302 | 2026-03-29 | Codex | Added notification preference endpoints and merge-with-defaults/upsert service, added service tests, notification-preference tests + typecheck + lint pass |
| TASK-303 | 2026-03-29 | Codex | Added request watch/unwatch/watchers endpoints, watcher service logic with RBAC and auto-watch wiring, request tests + typecheck + lint pass |
| TASK-304 | 2026-03-29 | Codex | Added notification fan-out service wiring in request activity listener (created/assigned/status/comment/mention/sla), implemented mention event emission from comment flow, added fanout tests, notification-fanout test + typecheck + lint pass |
| TASK-305 | 2026-03-29 | Codex | Implemented knowledge-base module with CRUD/search/publish/unpublish and role-aware scope/ownership rules, added controller+service tests, knowledge-base tests + typecheck + lint pass |
| TASK-306 | 2026-03-29 | Codex | Implemented canned-response module with read/write RBAC checks, search, variable resolution, soft delete and unique-shortcut conflict handling, added controller+service tests, canned-response tests + typecheck + lint pass |
| TASK-307 | 2026-03-29 | Codex | Added reporting module with `/reports/overview` aggregation (status/priority/service type/SLA compliance/volume trend/avg response), role gating for report.read, and controller+service tests, reporting tests + typecheck + lint pass |
| TASK-308 | 2026-03-29 | Codex | Extended SLA service with pause/resume/adjusted target/near-breach helpers, wired request status transition pause-resume flow for WAITING_FOR_CUSTOMER, added SLA + request tests, api build + typecheck + lint pass |
| TASK-401 | 2026-03-29 | Codex | Reworked SLA monitor worker job to near-breach/breach queue fan-out flow with idempotent filters and paused-time adjustment, wired recurring `sla-check` scheduling in worker runtime, added SLA worker tests, worker sla-check test + monorepo typecheck + lint pass |
| TASK-402 | 2026-03-29 | Codex | Implemented email dispatch worker flow (immediate + digest buffering + per-user/request rate limiting), added email templates and job tests, wired worker runtime handlers, worker start smoke check pass (stable >15s, no crash), monorepo typecheck + lint pass |
| TASK-501 | 2026-03-29 | Codex | Added notification bell + popover in header with unread count hook/SSE integration, mark-read actions, i18n entries, and frontend tests, web typecheck/lint pass |
| TASK-502 | 2026-03-29 | Codex | Implemented notification preferences settings page with event-channel table, save flow via query/mutation hooks, route/nav wiring, and hook/component tests, web typecheck/lint pass |
| TASK-503 | 2026-03-29 | Codex | Extended request SLA frontend with NEAR_BREACH/PAUSED states, WAITING_FOR_CUSTOMER status mapping, countdown hook + badge/card/table updates, and targeted tests, web typecheck/lint pass |
| TASK-504 | 2026-03-29 | Codex | Implemented knowledge-base list/detail/new/edit pages, picker modal integration in comment composer, role-aware UI guards, and KnowledgeBase tests for picker/query threshold/status chip/new-page restrictions/link insertion |
| TASK-505 | 2026-03-29 | Codex | Added canned-response management page/form, slash-triggered picker in comment composer with keyboard handling and variable resolution, role-aware settings visibility, and CannedResponse tests |
| TASK-506 | 2026-03-29 | Codex | Built reports dashboard overview (filters, KPI cards, charts, loading/error/empty states), refactored report hook/service/tests to React Query API, fixed report route wiring, and confirmed `pnpm --filter @supportops/web build` PASS |
| TASK-FINAL | 2026-03-29 | Codex | Ran full regression (`typecheck`, `lint`, api/web/worker/types tests, api/web build, prisma validate+migrate status, worker start smoke), added V2 AC-E1..E7 + AC-TQ checklist section to docs/AGENT_TASKS.md, marked final status complete |
