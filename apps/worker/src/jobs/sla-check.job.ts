import { PrismaClient, RequestStatus, SlaHealth } from '@prisma/client';

const INACTIVE_REQUEST_STATUSES: RequestStatus[] = [
  RequestStatus.RESOLVED,
  RequestStatus.CLOSED,
  RequestStatus.CANCELLED,
  RequestStatus.WAITING_FOR_CUSTOMER,
];

const DEFAULT_NEAR_BREACH_THRESHOLD_MINUTES = 30;

export interface NotificationQueueLike {
  add(name: string, payload: Record<string, unknown>): Promise<unknown>;
}

export interface SlaCheckJobResult {
  checked: number;
  nearBreachNotified: number;
  breached: number;
}

export async function runSlaCheckJob(
  prisma: PrismaClient,
  notificationQueue: NotificationQueueLike,
): Promise<SlaCheckJobResult> {
  const now = Date.now();

  const records = await prisma.slaRecord.findMany({
    where: {
      isBreached: false,
      nearBreachNotifiedAt: null,
      pausedAt: null,
      request: {
        status: {
          notIn: INACTIVE_REQUEST_STATUSES,
        },
      },
    },
    select: {
      id: true,
      tenantId: true,
      requestId: true,
      type: true,
      targetAt: true,
      totalPausedSeconds: true,
      request: {
        select: {
          tenantId: true,
          assigneeId: true,
          serviceType: {
            select: {
              code: true,
            },
          },
        },
      },
    },
  });

  const thresholdMap = await buildThresholdMap(prisma, records);

  let nearBreachNotified = 0;
  let breached = 0;

  for (const record of records) {
    const serviceTypeCode = record.request.serviceType.code;
    const thresholdKey = `${record.tenantId}:${serviceTypeCode}`;
    const thresholdMinutes = thresholdMap.get(thresholdKey) ?? DEFAULT_NEAR_BREACH_THRESHOLD_MINUTES;

    const adjustedTarget = new Date(record.targetAt.getTime() + record.totalPausedSeconds * 1000);
    const minutesRemaining = (adjustedTarget.getTime() - now) / 60000;

    if (minutesRemaining <= 0) {
      breached += 1;
      await prisma.slaRecord.update({
        where: { id: record.id },
        data: {
          isBreached: true,
          health: SlaHealth.BREACHED,
        },
      });

      await notificationQueue.add('sla.breached', {
        type: record.type,
        requestId: record.requestId,
        tenantId: record.request.tenantId,
        assigneeId: record.request.assigneeId,
      });
      continue;
    }

    if (minutesRemaining <= thresholdMinutes) {
      nearBreachNotified += 1;
      await notificationQueue.add('sla.near-breach', {
        type: record.type,
        requestId: record.requestId,
        tenantId: record.request.tenantId,
        assigneeId: record.request.assigneeId,
        minutesRemaining: Math.round(minutesRemaining),
      });

      await prisma.slaRecord.update({
        where: { id: record.id },
        data: {
          nearBreachNotifiedAt: new Date(now),
        },
      });
    }
  }

  return {
    checked: records.length,
    nearBreachNotified,
    breached,
  };
}

async function buildThresholdMap(
  prisma: PrismaClient,
  records: Array<{ tenantId: string; request: { serviceType: { code: string } } }>,
): Promise<Map<string, number>> {
  const uniquePairs = new Set(records.map((record) => `${record.tenantId}:${record.request.serviceType.code}`));
  if (uniquePairs.size === 0) {
    return new Map();
  }

  const pairs = [...uniquePairs].map((item) => {
    const [tenantId, serviceTypeCode] = item.split(':');
    return { tenantId: tenantId ?? '', serviceTypeCode: serviceTypeCode ?? '' };
  });

  const thresholdRows = await prisma.slaPolicy.findMany({
    where: {
      OR: pairs,
      isActive: true,
    },
    select: {
      tenantId: true,
      serviceTypeCode: true,
      nearBreachThresholdMinutes: true,
    },
  });

  return new Map(
    thresholdRows.map((row) => [
      `${row.tenantId}:${row.serviceTypeCode}`,
      row.nearBreachThresholdMinutes,
    ]),
  );
}
