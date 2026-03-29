# TASK-301 — BE: Notification Module
> **Phase:** 3 — Backend | **Prereq:** TASK-201 + TASK-202 done

---

## ⚠️ Kiểm tra trước khi tạo
```bash
# Kiểm tra xem đã tồn tại chưa:
ls apps/api/src/modules/core/notification/
# Nếu có notification-core.module.ts → đọc hiểu trước, tránh duplicate logic
```

---

## Files cần tạo

```text
apps/api/src/modules/notification/
├── notification.module.ts
├── notification.controller.ts
├── notification.controller.spec.ts
├── notification.service.ts
├── notification.service.spec.ts
└── dto/
    ├── notification-query.dto.ts
    ├── notification-response.dto.ts
    └── notification-list-response.dto.ts
```

---

## Spec chi tiết

### Endpoints
| Method | Path | Guard |
|---|---|---|
| GET | `/notifications` | Auth + `notification.read.own` |
| PATCH | `/notifications/:id/read` | Auth + `notification.update.own` |
| PATCH | `/notifications/read-all` | Auth + `notification.update.own` |
| GET | `/notifications/unread-count` | Auth |
| GET | `/notifications/stream` | Auth (SSE) |

### `notification-query.dto.ts`
```typescript
export class NotificationQueryDto {
  @IsOptional() @Type(() => Number) @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @Min(1) @Max(50)
  size?: number = 20;

  @IsOptional() @Transform(({ value }) => value === 'true')
  unread?: boolean;
}
```

### `notification.service.ts` — methods
```typescript
findAll(tenantId: string, userId: string, query: NotificationQueryDto)
markRead(tenantId: string, userId: string, id: string)    // 404 nếu không thuộc user
markAllRead(tenantId: string, userId: string): Promise<{ count: number }>
getUnreadCount(tenantId: string, userId: string): Promise<number>
createNotification(data: CreateNotificationData)          // dùng bởi fan-out service
streamForUser(tenantId: string, userId: string)           // returns Observable<MessageEvent>
```

### SSE endpoint
```typescript
@Get('stream')
@Sse()
stream(
  @CurrentTenant() tenantId: string,
  @CurrentUser('sub') userId: string,
): Observable<MessageEvent> {
  return this.notificationService.streamForUser(tenantId, userId);
}
```

### Security checklist
- [x] `tenantId` filter bắt buộc trên mọi query
- [x] `userId` filter — user chỉ thấy notification của chính mình
- [x] `markRead` check ownership trước khi update (throw 404 nếu không phải owner)
- [x] SSE stream chỉ emit cho đúng user

---

## Test cases bắt buộc (`notification.service.spec.ts`)
```text
✓ findAll: chỉ trả notification của đúng user + tenant
✓ findAll: filter unread=true hoạt động đúng
✓ findAll: pagination đúng
✓ markRead: 404 nếu notification không thuộc user
✓ markRead: 404 nếu notification thuộc tenant khác
✓ markAllRead: chỉ mark của đúng user
✓ getUnreadCount: đếm đúng
✓ createNotification: lưu đúng fields
```

## Quality gate
```bash
pnpm --filter @supportops/api test notification   # 0 failures
pnpm typecheck                                     # 0 errors
pnpm lint                                          # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-302**
