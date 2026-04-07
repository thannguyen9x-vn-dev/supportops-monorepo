# TASK-502 — FE: Notification Preferences Page
> **Phase:** 5 — Frontend
> **Prereq:** TASK-302 done (API), TASK-501 done (notification service đã có)

---

## Files cần tạo / sửa

```text
apps/web/src/app/[locale]/(authenticated)/settings/notifications/
├── page.tsx         ← TẠO MỚI (≤ 50 lines — server component shell)
└── loading.tsx      ← TẠO MỚI

apps/web/src/features/notification/components/preferences/
├── NotificationPreferencesView.tsx   ← TẠO MỚI (≤ 150 lines)
├── PreferencesTable.tsx              ← TẠO MỚI (≤ 100 lines)
└── PreferenceRow.tsx                 ← TẠO MỚI (≤ 50 lines)

apps/web/src/features/notification/hooks/
└── useNotificationPreferences.ts     ← TẠO MỚI (≤ 80 lines)

apps/web/src/features/layout/config/
└── navigation.tsx                    ← SỬA: thêm Settings > Notifications link

apps/web/src/i18n/messages/
├── en.json    ← SỬA: thêm keys
└── vi.json    ← SỬA: thêm keys
```

---

## Spec chi tiết

### `page.tsx` — server component shell
```typescript
import { NotificationPreferencesView } from
  '@/features/notification/components/preferences/NotificationPreferencesView';

export default function NotificationPreferencesPage() {
  return <NotificationPreferencesView />;
}

export async function generateMetadata() {
  return { title: 'Notification Preferences — SupportOps' };
}
```

### `useNotificationPreferences.ts`
```typescript
export function useNotificationPreferences() {
  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn:  () => notificationPreferencesService.get(),
  });

  const mutation = useMutation({
    mutationFn: notificationPreferencesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success(t('preferences.saved'));
    },
  });

  return { preferences: data ?? [], isLoading, update: mutation.mutate, isSaving: mutation.isPending };
}
```

### `PreferencesTable.tsx` — 7 rows × 2 columns toggle matrix
```text
UI layout:
┌─────────────────────────────┬────────┬───────┐
│ Event                       │ In-App │ Email │
├─────────────────────────────┼────────┼───────┤
│ Request assigned to you     │  [x]   │  [x]  │
│ Request status changed      │  [x]   │  [ ]  │
│ New comment                 │  [x]   │  [x]  │
│ Mentioned in comment        │  [x]   │  [x]  │
│ New request created         │  [ ]   │  [x]  │
│ SLA response near breach    │  [x]   │  [x]  │
│ SLA resolution near breach  │  [x]   │  [x]  │
└─────────────────────────────┴────────┴───────┘
[Save Changes]
```

### Auto-save vs explicit save
- Dùng **explicit Save button** (không auto-save)
- Lý do: tránh API call mỗi toggle, user review trước khi submit

### i18n keys — thêm vào cả `en.json` và `vi.json`
```json
"notificationPreferences": {
  "title": "Notification Preferences",
  "subtitle": "Choose how you want to be notified",
  "columns": {
    "event": "Event",
    "inApp": "In-App",
    "email": "Email"
  },
  "save": "Save Changes",
  "saved": "Preferences saved"
}
```

---

## Test cases bắt buộc
```text
✓ Render 7 rows (tất cả event types)
✓ Toggle inApp → state thay đổi
✓ Toggle email → state thay đổi
✓ Save button → gọi update API với đúng payload
✓ Loading state khi fetch
✓ Success toast sau save
```

## Quality gate
```bash
pnpm --filter @supportops/web test NotificationPreferences
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-503**
