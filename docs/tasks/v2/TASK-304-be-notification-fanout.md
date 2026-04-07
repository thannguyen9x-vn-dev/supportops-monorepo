# TASK-304 — BE: Notification Fan-out Service
> **Phase:** 3 — Backend | **Prereq:** TASK-301 + TASK-303 done

---

## Mục tiêu
Tạo service xử lý logic "ai nhận notification khi nào" — wire vào event listener hiện có.

---

## Files cần tạo / sửa

```text
apps/api/src/modules/notification/
└── notification-fanout.service.ts     ← TẠO MỚI

apps/api/src/modules/service-ops/request/events/
└── request-activity.listener.ts      ← SỬA: inject + gọi fanout service
```

---

## Spec chi tiết

### `notification-fanout.service.ts` — methods

```typescript
// Q4: Option B — request.created → notify OPS trong queue; fallback → all OPS_COORDINATOR
handleRequestCreated(event: RequestCreatedEvent): Promise<void>

// Q3: Option A — assigned → notify cả assignee + creator
handleRequestAssigned(event: RequestAssignedEvent): Promise<void>

// status changed → notify creator + assignee + watchers
handleStatusChanged(event: RequestStatusChangedEvent): Promise<void>

// commented → notify creator + assignee + watchers (trừ commenter)
handleCommented(event: RequestCommentedEvent): Promise<void>

// @mentioned → notify mentioned users chỉ
handleMentioned(event: RequestMentionedEvent): Promise<void>

// SLA breach → notify assignee + OPS_COORDINATOR
handleSlaBreached(event: SlaBreachedEvent): Promise<void>
```

### Fan-out recipient logic
```text
handleRequestCreated:
  1. Lấy request.queueId
  2. Nếu có queueId → notify tất cả OPS trong queue đó
  3. Nếu không có queueId → notify tất cả OPS_COORDINATOR của tenant (fallback)

handleRequestAssigned (Q3 = Option A):
  recipients = [assigneeId, creatorId]  ← cả 2

handleStatusChanged:
  watchers = await requestWatcherService.getWatcherIds(tenantId, requestId)
  recipients = unique([creatorId, assigneeId, ...watchers])

handleCommented:
  watchers = await requestWatcherService.getWatcherIds(tenantId, requestId)
  recipients = unique([creatorId, assigneeId, ...watchers])
    .filter(id => id !== commenterId)  ← trừ người vừa comment
```

### Check preferences trước khi gửi
```typescript
// Trước khi create Notification hoặc enqueue email:
const pref = await notificationPreferenceService.getForUser(userId, eventType);
if (pref.inApp) → create Notification row
if (pref.email) → enqueue email job
```

---

## Test cases bắt buộc
```text
✓ handleRequestAssigned: cả assignee + creator đều nhận
✓ handleRequestAssigned: không gửi nếu preference email=false
✓ handleCommented: commenter không nhận notification của chính mình
✓ handleRequestCreated: gửi cho queue nếu có queueId
✓ handleRequestCreated: fallback → gửi tất cả OPS_COORDINATOR
✓ handleSlaBreached: notify đúng recipients
```

## Quality gate
```bash
pnpm --filter @supportops/api test notification-fanout
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-305**
