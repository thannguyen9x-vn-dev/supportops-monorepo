# SupportOps API Reference

Base URL: `http://localhost:8081/api/v1`

## Authentication

All endpoints except those marked `[PUBLIC]` require:

```text
Authorization: Bearer <access_token>
```

Optional trace header:

```text
x-trace-id: <uuid>
```

Refresh token is stored in `HttpOnly` cookie (`supportops_refresh_token`).
See `docs/auth-cookie-contract.md` for full cookie spec.

---

## Auth

### POST `/auth/register` [PUBLIC]
Create tenant + user account. Returns `accessToken` in body + sets refresh cookie.

### POST `/auth/verify-email` [PUBLIC]
Verify email with token from verification email.

### POST `/auth/resend-verification-email` [PUBLIC]
Resend the verification email.

### POST `/auth/login` [PUBLIC]
Login. Returns `accessToken` in body + sets refresh cookie.

### POST `/auth/refresh` [PUBLIC]
Issue new access token from refresh cookie. Rotates refresh token.

### POST `/auth/logout`
Revoke refresh token and clear cookie.

### POST `/auth/logout-all`
Revoke all refresh sessions for the current user.

### POST `/auth/forgot-password` [PUBLIC]
Send password reset OTP email.

### POST `/auth/reset-password` [PUBLIC]
Reset password using OTP from email.

### POST `/auth/invite/accept` [PUBLIC]
Accept an invite and set password for the new account.

---

## Users

### GET `/users/me`
Get current user profile.

### PUT `/users/me`
Update profile (name, phone, birthday, country, department, etc.).

### PUT `/users/me/password`
Change password (requires current password).

### GET `/users/me/preferences`
Get notification/display preferences.

### PUT `/users/me/preferences`
Update preferences.

### GET `/users/me/sessions`
List active refresh sessions.

### DELETE `/users/me/sessions/:id`
Revoke a specific session.

### POST `/users/me/avatar`
Upload avatar (multipart, `file`).

---

## Team (Tenant User Management)

### GET `/users`
List all members in the current tenant with role and membership status.
Requires: `user.invite` OR `role.manage` OR `user.deactivate` permission.

### POST `/users/invite`
Invite a user by email with a given role.

### PATCH `/users/:id/role`
Change the role of a tenant member.

### PATCH `/users/:id/department`
Change the department of a tenant member.

### PATCH `/users/:id/deactivate`
Deactivate a tenant member (blocks login for this tenant).

### PATCH `/users/:id/reactivate`
Reactivate a previously deactivated member.

---

## Service Requests

### GET `/requests`
List requests (tenant-scoped, paginated).

Query params:
- `page` (default: 1)
- `size` (default: 20)
- `status` — filter by `RequestStatus` enum
- `serviceTypeId` — filter by service type
- `assigneeId` — filter by assignee
- `slaHealth` — filter by `ON_TRACK | AT_RISK | BREACHED`
- `unassigned` — boolean

Access rules:
- `request.read.all` → sees all tenant requests
- `request.read.own` or `request.start_work` → sees own + assigned requests

### POST `/requests`
Create a service request.

Body:
```json
{
  "mode": "draft | submit",
  "title": "string",
  "description": "string (optional)",
  "serviceTypeId": "uuid",
  "location": "string",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "urgency": "LOW | MEDIUM | HIGH | CRITICAL (optional)",
  "impactLevel": "LOW | MEDIUM | HIGH | CRITICAL (optional)",
  "attachmentIds": ["uuid"]
}
```

Requires: `request.create` permission.

On `submit` mode: status moves to `SUBMITTED`, SLA record is created automatically.
On `draft` mode: status stays `DRAFT`.

### GET `/requests/:id/workflow`
Get full request workflow detail including overview, comments, activity timeline, SLA record, assignment history.

Returns: `RequestWorkflowDetail`

### PATCH `/requests/:id/status`
Transition request status. Role-based rules enforced — returns 403 if role not allowed.

Body: `{ "status": "RequestStatus" }`

### POST `/requests/:id/assign`
Assign or reassign request to a user.

Body: `{ "assigneeId": "uuid" }`

### POST `/requests/:id/comments`
Add a comment to a request.

Body: `{ "body": "string", "visibility": "PUBLIC | INTERNAL" }`

### POST `/requests/:id/work-logs`
Log work time on a request.

Body: `{ "content": "string", "minutesSpent": number }`

### GET `/requests/assignees`
List active users available for assignment (within tenant).

---

## Service Types

### GET `/service-types`
List service types for the tenant.

### POST `/service-types`
Create a service type. Requires `TENANT_ADMIN`.

Body: `{ "code": "string", "name": "string", "description": "string", "isActive": true }`

### PATCH `/service-types/:id`
Update a service type. Requires `TENANT_ADMIN`.

### DELETE `/service-types/:id`
Delete a service type. Fails if linked requests exist. Requires `TENANT_ADMIN`.

---

## SLA Policies

### GET `/sla-policies`
List SLA policies for the tenant.

### POST `/sla-policies`
Create an SLA policy. Requires `TENANT_ADMIN`.

Body: `{ "serviceTypeCode": "string", "responseMinutes": number, "resolutionMinutes": number, "escalationAfterMinutes": number }`

### PATCH `/sla-policies/:id`
Update an SLA policy. Requires `TENANT_ADMIN`.

### DELETE `/sla-policies/:id`
Delete an SLA policy. Requires `TENANT_ADMIN`.

---

## Workflow Transitions

### GET `/workflow-transitions`
List workflow transition rules for the tenant.

### POST `/workflow-transitions`
Create a transition rule. Requires `TENANT_ADMIN`.

Body: `{ "serviceTypeCode": "string", "fromStatus": "RequestStatus", "toStatus": "RequestStatus", "allowedRoles": ["RoleCode"] }`

### PATCH `/workflow-transitions/:id`
Update a transition rule. Requires `TENANT_ADMIN`.

### DELETE `/workflow-transitions/:id`
Delete a transition rule. Requires `TENANT_ADMIN`.

---

## Files

### POST `/files/upload`
Upload one or more files (multipart, `files[]`).
Returns array of `UploadedFile` records with IDs used in request attachments.

### GET `/files/access-url?url=...&expiresInSeconds=300`
Get a temporary signed read URL for a MinIO object.

---

## Dashboard

### GET `/dashboard/summary`
Returns KPI aggregates for the tenant: open requests, unassigned, SLA breached, resolved today, avg resolution time, my assigned count.

### GET `/dashboard/recent-activity`
Returns last N activity events across all requests in the tenant.

---

## Legacy Modules

Legacy modules (`products`, `kanban`, `messages`, `billing`, `subscriptions`, `invoices`) were removed in Phase 3.4.
