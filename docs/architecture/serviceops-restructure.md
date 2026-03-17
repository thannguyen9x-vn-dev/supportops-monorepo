# ServiceOps Restructure (TeamOps Core + ServiceOps Layer)

## Target Architecture

### Backend (`apps/api-nest/src/modules`)
- `core/*`: auth, tenant, user, role, permission, work-item, workflow, comment, notification, audit
- `service-ops/*`: request, assignment, sla, escalation, asset, work-log, resolution
- legacy modules stay active during migration and will be removed phase-by-phase

### Frontend (`apps/web/src`)
- route group renamed from `(admin)` to `(authenticated)`
- new primary routes:
  - `/requests/list`
  - `/requests/[id]`
  - `/requests/create`
  - `/settings/workflow`
  - `/settings/sla`
  - `/settings/service-types`
- new feature roots:
  - `features/core/*`
  - `features/service-ops/*`

### Contracts (`shared/contracts/src`)
- `core/endpoints.ts`, `core/types.ts`
- `service-ops/endpoints.ts`, `service-ops/types.ts`
- `endpoints.ts` now merges new + legacy for backward compatibility

## Migration Order
1. Introduce skeleton modules/routes/contracts (done)
2. Implement Request domain end-to-end (API + UI)
3. Move workflow logic from Kanban into workflow/request transitions
4. Introduce SLA jobs + escalation
5. Retire legacy modules (product/message/kanban/billing/subscription/invoice)

## Notes
- Current commit intentionally keeps legacy modules imported so existing flows do not hard break.
- Next commits should move logic gradually and remove legacy imports only after feature parity.
