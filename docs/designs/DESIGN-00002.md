# DESIGN-00002 — SupportOps V2: Notification Realtime + Email + Knowledge Base + Canned Responses + Reporting Dashboard
> **Requirement:** `docs/requirements/REQ-00002.md`  
> **Status:** UPDATED — Ready for PO re-review  
> **Tech Lead:** _(filled after PO approval)_  
> **Created:** 2026-03-29  
> **Stack:** NestJS 11 + Prisma + PostgreSQL; Next.js (App Router) + React + MUI; BullMQ + Redis  
> **Principles:** contracts-first (`packages/types/`), multi-tenancy strict (`tenantId` in every query), thin controller → service owns logic

---

## 0) PO Decisions (Resolved)
### Q3 — Creator có nhận notification khi request được assigned/reassigned?
✅ **Yes (Option A)** — Requester/creator nhận cả in-app + email cho `request.assigned` / `request.reassigned`.

### Q4 — `request.created` gửi cho ai?
✅ **Queue-based (Option B)**  
- Nếu request có `queueId`: notify **OPS_COORDINATOR** members thuộc queue đó.  
- Fallback: nếu `queueId` null (hoặc không map được queue→ops): notify **all OPS_COORDINATOR** trong tenant.

> Lưu ý: cơ chế “ops thuộc queue nào” hiện chưa có schema trong phần bạn gửi. Trong V2.0 ta implement **fallback all OPS**; queue-based routing sẽ dùng rule sẵn có của hệ thống nếu đã tồn tại (TL/Dev kiểm tra `RequestQueue` usage). Nếu chưa có, cần PO confirm scope cho mapping queue-membership (có thể để V2.1).

---

## 1) Scope & Deliverables (Epics E1–E7)
- **E1** In-app Notification Center (SSE realtime + polling fallback)
- **E2** Email notifications (immediate + digest 5m + rate limit)
- **E3** Notification preferences (per user, per event × channel; migrate legacy UserPreference)
- **E4** SLA near-breach + escalation + SLA pause/resume (`WAITING_FOR_CUSTOMER`)
- **E5** Knowledge Base (CRUD + search + picker insert link)
- **E6** Canned Responses (CRUD + picker + variables)
- **E7** Reporting Dashboard v1 (overview metrics + byServiceType)

---

## 2) API Design (method, path, request/response contracts)

> API response format follow interceptor:  
> - success single: `{ "data": {...} }`  
> - success paginated: `{ "data": [...], "meta": {...} }`

### 2.1 Notifications (E1)

#### GET `/api/v1/notifications`
List notifications của current user.

**Query**
```json
{ "page": 1, "size": 20, "unreadOnly": false }
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "eventType": "REQUEST_ASSIGNED",
      "title": "Request assigned",
      "message": "SR-2026-0012 assigned to John Doe",
      "requestId": "uuid",
      "requestCode": "SR-2026-0012",
      "actorId": "uuid",
      "actorName": "Nguyen Van A",
      "isRead": false,
      "createdAt": "2026-03-29T10:00:00.000Z",
      "readAt": null
    }
  ],
  "meta": { "page": 1, "size": 20, "total": 100, "totalPages": 5 }
}
```

#### POST `/api/v1/notifications/:id/read`
Mark one as read.
- **Auth** required
- **Scope:** own notifications only

**Response**
```json
{ "data": { "id": "uuid", "isRead": true, "readAt": "2026-03-29T10:05:00.000Z" } }
```

#### POST `/api/v1/notifications/read-all`
Mark all as read.

**Response**
```json
{ "data": { "markedCount": 12 } }
```

#### GET `/api/v1/notifications/unread-count`
**Response**
```json
{ "data": { "count": 12 } }
```

#### GET `/api/v1/notifications/stream` (SSE)
Server-Sent Events stream for realtime updates.

Events:
```text
event: notification.created
data: {"notificationId":"uuid"}

event: notification.unread_count
data: {"count":13}
```

Fallback: FE polling `/unread-count` mỗi 30s nếu SSE fail.

---

### 2.2 Notification Preferences (E3)

#### GET `/api/v1/notification-preferences`
Return preferences matrix.

**Response**
```json
{
  "data": {
    "events": {
      "requestCreated": { "inApp": true, "email": true },
      "requestAssigned": { "inApp": true, "email": true },
      "requestStatusChanged": { "inApp": true, "email": true },
      "requestCommented": { "inApp": true, "email": true },
      "requestMentioned": { "inApp": true, "email": true },
      "slaNearBreachResponse": { "inApp": true, "email": true },
      "slaNearBreachResolution": { "inApp": true, "email": true }
    },
    "digest": { "enabled": true, "windowMinutes": 5 }
  }
}
```

#### PATCH `/api/v1/notification-preferences`
Partial update.

**Request**
```json
{
  "events": {
    "requestAssigned": { "email": false },
    "requestCommented": { "inApp": false }
  }
}
```

**Response**
```json
{ "data": { "updated": true } }
```

---

### 2.3 Request Watchers (FR-E1-04) — FIX GAP 2

#### POST `/api/v1/requests/:id/watch`
**Response**
```json
{ "data": { "requestId": "uuid", "isWatching": true } }
```

#### DELETE `/api/v1/requests/:id/watch`
**Response**
```json
{ "data": { "requestId": "uuid", "isWatching": false } }
```

#### GET `/api/v1/requests/:id/watchers` *(OPS_COORDINATOR/TENANT_ADMIN only; optional for debug)*
**Response**
```json
{
  "data": [
    { "userId": "uuid", "fullName": "Tran Thi B" }
  ]
}
```

---

### 2.4 Knowledge Base (E5) — includes picker (FR-E5-03) — FIX GAP 3

#### GET `/api/v1/knowledge-base/articles`
Query: `page,size,q,status,tag,category`

#### POST `/api/v1/knowledge-base/articles`
Create article.

#### GET `/api/v1/knowledge-base/articles/:id`
Detail.

#### PATCH `/api/v1/knowledge-base/articles/:id`
Update.

#### PATCH `/api/v1/knowledge-base/articles/:id/publish`
Publish.

#### DELETE `/api/v1/knowledge-base/articles/:id`
Soft delete (archive).

#### GET `/api/v1/knowledge-base/articles/picker?q=reset`
Lightweight endpoint for comment composer insert-link.

**Response**
```json
{
  "data": [
    { "id": "uuid", "title": "Reset password", "slug": "reset-password" }
  ]
}
```

---

### 2.5 Canned Responses (E6)

- GET `/api/v1/canned-responses`
- POST `/api/v1/canned-responses`
- PATCH `/api/v1/canned-responses/:id`
- DELETE `/api/v1/canned-responses/:id`
- GET `/api/v1/canned-responses/picker?q=/greet`

Canned variables supported: `{{requester_name}}`, `{{request_code}}`, `{{assignee_name}}`.

---

### 2.6 Reporting (E7) — FIX GAP 5

#### GET `/api/v1/reports/overview?from=...&to=...`
**Response**
```json
{
  "data": {
    "byStatus": [{ "status": "SUBMITTED", "count": 10 }],
    "byPriority": [{ "priority": "HIGH", "count": 5 }],
    "byServiceType": [{ "serviceTypeCode": "IT_SUPPORT", "count": 45 }],
    "sla": {
      "nearBreachResponse": 3,
      "nearBreachResolution": 2,
      "breachedResponse": 1,
      "breachedResolution": 4,
      "complianceRate": 0.92
    },
    "avg": {
      "firstResponseMinutes": 45,
      "resolutionMinutes": 360
    }
  }
}
```

---

## 3) RBAC Scoping (roles + permissions)

### 3.1 Reality check: DB Role vs Business roles
- Prisma `User.role` is `MEMBER/ADMIN/SUPER_ADMIN` (global)
- **Tenant role** is `Membership.roleCode` → `AuthRolePermission`
- Business roles in REQ map to `roleCode`:
  - `EMPLOYEE`, `TECHNICIAN`, `OPS_COORDINATOR`, `TENANT_ADMIN`

### 3.2 Permission matrix (REQ-aligned) — FIX GAP 1

| Feature | EMPLOYEE | TECHNICIAN | OPS_COORDINATOR | TENANT_ADMIN |
|---|---:|---:|---:|---:|
| Notifications (list/read/update) | own | own | own | own |
| Notification preferences | own | own | own | own |
| Request watch/unwatch | own requests | assigned/visible requests | tenant-wide | tenant-wide |
| KB read published | ✅ | ✅ | ✅ | ✅ |
| KB CRUD | ❌ | ✅ | ✅ | ✅ |
| Canned use picker | ❌ | ✅ | ✅ | ✅ |
| Canned CRUD | ❌ | ❌ | ✅ | ✅ |
| Reports overview | ❌ | ❌ | ✅ (read) | ✅ (read) |

**Tenant isolation:** mọi endpoint đều lấy `tenantId` từ `@CurrentTenant()`, mọi Prisma query đều filter `tenantId`.

---

## 4) Database Changes (Prisma)

### 4.1 Enum: add `WAITING_FOR_CUSTOMER` (REQ Q2 resolved)
```prisma
enum RequestStatus {
  DRAFT
  SUBMITTED
  TRIAGE
  ASSIGNED
  IN_PROGRESS
  WAITING_FOR_CUSTOMER   // NEW
  RESOLVED
  CLOSED
  WAITING_EXTERNAL_VENDOR
  REOPENED
  CANCELLED
}
```

### 4.2 New models

#### Notification + NotificationPreference
```prisma
enum NotificationChannel {
  IN_APP
  EMAIL
}

enum NotificationEventType {
  REQUEST_CREATED
  REQUEST_ASSIGNED
  REQUEST_STATUS_CHANGED
  REQUEST_COMMENTED
  REQUEST_MENTIONED
  SLA_NEAR_BREACH_RESPONSE
  SLA_NEAR_BREACH_RESOLUTION
  SLA_BREACHED_RESPONSE
  SLA_BREACHED_RESOLUTION
}

model Notification {
  id        String @id @default(uuid())
  tenantId  String
  userId    String
  eventType NotificationEventType
  channel   NotificationChannel @default(IN_APP)
  title     String
  message   String
  requestId String?
  actorId   String?
  metadata  Json?
  isRead    Boolean @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  request ServiceRequest? @relation(fields: [requestId], references: [id], onDelete: SetNull)

  @@index([tenantId, userId, isRead, createdAt])
  @@index([tenantId, requestId, createdAt])
}

model NotificationPreference {
  id        String @id @default(uuid())
  tenantId  String
  userId    String
  eventType NotificationEventType
  inApp     Boolean @default(true)
  email     Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, userId, eventType])
  @@index([tenantId, userId])
}
```

#### RequestWatcher (FR-E1-04)
```prisma
model RequestWatcher {
  tenantId  String
  requestId String
  userId    String
  createdAt DateTime @default(now())

  tenant  Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  request ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  user    User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([tenantId, requestId, userId])
  @@index([tenantId, userId])
}
```

#### KnowledgeArticle
```prisma
enum KnowledgeArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model KnowledgeArticle {
  id        String @id @default(uuid())
  tenantId  String
  title     String
  slug      String
  body      String
  tags      String[]
  category  String?
  status    KnowledgeArticleStatus @default(DRAFT)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@unique([tenantId, slug])
  @@index([tenantId, status, updatedAt])
  @@index([tenantId, title])
}
```

#### CannedResponse
```prisma
model CannedResponse {
  id        String @id @default(uuid())
  tenantId  String
  title     String
  body      String
  tags      String[]
  category  String?
  shortcut  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, shortcut])
  @@index([tenantId, title])
}
```

### 4.3 SLA pause tracking — FIX GAP 4
Schema hiện có `pausedAt/resumedAt` trên `SlaRecord`. Để support **multiple pauses** và compute đúng, thêm accumulator:

```prisma
model SlaRecord {
  // existing...
  pausedAt DateTime?
  resumedAt DateTime?
  totalPausedMinutes Int @default(0)   // NEW
  nearBreachNotifiedAt DateTime?       // NEW (idempotency)
}
```

Worker logic:
- Enter `WAITING_FOR_CUSTOMER`: set `pausedAt=now` if not paused
- Exit: add diff minutes(pausedAt, now) → `totalPausedMinutes`, set `pausedAt=null`, `resumedAt=now`
- Effective due time = `targetAt + totalPausedMinutes`

---

## 5) Types Contract changes (`packages/types/`)

Add new types under `packages/types/src/types/` (or follow existing structure: `core/` vs `service-ops/` endpoints).

### 5.1 Enums
- `NotificationEventType`
- `NotificationChannel`
- `KnowledgeArticleStatus`

### 5.2 DTOs
- `NotificationItem`, `ListNotificationsQuery`, `UnreadCountResponse`
- `NotificationPreferencesDto` (matrix)
- `KnowledgeArticle`, `KnowledgeArticlePickerItem`
- `CannedResponse`, `CannedResponsePickerItem`
- `ReportsOverviewResponse` include `byServiceType`

### 5.3 Endpoints constants
Append to `packages/types/src/endpoints.ts`:
- `notifications.*`
- `notificationPreferences.*`
- `requests.watch/unwatch`
- `knowledgeBase.*`
- `cannedResponses.*`
- `reports.overview`

---

## 6) Frontend Architecture (routes + component tree + hooks/services)
Conform `apps/web/AGENTS.md` size limits.

### 6.1 Routes (App Router)
Use existing `(authenticated)` group:
- `apps/web/src/app/[locale]/(authenticated)/settings/notifications/page.tsx`
- `apps/web/src/app/[locale]/(authenticated)/knowledge-base/page.tsx`
- `apps/web/src/app/[locale]/(authenticated)/knowledge-base/[id]/page.tsx`
- `apps/web/src/app/[locale]/(authenticated)/settings/canned-responses/page.tsx`
- `apps/web/src/app/[locale]/(authenticated)/reports/overview/page.tsx` (already exists; extend)

### 6.2 Notifications in header
Modify `apps/web/src/features/layout/components/Header/Header.tsx`:
- add `<NotificationBell/>` (client island)

New feature folder:
```
apps/web/src/features/notifications/
  components/
    NotificationBell.tsx                 (≤100)
    NotificationPopover.tsx              (≤100)
    NotificationList.tsx                 (≤100)
    NotificationItemRow.tsx              (≤80)
  hooks/
    useNotifications.ts                  (≤120)
    useNotificationStream.ts             (≤120)
    useNotificationUnreadCount.ts        (≤80)
  services/
    notifications.service.ts             (≤80)
```

### 6.3 Notification settings page
Reuse settings patterns:
```
features/settings-notifications/
  components/
    NotificationSettingsView.tsx         (≤150)
    NotificationSettingsTable.tsx        (≤100)
  hooks/
    useNotificationPreferences.ts        (≤120)
  services/
    notification-preferences.service.ts  (≤80)
```

### 6.4 Watch button (requests detail)
Add to request detail header area:
```
features/service-ops/requests/components/header/
  RequestWatchButton.tsx                 (≤80)
features/service-ops/requests/hooks/
  useRequestWatch.ts                     (≤120)
features/service-ops/requests/services/
  request-watch.service.ts               (≤80)
```

### 6.5 KB picker in comment composer — FIX GAP 3
Existing: `features/service-ops/requests/components/activity/comments/CommentComposer.tsx`

Add a KB insertion button:
- open modal using `FormDialog` from `@supportops/ui-dialog`
- search via `/knowledge-base/articles/picker`

New components:
```
features/knowledge-base/components/
  KnowledgeBasePickerDialog.tsx          (≤100)
features/knowledge-base/hooks/
  useKnowledgeBasePicker.ts              (≤120)
features/knowledge-base/services/
  knowledge-base.service.ts              (≤80)
```

### 6.6 Canned responses picker
Similar pattern using existing `Combobox` in `packages/ui` if possible (no new dependency).

### 6.7 Reporting dashboard (reports/overview)
Extend existing `features/reports` to include:
- `byServiceType` bar chart
- KPI cards
- date range filter (URL-driven)

---

## 7) Implementation Order (types → DB → BE → worker → FE)
1. Update `packages/types` contracts + endpoints
2. Prisma migration(s) (add enums + new tables + sla record fields)
3. Backend modules:
   - notifications (CRUD + SSE)
   - notification-preferences
   - request-watchers
   - knowledge-base
   - canned-responses
   - reports/overview aggregation
4. Worker:
   - digest job (5m per user per request) + rate limit 5 emails/hr/request
   - immediate email job
   - SLA near-breach job (1–5m interval), idempotent using `nearBreachNotifiedAt`
5. Frontend:
   - notification bell + settings
   - watch button
   - KB/canned pickers in comment composer
   - KB pages + canned mgmt + report charts

---

## 8) Testing Plan

### Backend (Nest + Prisma)
- Notifications:
  - list only returns `tenantId` + `userId` scoped
  - mark read forbids reading others
- Watcher:
  - employee cannot watch foreign request
  - watchers included in fan-out
- SLA:
  - pause/resume updates `totalPausedMinutes` correctly with multiple pauses
  - near-breach fired once per SLA record type
- Reports:
  - `byServiceType` counts match filtered window

### Worker
- Digest grouping:
  - 3 events within 5 minutes → 1 email
  - immediate events bypass digest
- Rate limit:
  - >5 per hour per user per request throttled

### Frontend
- Notification bell:
  - unread badge updates (SSE)
  - fallback polling works
- Preferences:
  - toggles optimistic save + persistence
- Comment composer:
  - insert KB link
  - insert canned response with variables resolved

### E2E (Playwright)
- Create request → queue ops notified
- Assign request → assignee + requester notified + email (≤60s)
- Mention in comment → mentioned user notified

---

## 9) Risks & Mitigations
- **Queue-based routing (Q4)** depends on existing queue membership mapping → fallback all OPS.
- **Enum change** adds `WAITING_FOR_CUSTOMER` → must update workflow transitions seed + UI labels.
- **Worker idempotency**: use `nearBreachNotifiedAt` + unique job key; ensure at-least-once safe.
- **Tenant leak risk**: enforce `tenantId` in every query + tests + review checklist §14.

---

## 10) Summary for PO
- Q3/Q4 resolved and incorporated.
- 5 gaps fixed: TECHNICIAN RBAC, watchers, KB picker, SLA pause tracking, reports byServiceType.
- Remaining optional decisions: queue-membership routing details (if not available, V2 uses fallback all OPS).

