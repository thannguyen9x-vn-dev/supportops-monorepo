# Auth and Roles

## Authentication flow
1. User registers or is invited to a tenant.
2. User verifies email and sets password.
3. User logs in with email/password.
4. Backend issues:
   - Access token (Bearer JWT)
   - Refresh token in HttpOnly cookie
5. Client sends access token for protected APIs.
6. Refresh endpoint rotates refresh token when access token expires.

## Session model
- Access token: short-lived, used in `Authorization: Bearer <token>`.
- Refresh session: stored server-side and linked to user + membership.
- Logout revokes current session; logout-all revokes all active sessions.

## JWT claims
- `userId`
- `tenantId`
- `role`
- `email`

Claims are used to scope tenant data and evaluate permissions in guards.

## Role model (system roles)

| Role | Purpose |
|---|---|
| EMPLOYEE | Requester role with own-request visibility and basic actions |
| OPS_COORDINATOR | Queue coordination, assignment/reassignment, escalation operations |
| TECHNICIAN | Handles assigned work and resolution updates |
| TENANT_ADMIN | Full tenant-level administration and configuration access |

## Permission model
- Permissions are stored in `AuthPermission` and mapped via `AuthRolePermission`.
- Route guards enforce permissions per endpoint.
- Example permissions: `request.create`, `request.read.all`, `request.assign`, `comment.read.internal`, `workflow.manage`, `sla.manage`.

## Tenant isolation
- All business queries must include tenant filter.
- Membership status controls whether a user can authenticate for a tenant.
- Deactivated/suspended users cannot authenticate.

## Security controls in place
- Password hashing with bcrypt.
- HttpOnly refresh cookies.
- Token rotation and revocation.
- Consistent error responses through global exception handling.
