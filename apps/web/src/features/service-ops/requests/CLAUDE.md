# requests — Feature-Specific Notes

General architecture patterns → read `apps/web/src/features/CLAUDE.md` first.

---

## Directory Layout (requests-specific)

```
components/
  RequestDetailView.tsx      # detail orchestrator
  RequestListView.tsx        # list orchestrator
  RequestIntakeView.tsx      # create/intake orchestrator
  activity/    # ActivityTimeline, CommentsPanel, WorkLogPanel
  assign/      # AssignDialog, AssignUserForm
  cards/       # RequestOverviewCard, AssignmentCard, MetadataCard, SlaCard, AttachmentsCard, AuditSummaryCard
  header/      # RequestSummary, RequestHeaderActions
  shared/      # PriorityChip, StatusChip, SlaStateChip
hooks/
  useRequestDetail.ts    # all detail state + mutations
services/
  request.service.ts
utils/
  requestActions.ts      # getHeaderActions(status, role, isAssignee)
  requestAccess.ts       # getSectionVisibility(role, request), canView*()
  formatters.ts
types.ts
```

---

## Action Logic (`utils/requestActions.ts`)

- Switch on `RequestStatus` → build action list → filter by role
- TECHNICIAN role: exclude `REASSIGN`
- Dedup with `Array.from(new Set(actions))`

## RBAC (`utils/requestAccess.ts`)

- `canViewAllTenantRequests(role)` — TENANT_ADMIN, OPS_COORDINATOR
- `canViewAssignedOrRelatedRequests(role)` — TECHNICIAN
- `getSectionVisibility(role, request)` — returns `SectionVisibility` object

## Hook (`hooks/useRequestDetail.ts`)

- Uses `executeMutation(runner, successMessage)` helper
- Uses `extractError(error, fallback)` for error normalization
- Refresh trigger: `refreshDetail` state increment inside `useEffect`

## i18n Namespaces

- List screen: `pages.requests.list`
- Detail screen: `pages.requests.detail`
- Intake screen: `pages.requests.intake`
