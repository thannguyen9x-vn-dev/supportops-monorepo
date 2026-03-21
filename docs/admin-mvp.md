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
| Requests List | `/requests/list` | In progress |
| Request Detail | `/requests/[id]` | UI done, backend partial |
| Create Request | `/requests/create` | In progress |
| Team | `/team` | UI done, backend done |
| Settings — Workflow | `/settings/workflow` | UI scaffold |
| Settings — SLA | `/settings/sla` | UI scaffold |
| Settings — Service Types | `/settings/service-types` | UI scaffold |
| Admin — User Mgmt | `/admin/user` | UI scaffold |

## 4) Build order (recommended)

1. **Requests List** first
   Reason: core table pattern — establishes list/filter/pagination foundation.

2. **Create Request** second
   Reason: intake form with draft + submit modes; drives the first real backend flow.

3. **Request Detail** third
   Reason: view + status transitions + comments + work log — the main agent workspace.

4. **Team** fourth
   Reason: invite + role management already backed by API; complete the UI interactions.

5. **Settings (workflow/SLA/service-types)** fifth
   Reason: admin config for request processing — needed for SLA and routing to work correctly.

6. **Dashboard** last
   Reason: aggregated KPIs depend on stable request + SLA data shapes.

## 5) MVP backlog by slice

### Slice A: Requests — list
- Route: `/requests/list`
- Core actions:
  - Load paginated list with status filter
  - Click row → navigate to detail
  - Create new request (button → intake form)
- Data contract: `ServiceRequest` (id, title, status, priority, requester, assignee, createdAt, SLA health)
- Done criteria:
  - Table handles loading / empty / error states
  - Status filter updates list
  - Pagination works
  - i18n keys in place

### Slice B: Create Request (intake)
- Route: `/requests/create`
- Core actions:
  - Fill form (title, description, service type, priority, attachments)
  - Save as draft OR submit
  - Validation errors shown inline
- Data contract: `CreateRequestDto` (mode: draft | submit, title, description, serviceTypeId, priority, urgency, impact, attachments)
- Done criteria:
  - Both draft and submit modes work end-to-end
  - File attachments wired to file upload API
  - On success → redirect to request detail
  - i18n keys in place

### Slice C: Request Detail
- Route: `/requests/[id]`
- Core actions:
  - View full request details
  - Status transitions (submit → in-progress → resolved)
  - Add comment
  - Log work time
  - View activity timeline
- Data contract: full `RequestResponseDto` + comments + activity log
- Done criteria:
  - Status badge reflects current state
  - Comment form submits and appears in timeline
  - Work log entry saves
  - SLA indicator visible (on track / at risk / breached)

### Slice D: Team
- Route: `/team`
- Core actions:
  - View all tenant members with role/status
  - Invite new member (by email + role)
  - Deactivate / reactivate member
  - Change member role
- Data contract: `TenantUserResponseDto[]`
- Done criteria:
  - Invite flow sends email and reflects pending state
  - Deactivate/reactivate toggles status immediately
  - Role change persists

### Slice E: Settings
- Routes: `/settings/workflow`, `/settings/sla`, `/settings/service-types`
- Core actions:
  - CRUD service types
  - Configure SLA policies (assignment minutes, resolution minutes)
  - Define workflow transitions
- Done criteria (per settings page):
  - Form saves and reloads correctly
  - Validation errors shown inline
  - Empty state handled

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
2. Main interaction works end-to-end (real API or realistic mock)
3. Loading / empty / error states are implemented
4. i18n keys added for all labels and messages
5. `pnpm --filter web exec tsc --noEmit` passes
6. `pnpm --filter web lint` passes (or issues documented)

## 9) How to add new slices
When adding a new feature slice, provide:
1. Page name + route
2. Primary actor and goal
3. Top 3 actions users can do
4. Required fields/data shown
5. Success condition after main action

## 10) Architecture backlog reference
For cross-cutting frontend concerns (security, performance, rendering), see:
- `docs/tech-debt/frontend-architecture.md`

Before implementing auth, list rendering, or route changes:
1. Check trigger rules in that document.
2. Link the related item ID (`FA-01`..`FA-04`) in your task/PR.
