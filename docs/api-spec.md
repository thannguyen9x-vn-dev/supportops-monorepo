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
Send password reset email.

### POST `/auth/reset-password` [PUBLIC]
Reset password using token from email.

### POST `/auth/invite/accept` [PUBLIC]
Accept an invite and set password for the new account.

---

## Users

### GET `/users/me`
Get current user profile.

### PUT `/users/me`
Update profile (name, phone, etc.).

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
  "serviceTypeId": "uuid (optional)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "urgency": "LOW | MEDIUM | HIGH | CRITICAL",
  "impact": "LOW | MEDIUM | HIGH | CRITICAL",
  "attachmentIds": ["uuid"]
}
```

Requires: `request.create` permission.

On `submit` mode: status moves to `OPEN`, SLA record is created automatically.
On `draft` mode: status stays `DRAFT`.

---

## Files

### POST `/files/upload`
Upload one or more files (multipart, `files[]`).
Returns array of `UploadedFile` records with IDs used in request attachments.

### GET `/files/access-url?url=...&expiresInSeconds=300`
Get a temporary signed read URL for a MinIO object.

---

## Planned Endpoints (not yet implemented)

### GET `/requests/:id`
Get full request detail including comments, activity timeline, SLA record.

### PATCH `/requests/:id/status`
Transition request status.

### POST `/requests/:id/comments`
Add a comment to a request.

### POST `/requests/:id/work-log`
Log work time on a request.

### GET `/service-types`
List service types for the tenant.

### POST `/service-types`
Create a service type.

### GET `/sla-policies`
List SLA policies.

---

## Legacy Modules (to be retired)

The following modules are still active in the backend but are NOT part of the v1 scope.
They will be removed after ServiceOps reaches feature parity:

- `/products` — product catalog
- `/boards`, `/tasks` — Kanban
- `/messages` — internal messaging
- `/plans`, `/subscriptions` — subscription management
- `/billing`, `/invoices` — commerce
