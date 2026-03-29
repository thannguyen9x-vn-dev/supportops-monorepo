# TASK-101 — Types: Notification
> **Phase:** 1 — Types
> **Prereq:** `_CONTEXT.md` đã đọc

---

## Mục tiêu
Tạo type contracts cho toàn bộ Notification feature. Đây là source of truth — BE và FE đều import từ đây.

---

## Files cần tạo / sửa

```text
packages/types/src/
├── enums/
│   └── notification.enums.ts          ← TẠO MỚI
├── types/
│   └── notification.types.ts          ← TẠO MỚI
├── schemas/
│   └── notification.schema.ts         ← TẠO MỚI
└── index.ts                           ← SỬA: re-export mới
```

---

## Spec chi tiết

### `enums/notification.enums.ts`
```typescript
export enum NotificationEventType {
  REQUEST_CREATED              = 'REQUEST_CREATED',
  REQUEST_ASSIGNED             = 'REQUEST_ASSIGNED',
  REQUEST_STATUS_CHANGED       = 'REQUEST_STATUS_CHANGED',
  REQUEST_COMMENTED            = 'REQUEST_COMMENTED',
  REQUEST_MENTIONED            = 'REQUEST_MENTIONED',
  SLA_NEAR_BREACH_RESPONSE     = 'SLA_NEAR_BREACH_RESPONSE',
  SLA_NEAR_BREACH_RESOLUTION   = 'SLA_NEAR_BREACH_RESOLUTION',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL  = 'EMAIL',
}
```

### `types/notification.types.ts`
```typescript
import { NotificationEventType } from '../enums/notification.enums';

export interface NotificationItem {
  id: string;
  type: NotificationEventType;
  title: string;
  body: string;
  requestId:   string | null;
  requestCode: string | null;
  actorId:     string | null;
  actorName:   string | null;
  isRead:  boolean;
  readAt:  string | null;
  createdAt: string;
}

export interface NotificationPreferenceItem {
  eventType: NotificationEventType;
  inApp:  boolean;
  email:  boolean;
}

export interface NotificationUnreadCount {
  count: number;
}

export interface ListNotificationsQuery {
  page?:   number;
  size?:   number;
  unread?: boolean;
}
```

### `schemas/notification.schema.ts`
```typescript
import { z } from 'zod';
import { NotificationEventType } from '../enums/notification.enums';

export const updatePreferenceItemSchema = z.object({
  eventType: z.nativeEnum(NotificationEventType),
  inApp: z.boolean(),
  email: z.boolean(),
});

export const updatePreferencesSchema = z.object({
  preferences: z.array(updatePreferenceItemSchema).min(1),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
```

### `index.ts` — append (không xóa export cũ):
```typescript
export * from './enums/notification.enums';
export * from './types/notification.types';
export * from './schemas/notification.schema';
```

---

## Test file
`packages/types/src/__tests__/notification.schema.test.ts`
```typescript
describe('updatePreferencesSchema', () => {
  it('validates valid input', () => { /* ... */ });
  it('rejects unknown eventType', () => { /* ... */ });
  it('rejects empty preferences array', () => { /* ... */ });
});
```

## Quality gate
```bash
cd packages/types && pnpm typecheck   # 0 errors
pnpm lint                              # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-102**
