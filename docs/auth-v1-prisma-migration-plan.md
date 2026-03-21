# Auth V1 Prisma Draft + Migration Plan

## Scope

This draft defines the database changes for:

- membership-based RBAC (`users` + `memberships`)
- invite-based onboarding (`invites`)
- session-aware refresh token lifecycle (`refresh_sessions`)
- role-permission mapping (`roles`, `permissions`, `role_permissions`)

It is designed to migrate safely from the current schema in:

- `apps/api/prisma/schema.prisma`

## Current vs Target (Summary)

Current:

- `User.role` is stored directly on `users`
- refresh lifecycle is in `RefreshToken` (hashed token, revoke flag)
- no `memberships`, no `invites`, no reusable permission matrix

Target:

- role moved to `Membership.roleCode`
- refresh lifecycle moved to `RefreshSession` with rotation + token family
- invite accept flow via `Invite`
- fixed role seeds + permission seeds in DB

## Prisma Draft (Target Models)

Note: Draft below is additive-first for safe rollout; old fields/models can be removed after service migration.

```prisma
enum TenantStatus {
  ACTIVE
  SUSPENDED
}

enum UserStatus {
  PENDING
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

enum MembershipStatus {
  INVITED
  ACTIVE
  SUSPENDED
  REMOVED
}

model Tenant {
  id              String            @id @default(uuid())
  name            String
  slug            String            @unique
  status          TenantStatus      @default(ACTIVE)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  users           User[]
  memberships     Membership[]
  invites         Invite[]
  refreshSessions RefreshSession[]

  @@index([status])
}

model User {
  id                String               @id @default(uuid())
  tenantId          String
  email             String
  fullName          String?
  firstName         String
  lastName          String
  passwordHash      String
  status            UserStatus           @default(PENDING)
  isEmailVerified   Boolean              @default(false)
  emailVerifiedAt   DateTime?
  isActive          Boolean              @default(true) // transitional, remove later
  lastLoginAt       DateTime?
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  tenant            Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  memberships       Membership[]
  invitedMemberships Membership[]        @relation("MembershipInvitedBy")
  refreshSessions   RefreshSession[]
  invitesSent       Invite[]             @relation("InviteSentBy")
  passwordResetTokens PasswordResetToken[]

  // Legacy relation kept during transition
  refreshTokens     RefreshToken[]

  @@unique([tenantId, email], name: "tenantId_email")
  @@index([email])
  @@index([status])
  @@index([tenantId])
}

model Membership {
  id            String            @id @default(uuid())
  tenantId      String
  userId        String
  roleCode      String
  status        MembershipStatus  @default(INVITED)
  invitedAt     DateTime?
  joinedAt      DateTime?
  invitedById   String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  tenant        Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  invitedBy     User?             @relation("MembershipInvitedBy", fields: [invitedById], references: [id], onDelete: SetNull)
  refreshSessions RefreshSession[]

  @@unique([tenantId, userId], name: "tenantId_userId")
  @@index([tenantId, status])
  @@index([tenantId, roleCode])
  @@index([userId, status])
}

model Role {
  code          String            @id
  name          String
  description   String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  memberships   MembershipRole[]
  rolePermissions RolePermission[]
}

// Optional bridge if you want FK-safe roleCode on memberships
model MembershipRole {
  id            String            @id @default(uuid())
  membershipId  String
  roleCode      String

  membership    Membership        @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  role          Role              @relation(fields: [roleCode], references: [code], onDelete: Restrict)

  @@unique([membershipId])
  @@index([roleCode])
}

model Permission {
  code          String            @id
  description   String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  rolePermissions RolePermission[]
}

model RolePermission {
  roleCode        String
  permissionCode  String
  createdAt       DateTime        @default(now())

  role            Role            @relation(fields: [roleCode], references: [code], onDelete: Cascade)
  permission      Permission      @relation(fields: [permissionCode], references: [code], onDelete: Cascade)

  @@id([roleCode, permissionCode])
  @@index([permissionCode])
}

model RefreshSession {
  id                  String      @id @default(uuid())
  tenantId            String
  userId              String
  membershipId        String
  tokenHash           String      @unique
  tokenFamilyId       String
  userAgent           String?
  ipAddress           String?
  expiresAt           DateTime
  revokedAt           DateTime?
  revokedReason       String?
  replacedBySessionId String?
  lastUsedAt          DateTime?
  createdAt           DateTime    @default(now())

  tenant              Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user                User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  membership          Membership  @relation(fields: [membershipId], references: [id], onDelete: Cascade)

  @@index([userId, revokedAt, expiresAt])
  @@index([membershipId, revokedAt])
  @@index([tokenFamilyId])
  @@index([tenantId, userId])
}

model Invite {
  id              String      @id @default(uuid())
  tenantId        String
  email           String
  roleCode        String
  tokenHash       String      @unique
  expiresAt       DateTime
  acceptedAt      DateTime?
  invitedByUserId String
  createdAt       DateTime    @default(now())

  tenant          Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  invitedBy       User        @relation("InviteSentBy", fields: [invitedByUserId], references: [id], onDelete: Restrict)

  @@index([tenantId, email, acceptedAt])
  @@index([tenantId, expiresAt])
}
```

## Role & Permission Seeds (V1)

Roles:

- `EMPLOYEE`
- `OPS_COORDINATOR`
- `TECHNICIAN`
- `TENANT_ADMIN`

Recommended baseline permissions:

- `request.create`
- `request.read.own`
- `request.read.all`
- `request.assign`
- `request.reassign`
- `request.resolve`
- `request.close`
- `request.reopen`
- `request.escalate`
- `request.start_work`
- `request.update.metadata`
- `comment.create.public`
- `comment.create.internal`
- `comment.read.internal`
- `workflow.manage`
- `sla.manage`
- `user.invite`
- `user.deactivate`
- `role.manage`
- `audit.read`

## Migration Plan (No-Downtime Friendly)

### Phase 0: Pre-check

1. Backup DB.
2. Export current role distribution:
   - count users by `User.role`
   - count inactive users by `isActive`
3. Freeze schema-changing deploys.

### Phase 1: Additive migration (safe)

Add new enums/tables/columns without removing old ones:

- `Tenant.status` (`ACTIVE` default)
- `User.status` (`PENDING` default), `User.fullName` nullable
- tables: `Membership`, `Role`, `Permission`, `RolePermission`, `RefreshSession`, `Invite`
- keep old `RefreshToken` and old `User.role`

### Phase 2: Seed role/permission data

Insert roles and permissions; then insert role-permission map.

### Phase 3: Backfill memberships and user statuses

Backfill rules:

1. For each existing user, create one membership:
   - `tenantId = user.tenantId`
   - `userId = user.id`
   - `status = ACTIVE` if `user.isActive = true`, else `SUSPENDED`
   - `roleCode` mapping:
     - `SUPER_ADMIN` -> `TENANT_ADMIN`
     - `ADMIN` -> `OPS_COORDINATOR` (or `TENANT_ADMIN`, choose once and keep consistent)
     - `MEMBER` -> `EMPLOYEE`
2. Set `users.status`:
   - active users -> `ACTIVE`
   - inactive users -> `SUSPENDED` (or `DEACTIVATED` if offboarded)
3. Fill `fullName` from `firstName + lastName` when null.

Runbook commands:

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:seed
DRY_RUN=1 pnpm prisma:backfill:auth-v1
pnpm prisma:backfill:auth-v1
```

Optional legacy admin role mapping:

```bash
ADMIN_ROLE_TARGET=TENANT_ADMIN pnpm prisma:backfill:auth-v1
```

Default mapping in script:

- `Role.ADMIN` -> `OPS_COORDINATOR`

### Phase 4: Dual-write transition in services

Deploy backend changes with dual-write:

- login/refresh/logout write to both `RefreshToken` and `RefreshSession` (temporary)
- role checks read from `Membership.roleCode` first, fallback to legacy `User.role`

### Phase 5: Switch reads to new source

After stability window:

- auth and guards read only `Membership` + `RolePermission`
- refresh flow uses only `RefreshSession`

### Phase 6: Cleanup migration

Remove legacy schema:

- drop `RefreshToken`
- drop `User.role`
- drop `User.isActive` after all services use `User.status` + membership status

## Data Validation Checklist

After Phase 3:

1. Every user has exactly one membership in current tenant:
   - no missing memberships
   - no duplicate (`tenantId`, `userId`)
2. No membership has invalid role code.
3. Active users have active memberships.
4. Invite tokens and reset tokens are hashed (never raw).
5. Login on migrated users returns expected role from membership.

After Phase 5:

1. Refresh rotation creates `RefreshSession` row and revokes predecessor.
2. Role change revokes all active refresh sessions for target user.
3. Deactivate user/membership blocks refresh immediately.

## Implementation Notes for This Repo

1. Keep `apps/api/src/modules/auth/auth.service.ts` backward-compatible during Phase 4.
2. Existing frontend currently expects `accessToken` in body; keep that unchanged in migration window.
3. `@CurrentTenant()` and tenant interceptor can stay; update source of `role` and `membershipId` from auth context.

## Open Decisions (Need Final Product Decision Before Coding)

1. Mapping `ADMIN` legacy role to `OPS_COORDINATOR` or `TENANT_ADMIN`.
2. Whether to enforce FK from `Membership.roleCode` to `Role.code` directly (recommended) or keep string-only first.
3. Whether `User.passwordHash` should become nullable immediately (invite-first) or in a follow-up migration.
4. Scope of `logout-all`: current tenant only vs all tenants (future multi-tenant).
