# TASK-501 — FE: Notification Bell + Popover
> **Phase:** 5 — Frontend
> **Prereq:** TASK-301 + TASK-302 done (API endpoints live)
> **Đọc trước:** `apps/web/AGENTS.md` §Component Size + §UI Library Checklist

---

## Files cần tạo / sửa

```text
apps/web/src/features/notification/
├── components/
│   ├── NotificationBell.tsx            ← TẠO MỚI (≤ 60 lines)
│   ├── NotificationBell.test.tsx       ← TẠO MỚI
│   ├── NotificationPopover.tsx         ← TẠO MỚI (≤ 80 lines)
│   ├── NotificationList.tsx            ← TẠO MỚI (≤ 100 lines)
│   ├── NotificationItem.tsx            ← TẠO MỚI (≤ 60 lines)
│   └── NotificationEmptyState.tsx      ← TẠO MỚI (≤ 30 lines)
├── hooks/
│   ├── useNotifications.ts             ← TẠO MỚI (≤ 120 lines)
│   ├── useNotificationCount.ts         ← TẠO MỚI (≤ 80 lines)
│   └── useNotificationSSE.ts           ← TẠO MỚI (≤ 100 lines)
└── services/
    └── notification.service.ts         ← TẠO MỚI (≤ 80 lines)

apps/web/src/features/layout/components/Header/
└── Header.tsx                          ← SỬA: thêm <NotificationBell />

apps/web/src/i18n/messages/
├── en.json                             ← SỬA: thêm "notifications" namespace
└── vi.json                             ← SỬA: thêm "notifications" namespace
```

---

## Spec chi tiết

### `notification.service.ts`
```typescript
import { apiClient } from '@/lib/api/client';
import { NOTIFICATION_ENDPOINTS } from '@supportops/types';
import type { NotificationItem, NotificationUnreadCount, ListNotificationsQuery } from '@supportops/types';

export const notificationService = {
  list:        (q: ListNotificationsQuery) =>
    apiClient.get<PaginatedResponse<NotificationItem>>(NOTIFICATION_ENDPOINTS.list, { params: q }),
  markRead:    (id: string) =>
    apiClient.patch(NOTIFICATION_ENDPOINTS.markRead(id)),
  markAllRead: () =>
    apiClient.patch(NOTIFICATION_ENDPOINTS.markAllRead),
  unreadCount: () =>
    apiClient.get<NotificationUnreadCount>(NOTIFICATION_ENDPOINTS.unreadCount),
};
```

### `useNotificationSSE.ts`
```typescript
// SSE EventSource với auto-reconnect
export function useNotificationSSE(onNewNotification: (n: NotificationItem) => void) {
  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource(`/api/notifications/stream`, { withCredentials: true });
      es.onmessage = (e) => {
        const data = JSON.parse(e.data) as NotificationItem;
        onNewNotification(data);
      };
      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000);  // retry sau 5 giây
      };
    }

    connect();
    return () => { es?.close(); clearTimeout(retryTimeout); };
  }, []);
}
```

### `useNotificationCount.ts`
```typescript
// Kết hợp TanStack Query (initial count) + SSE (increment khi có mới)
export function useNotificationCount() {
  const [liveCount, setLiveCount] = useState(0);

  const { data } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: () => notificationService.unreadCount(),
  });

  useEffect(() => {
    if (data?.count !== undefined) setLiveCount(data.count);
  }, [data?.count]);

  useNotificationSSE((newNotification) => {
    setLiveCount(prev => prev + 1);
    // Invalidate list query để refresh popover
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  });

  return liveCount;
}
```

### `NotificationBell.tsx`
```typescript
// Bell icon + badge
// Dùng MUI: IconButton + Badge + NotificationsIcon
// Khi click → toggle NotificationPopover
// Badge ẩn khi count = 0
```

### `NotificationList.tsx`
```typescript
// - Filter tabs: All / Unread
// - "Mark all as read" button (chỉ hiện khi có unread)
// - Infinite scroll HOẶC "Load more" button (chọn 1 cách, ghi note lý do)
// - Mỗi row → <NotificationItem />
// - Khi list rỗng → <NotificationEmptyState />
```

### `NotificationItem.tsx`
```typescript
// - Icon theo eventType (dùng MUI icons)
// - Title + body (truncate nếu dài)
// - Timestamp relative (e.g. "2 phút trước") — dùng date-fns hoặc dayjs
// - Bold nếu chưa đọc
// - Khi click → navigate đến request (nếu có requestId) + markRead
```

### i18n keys — thêm vào cả `en.json` và `vi.json`
```json
"notifications": {
  "title": "Notifications",
  "markAllRead": "Mark all as read",
  "empty": "No notifications",
  "emptyUnread": "No unread notifications",
  "tabs": {
    "all": "All",
    "unread": "Unread"
  },
  "eventType": {
    "REQUEST_CREATED": "New request created",
    "REQUEST_ASSIGNED": "Request assigned to you",
    "REQUEST_STATUS_CHANGED": "Request status updated",
    "REQUEST_COMMENTED": "New comment on request",
    "REQUEST_MENTIONED": "You were mentioned",
    "SLA_NEAR_BREACH_RESPONSE": "SLA response deadline approaching",
    "SLA_NEAR_BREACH_RESOLUTION": "SLA resolution deadline approaching"
  }
}
```

### Sửa `Header.tsx`
```typescript
// Thêm vào sau UserMenu (hoặc trước):
import { NotificationBell } from '@/features/notification/components/NotificationBell';

// Trong JSX header:
<NotificationBell />
<UserMenu />
```

---

## Test cases bắt buộc (`NotificationBell.test.tsx`)
```text
✓ Render bell icon
✓ Badge hiển thị số unread đúng
✓ Badge ẩn khi count = 0
✓ Click bell → popover mở
✓ Click ngoài popover → popover đóng
```

## Quality gate
```bash
pnpm --filter @supportops/web test NotificationBell
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-502**
