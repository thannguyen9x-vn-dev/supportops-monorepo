# ServiceOps MVP Plan

## 1) Goal

Build the ServiceOps UI incrementally — one vertical slice at a time — so each flow is interactive and realistic before moving to the next.

## 2) Working approach (vertical slice)

Each slice delivers one end-to-end user flow:
1. Open page
2. Load data (real API or mock if endpoint not ready)
3. Perform key action
4. Show success/error feedback
5. Persist state in UI (re-render updated data)

## 3) Module scope for v1

| Module | Route | Status |
|---|---|---|
| Auth & RBAC | `/login`, `/register`, `/forgot-password`, etc. | ✅ Done |
| User Profile & Settings | `/settings/profile` | ✅ Done |
| Team Management | `/team` | ✅ Done |
| Requests List | `/requests/list` | 🔶 In progress — functional on real API; refactor/consistency cleanup remains |
| Request Detail | `/requests/[id]` | ✅ Done |
| Create Request | `/requests/create` | ✅ Done |
| Settings — Workflow | `/settings/workflow` | ✅ Done |
| Settings — SLA | `/settings/sla` | ✅ Done |
| Settings — Service Types | `/settings/service-types` | ✅ Done |
| Dashboard | `/dashboard` | ✅ Done — ServiceOps dashboard live |
| Worker | `apps/worker` | ✅ Done (Phase 1 scope) — SLA monitor + escalation jobs |

## 3.1) Current delivery note (2026-03-22)

- Phase 1 core MVP scope is complete.
- Phase 2 currently has two remaining cleanup tasks:
  - `2.4` Request list decomposition/refactor hardening.
  - `2.5` Activity log consistency audit.
- Phase 3 architecture tasks are complete.
- Phase 4 portfolio tasks (4.1, 4.2, 4.3) are complete.

## 4) Build order (recommended)

1. **Create Request** — intake form end-to-end drives the first real backend flow.
2. **Request Detail backend** — complete status transitions, assign, comment, work log.
3. **Request List polish** — verify real API data, filters, pagination.
4. **Settings backend CRUD** — service types, SLA policies, workflow transitions.
5. **Dashboard** — rewrite from scratch (remove ecommerce template).
6. **Worker** — SLA monitor + escalation jobs.

## 5) MVP backlog by slice

### Slice A: Requests — list

- Route: `/requests/list`
- Core actions:
  - Load paginated list with status/tab filter
  - Click row → navigate to detail
  - Create new request (button → intake form)
- Data contract: `ServiceRequest` (id, requestCode, title, status, priority, requester, assignee, createdAt, slaHealth)
- Done criteria:
  - Table handles loading / empty / error states
  - All 6 tabs filter correctly
  - Pagination works
  - i18n keys in place

### Slice B: Create Request (intake)

- Route: `/requests/create`
- Core actions:
  - Fill form (serviceType, title, description, location, priority, attachments)
  - Save as draft OR submit
  - Validation errors shown inline
- Data contract: `CreateServiceRequestInput` (mode: draft | submit, serviceTypeId, title, description, location, priority, attachments[])
- Done criteria:
  - Both draft and submit modes work end-to-end
  - File attachments wired to file upload API
  - On success → redirect to request detail
  - i18n keys in place

### Slice C: Request Detail

- Route: `/requests/[id]`
- Core actions:
  - View full request details
  - Status transitions (role-based rules enforced)
  - Add comment (PUBLIC / INTERNAL)
  - Log work time
  - Assign / reassign
  - View activity timeline
- Data contract: full `RequestWorkflowDetail` + comments + activity log + SLA record
- Done criteria:
  - Status badge reflects current state
  - Comment form submits and appears in timeline
  - Work log entry saves
  - SLA indicator visible (ON_TRACK / AT_RISK / BREACHED)
  - Unauthorized transitions return 403

### Slice D: Settings

- Routes: `/settings/workflow`, `/settings/sla`, `/settings/service-types`
- Core actions:
  - CRUD service types
  - Configure SLA policies (responseMinutes, resolutionMinutes, escalationAfterMinutes)
  - Define workflow transitions (fromStatus, toStatus, allowedRoles)
- Done criteria (per settings page):
  - Form saves and reloads correctly
  - Validation errors shown inline
  - Empty state handled
  - Only TENANT_ADMIN can access

## 6) Required UI states for every page

Each new page must implement:
1. `loading`
2. `empty`
3. `error`
4. `success`
5. `permissionDenied` (if route requires specific permissions)

## 7) Technical rules

1. Keep `apps/web` route groups as-is: `(authenticated)` for protected routes, `(public)` for auth pages.
2. Styling:
   - CSS Modules for layout/page shell
   - MUI components for interactive controls
   - Use `--mui-*` tokens in CSS Modules for consistency with theme
3. Use `@/` imports for cross-feature paths.
4. Keep user-facing copy in i18n files (`en.json`, `vi.json`).
5. API calls must go through: Component → Hook → Service (`features/*/services/`) → `apiClient.ts`

## 8) Definition of done (per slice)

A slice is done only when:
1. Route is accessible and wired in navigation
2. Main interaction works end-to-end (real API)
3. Loading / empty / error / permissionDenied states are implemented
4. i18n keys added for all labels and messages
5. `pnpm typecheck` passes
6. `pnpm lint` passes (or issues documented)

## 9) Architecture backlog reference

For cross-cutting frontend concerns (security, performance, rendering), see:
- `docs/tech-debt/frontend-architecture.md`

Before implementing auth, list rendering, or route changes:
1. Check trigger rules in that document.
2. Link the related item ID (`FA-01`..`FA-05`) in your task/PR.
