# Request Flow

## Status machine

```text
DRAFT
  -> SUBMITTED
  -> CANCELLED

SUBMITTED
  -> TRIAGE
  -> WAITING_EXTERNAL_VENDOR
  -> CANCELLED

TRIAGE
  -> ASSIGNED
  -> WAITING_EXTERNAL_VENDOR
  -> CANCELLED

ASSIGNED
  -> IN_PROGRESS
  -> WAITING_EXTERNAL_VENDOR
  -> CANCELLED

IN_PROGRESS
  -> RESOLVED
  -> WAITING_EXTERNAL_VENDOR
  -> CANCELLED

RESOLVED
  -> CLOSED
  -> REOPENED

CLOSED
  -> REOPENED

REOPENED
  -> ASSIGNED
  -> IN_PROGRESS
  -> WAITING_EXTERNAL_VENDOR
  -> CANCELLED

WAITING_EXTERNAL_VENDOR
  -> ASSIGNED
  -> IN_PROGRESS
  -> RESOLVED
  -> CANCELLED
```

## Role permissions for transitions

| Transition | Allowed roles |
|---|---|
| DRAFT -> SUBMITTED | EMPLOYEE, TENANT_ADMIN |
| SUBMITTED -> TRIAGE | OPS_COORDINATOR, TENANT_ADMIN |
| TRIAGE -> ASSIGNED | OPS_COORDINATOR, TENANT_ADMIN |
| ASSIGNED -> IN_PROGRESS | TECHNICIAN, TENANT_ADMIN |
| IN_PROGRESS -> RESOLVED | TECHNICIAN, TENANT_ADMIN |
| RESOLVED -> CLOSED | OPS_COORDINATOR, EMPLOYEE, TENANT_ADMIN |
| CLOSED -> REOPENED | EMPLOYEE, OPS_COORDINATOR, TENANT_ADMIN |
| Any -> WAITING_EXTERNAL_VENDOR | OPS_COORDINATOR, TENANT_ADMIN |
| Any -> CANCELLED | EMPLOYEE (own request), TENANT_ADMIN |

## Request lifecycle (happy path)
1. Employee creates request in `submit` mode.
2. System generates request code (`REQ-YYYY-xxxxx`) and SLA records.
3. Coordinator triages and assigns technician.
4. Technician starts work and logs updates.
5. Technician resolves request.
6. Coordinator/employee closes request.

## Activity timeline semantics
- Every major action emits activity events (created, status changed, assignment, comments, work logs, SLA signals).
- `PUBLIC` events are visible to all users with request access.
- `INTERNAL` events are restricted to privileged roles.

## SLA and escalation behavior
- Worker job checks open requests on schedule.
- SLA health transitions: `ON_TRACK` -> `AT_RISK` -> `BREACHED`.
- Breached requests can be escalated and moved to `WAITING_EXTERNAL_VENDOR` when needed.

## Primary APIs in this flow
- `POST /api/v1/requests`
- `GET /api/v1/requests`
- `GET /api/v1/requests/:id/workflow`
- `PATCH /api/v1/requests/:id/status`
- `POST /api/v1/requests/:id/assign`
- `POST /api/v1/requests/:id/comments`
- `POST /api/v1/requests/:id/work-logs`
