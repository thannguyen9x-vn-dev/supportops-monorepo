# ServiceOps Restructure (TeamOps Core + ServiceOps Layer)

> **Status: Completed.** The restructure described below has been implemented.
> Legacy modules are still present in the codebase and will be removed in Phase 3 (Task 3.4).

## Target Architecture (Implemented)

### Backend (`apps/api/src/modules`)
- `core/*`: auth, tenant, user, role, permission, workflow, comment, notification, audit
- `service-ops/*`: request, assignment, sla, escalation, asset, work-log, resolution
- Legacy modules remain active and will be removed phase-by-phase (see `docs/AGENT_TASKS.md` Task 3.4)

### Frontend (`apps/web/src`)
- Route group: `(authenticated)` for all protected routes
- Primary routes implemented:
  - `/requests/list`
  - `/requests/[id]`
  - `/requests/create`
  - `/settings/workflow`
  - `/settings/sla`
  - `/settings/service-types`
  - `/team`
  - `/settings/profile` (4 tabs)
- Feature roots:
  - `features/core/*`
  - `features/service-ops/*`

### Contracts (`packages/types/src`)
- `core/endpoints.ts`, `core/types.ts`
- `service-ops/endpoints.ts`, `service-ops/types.ts`
- `endpoints.ts` merges new + legacy for backward compatibility during transition

## Migration Order

1. ✅ Introduce skeleton modules/routes/contracts
2. ✅ Auth, User Profile, Team Management end-to-end
3. 🔶 Request domain end-to-end (API + UI) — in progress
4. ⬜ Workflow transitions + SLA jobs + escalation
5. ⬜ Retire legacy modules (product/message/kanban/billing/subscription/invoice)

## Notes

- Legacy modules are still imported so existing flows do not hard break.
- Do not extend or add features to legacy modules — they are being retired.
- See `docs/AGENT_TASKS.md` for full task breakdown.
