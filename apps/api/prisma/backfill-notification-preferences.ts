import { NotificationEventType, Prisma, PrismaClient, UserPreference } from '@prisma/client';

const prisma = new PrismaClient();

type NotificationPreferenceRow = Prisma.NotificationPreferenceUncheckedCreateInput;

function buildRows(pref: UserPreference, userId: string, tenantId: string): NotificationPreferenceRow[] {
  const rows: NotificationPreferenceRow[] = [
    {
      tenantId,
      userId,
      eventType: NotificationEventType.REQUEST_ASSIGNED,
      inApp: true,
      email: pref.assignmentAlerts,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.REQUEST_STATUS_CHANGED,
      inApp: pref.statusUpdateAlerts,
      email: pref.statusUpdateAlerts,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.SLA_NEAR_BREACH_RESPONSE,
      inApp: pref.slaRiskAlerts,
      email: pref.slaRiskAlerts,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.SLA_NEAR_BREACH_RESOLUTION,
      inApp: pref.slaRiskAlerts,
      email: pref.slaRiskAlerts,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.SLA_NEAR_BREACH_RESPONSE,
      inApp: false,
      email: pref.escalationAlerts,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.REQUEST_COMMENTED,
      inApp: pref.commentNotifications,
      email: pref.commentNotifications,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.REQUEST_MENTIONED,
      inApp: pref.mentionNotifications,
      email: pref.mentionNotifications,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.REQUEST_CREATED,
      inApp: true,
      email: pref.requestUpdateDigest,
    },
    {
      tenantId,
      userId,
      eventType: NotificationEventType.REQUEST_STATUS_CHANGED,
      inApp: false,
      email: pref.resolutionReminders,
    },
  ];

  const mergedByEventType = new Map<NotificationEventType, NotificationPreferenceRow>();
  for (const row of rows) {
    const existing = mergedByEventType.get(row.eventType);
    if (!existing) {
      mergedByEventType.set(row.eventType, row);
      continue;
    }

    mergedByEventType.set(row.eventType, {
      ...existing,
      inApp: existing.inApp || row.inApp,
      email: existing.email || row.email,
    });
  }

  return [...mergedByEventType.values()];
}

async function backfill(): Promise<void> {
  const prefs = await prisma.userPreference.findMany({
    include: {
      user: {
        select: {
          id: true,
          tenantId: true,
        },
      },
    },
  });

  for (const pref of prefs) {
    const { id: userId, tenantId } = pref.user;
    const rows = buildRows(pref, userId, tenantId);

    await prisma.$transaction(
      rows.map((row) =>
        prisma.notificationPreference.upsert({
          where: {
            userId_eventType: {
              userId: row.userId,
              eventType: row.eventType,
            },
          },
          create: row,
          update: {},
        }),
      ),
    );
  }

  console.log(`Backfill done: ${prefs.length} users processed`);
}

backfill()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
