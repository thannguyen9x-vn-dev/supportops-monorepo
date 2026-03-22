# SupportOps Product Overview

## What is SupportOps?
SupportOps is a multi-tenant internal operations platform for managing service requests across facilities, IT, and general operations teams.

The product replaces ad-hoc communication (chat, email, spreadsheets) with a structured workflow where requests are created, triaged, assigned, resolved, and audited.

## Who uses it?

| Actor | Main responsibilities |
|---|---|
| Employee | Submit and track own requests, comment, close or reopen requests when needed |
| Ops Coordinator | Triage queue, assign/reassign technicians, monitor SLA risk and escalations |
| Technician | Execute assigned work, update status, add work logs and technical notes |
| Tenant Admin | Manage users/roles and tenant-level configuration (service types, SLA, workflow rules) |

## Core use cases
1. Employee submits a request with service type, priority, location, and attachments.
2. Coordinator triages new requests and assigns technicians.
3. Technician updates progress, logs work time, and resolves requests.
4. Request timeline captures status changes, assignments, comments, and SLA events.
5. Admin configures service catalog and SLA/workflow policy per tenant.

## Key functional modules
- Auth & RBAC: login/register, refresh sessions, role-based permissions.
- Requests: list, create (draft/submit), detail workflow, assignment, comments, work logs.
- Team management: invite/deactivate/reactivate users, role/department updates.
- Settings: service types, SLA policies, workflow transitions.
- Dashboard: ServiceOps KPI overview from live API.
- Worker: SLA monitor and escalation checker jobs.

## Domain model summary
- Tenant-scoped data model (`tenantId` on business tables).
- Main entities: `ServiceRequest`, `RequestActivity`, `RequestComment`, `WorkLog`, `SlaRecord`, `AssignmentHistory`, `ServiceType`, `SlaPolicy`, `WorkflowTransition`.

## Why this architecture?
- Shared contracts via `@supportops/types` reduce FE/BE drift.
- Modular backend (`apps/api/src/modules/*`) keeps domain boundaries clear.
- Background worker handles SLA checks asynchronously.
- Monorepo enables consistent quality gates and faster iteration.
