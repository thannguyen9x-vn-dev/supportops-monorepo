# TASK-202 — Backfill Script (UserPreference → NotificationPreference)
> **Phase:** 2 — Database | **Prereq:** TASK-201 done (migration đã chạy)

---

## Mục tiêu
Migrate data từ 8 legacy fields trong `UserPreference` sang model `NotificationPreference` mới.
Script phải **idempotent** — chạy nhiều lần không tạo duplicate.

---

## File cần tạo

```text
apps/api/prisma/
└── backfill-notification-preferences.ts   ← TẠO MỚI
```

---

## Spec chi tiết

### Mapping logic
```text
UserPreference field        → NotificationPreference row(s)
─────────────────────────────────────────────────────────
assignmentAlerts            → REQUEST_ASSIGNED       {inApp: true,  email: value}
statusUpdateAlerts          → REQUEST_STATUS_CHANGED {inApp: value, email: value}
slaRiskAlerts               → SLA_NEAR_BREACH_RESPONSE    {inApp: value, email: value}
                            → SLA_NEAR_BREACH_RESOLUTION  {inApp: value, email: value}
escalationAlerts            → SLA_NEAR_BREACH_RESPONSE    {inApp: false, email: value}
commentNotifications        → REQUEST_COMMENTED      {inApp: value, email: value}
mentionNotifications        → REQUEST_MENTIONED      {inApp: value, email: value}
requestUpdateDigest         → REQUEST_CREATED        {inApp: true,  email: value}
resolutionReminders         → REQUEST_STATUS_CHANGED {inApp: false, email: value}
```

### Script structure
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
  const prefs = await prisma.userPreference.findMany({
    include: { user: { select: { id: true, tenantId: true } } },
  });

  for (const pref of prefs) {
    const { userId, tenantId } = pref.user;
    const rows = buildRows(pref, userId, tenantId);

    await prisma.$transaction(
      rows.map(row =>
        prisma.notificationPreference.upsert({
          where: { userId_eventType: { userId: row.userId, eventType: row.eventType } },
          create: row,
          update: {},   // ← idempotent: không ghi đè nếu đã có
        })
      )
    );
  }

  console.log(`Backfill done: ${prefs.length} users processed`);
}

backfill().finally(() => prisma.$disconnect());
```

---

## ⚠️ QUAN TRỌNG
- `UserPreference` cũ **KHÔNG bị xóa** sau khi backfill (giữ lại để tránh break)
- Sau V2 stable → V2.1 mới xóa legacy fields

## Quality gate
```bash
npx ts-node apps/api/prisma/backfill-notification-preferences.ts
# → "Backfill done: X users processed"
# → Chạy lần 2 → vẫn "Backfill done" không có lỗi duplicate
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-301**
