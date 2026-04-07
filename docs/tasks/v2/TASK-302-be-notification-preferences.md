# TASK-302 — BE: Notification Preferences
> **Phase:** 3 — Backend | **Prereq:** TASK-301 done

---

## Files cần tạo (trong cùng notification module)

```text
apps/api/src/modules/notification/
├── notification-preference.controller.ts
├── notification-preference.service.ts
├── notification-preference.service.spec.ts
└── dto/
    ├── update-notification-preferences.dto.ts
    └── notification-preferences-response.dto.ts
```

---

## Spec chi tiết

### Endpoints
| Method | Path | Guard |
|---|---|---|
| GET | `/notification-preferences` | Auth |
| PUT | `/notification-preferences` | Auth |

### `notification-preference.service.ts`
```typescript
// getPreferences: luôn trả đủ 7 event types
// dù user chưa có row → merge với defaults (inApp=true, email=true)
getPreferences(tenantId: string, userId: string): Promise<NotificationPreferenceItem[]>

// upsert: update nếu tồn tại, create nếu chưa có
upsertPreferences(
  tenantId: string,
  userId: string,
  dto: UpdatePreferencesDto
): Promise<NotificationPreferenceItem[]>
```

### Logic `getPreferences` — merge với defaults:
```typescript
const ALL_EVENT_TYPES = Object.values(NotificationEventType);
const existing = await prisma.notificationPreference.findMany({
  where: { userId, tenantId }
});
const existingMap = new Map(existing.map(p => [p.eventType, p]));

return ALL_EVENT_TYPES.map(eventType => ({
  eventType,
  inApp: existingMap.get(eventType)?.inApp ?? true,
  email: existingMap.get(eventType)?.email ?? true,
}));
```

---

## Test cases bắt buộc
```text
✓ getPreferences: trả đủ 7 event types dù user chưa có row nào
✓ getPreferences: merge đúng với existing rows
✓ upsertPreferences: update row đã tồn tại
✓ upsertPreferences: create row chưa tồn tại
✓ tenantId isolation
```

## Quality gate
```bash
pnpm --filter @supportops/api test notification-preference
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-303**
