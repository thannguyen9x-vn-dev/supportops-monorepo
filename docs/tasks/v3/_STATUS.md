# _STATUS.md — V3 Implementation Progress

> Cập nhật sau mỗi task hoàn thành

**REQ:** REQ-00003 | **DESIGN:** DESIGN-00003 | **Started:** 2026-04-06 | **Completed:** 2026-04-07

---

## Progress Overview

| Phase | Tasks | Done | Status |
|---|---|---|---|
| PHASE 1 — Types | 1 | 1 | ✅ Done |
| PHASE 2 — Database | 1 | 1 | ✅ Done |
| PHASE 3 — Backend | 1 | 1 | ✅ Done |
| PHASE 4 — AI Service | 1 | 1 | ✅ Done |
| PHASE 5 — Frontend | 3 | 3 | ✅ Done |
| **TOTAL** | **7** | **7** | ✅ COMPLETE |

---

## Task Checklist

### PHASE 1 — Types
- [x] TASK-101 — Types: AI types + endpoints
- [x] **GATE:** `pnpm --filter @supportops/types build` PASS

### PHASE 2 — Database
- [x] TASK-201 — DB Migration: TenantAiSettings
- [x] **GATE:** `prisma generate` PASS

### PHASE 3 — Backend
- [x] TASK-301 — BE: AI Module (proxy + settings CRUD)
- [x] **GATE:** `pnpm --filter @supportops/api build` PASS

### PHASE 4 — AI Service
- [x] TASK-401 — AI Service: FastAPI + Adapters + Tool + DB queries
- [x] **GATE:** uvicorn main:app khởi động không crash

### PHASE 5 — Frontend
- [x] TASK-501 — FE: AI Assistant Chat Panel
- [x] TASK-502 — FE: AI Settings Page
- [x] TASK-503 — FE: Dashboard Integration
- [x] **GATE:** `pnpm typecheck` PASS + `pnpm lint` PASS

### FINAL
- [x] Docs: REQ-00003.md, DESIGN-00003.md, tasks/v3/ created
- [x] PR #31 → `release/mvp-02` created

---

## Log

| Task | Completed | Agent | Notes |
|---|---|---|---|
| TASK-101 | 2026-04-06 | Claude Code | Added `AI_MODEL_IDS`, `AiModelId`, `DEFAULT_AI_MODEL`, `AI_MODEL_OPTIONS`, `ChatMessage`, `AskRequest`, `AskResponse`, `AiSettings`, `UpdateAiSettingsRequest` to `packages/types`. Added `AI_ASK` + `REPORT_READ` to `RBAC_PERMISSIONS`. Added `AI_ENDPOINTS` to service-ops endpoints. types build + typecheck PASS |
| TASK-201 | 2026-04-06 | Claude Code | Added `TenantAiSettings` model to Prisma schema. Created migration SQL manually (`20260406000000_add_tenant_ai_settings`). Added `ai.ask` + `report.read` permissions to seed. `prisma generate` PASS |
| TASK-301 | 2026-04-06 | Claude Code | Created `apps/api/src/modules/ai/` with controller, service, DTOs, module. Proxy logic: fetches tenant model pref → forwards to AI Service with `x-tenant-id` header, AbortSignal.timeout(30s). Settings CRUD via `prisma.tenantAiSettings.upsert`. Registered `AiModule` in `AppModule`. api build PASS |
| TASK-401 | 2026-04-06 | Claude Code | Created `apps/ai-service/` Python FastAPI app: `main.py` (startup + health), `routers/ask.py` (reads x-tenant-id from header only), `adapters/anthropic_adapter.py` (multi-turn tool use loop), `adapters/openai_adapter.py` (multi-turn function calling loop), `db/queries.py` (read-only PostgreSQL via asyncpg), `tools/report_tool.py` (tool schema). System prompt enforces tool-first, no hallucination, domain restriction. requirements.txt added. |
| TASK-501 | 2026-04-06 | Claude Code | Created `apps/web/src/features/ai-assistant/`: `types.ts`, `utils/aiAccess.ts`, `services/ai.service.ts`, `hooks/useAiChat.ts`, `components/AiChatPanel.tsx`, `components/AiChatMessage.tsx`, `components/AiModelSelector.tsx`. Added `aiAssistant.*` i18n keys to en.json + vi.json. typecheck + lint PASS |
| TASK-502 | 2026-04-06 | Claude Code | Created `apps/web/src/features/settings/ai/`: `services/ai-settings.service.ts`, `hooks/useAiSettings.ts`, `components/AiSettingsView.tsx`. Created settings page at `apps/web/src/app/[locale]/(authenticated)/settings/ai/page.tsx`. Added `settings.ai.*` i18n keys. typecheck + lint PASS |
| TASK-503 | 2026-04-06 | Claude Code | Modified `DashboardOverview.tsx`: added `useAuth()` + `canUseAiAssistant()` gate, `useEffect` to load AI settings on mount, conditional 2-column Grid layout (xl:8 DashboardContent + xl:4 AiChatPanel) for TENANT_ADMIN. typecheck + lint PASS |
