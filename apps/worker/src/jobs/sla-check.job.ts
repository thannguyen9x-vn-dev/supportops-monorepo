import { PrismaClient, RequestActivityType, RequestStatus, SlaHealth } from '@prisma/client';
import { log } from '../logger';

const ACTIVE_REQUEST_STATUSES = [
  RequestStatus.SUBMITTED,
  RequestStatus.TRIAGE,
  RequestStatus.ASSIGNED,
  RequestStatus.IN_PROGRESS,
] as const;

export type SlaCheckResult = {
  total: number;
  changed: number;
  atRisk: number;
  breached: number;
};

function computeHealth(now: Date, createdAt: Date, targetAt: Date): SlaHealth {
  if (now >= targetAt) {
    return SlaHealth.BREACHED;
  }

  const totalMs = targetAt.getTime() - createdAt.getTime();
  if (totalMs <= 0) {
    return SlaHealth.BREACHED;
  }

  const elapsedMs = now.getTime() - createdAt.getTime();
  if (elapsedMs / totalMs >= 0.8) {
    return SlaHealth.AT_RISK;
  }

  return SlaHealth.ON_TRACK;
}

export async function runSlaCheck(prisma: PrismaClient): Promise<SlaCheckResult> {
  const now = new Date();

  const records = await prisma.slaRecord.findMany({
    where: {
      request: {
        status: { in: [...ACTIVE_REQUEST_STATUSES] },
      },
    },
    select: {
      id: true,
      tenantId: true,
      requestId: true,
      type: true,
      health: true,
      createdAt: true,
      targetAt: true,
      breachedAt: true,
      isBreached: true,
    },
  });

  let changed = 0;
  let atRisk = 0;
  let breached = 0;

  for (const record of records) {
    const nextHealth = computeHealth(now, record.createdAt, record.targetAt);
    const isChanged = record.health !== nextHealth;

    if (nextHealth === SlaHealth.AT_RISK) {
      atRisk += 1;
    }

    if (nextHealth === SlaHealth.BREACHED) {
      breached += 1;
    }

    if (!isChanged) {
      await prisma.slaRecord.update({
        where: { id: record.id },
        data: {
          lastCalculatedAt: now,
          ...(nextHealth === SlaHealth.BREACHED
            ? {
                isBreached: true,
                breachedAt: record.breachedAt ?? now,
              }
            : {}),
        },
      });
      continue;
    }

    changed += 1;

    await prisma.$transaction([
      prisma.slaRecord.update({
        where: { id: record.id },
        data: {
          health: nextHealth,
          lastCalculatedAt: now,
          isBreached: nextHealth === SlaHealth.BREACHED,
          breachedAt: nextHealth === SlaHealth.BREACHED ? record.breachedAt ?? now : null,
        },
      }),
      prisma.requestActivity.create({
        data: {
          tenantId: record.tenantId,
          requestId: record.requestId,
          type: nextHealth === SlaHealth.BREACHED ? RequestActivityType.SLA_BREACHED : RequestActivityType.SLA_WARNING,
          title: nextHealth === SlaHealth.BREACHED ? 'SLA breached' : 'SLA at risk',
          description:
            nextHealth === SlaHealth.BREACHED
              ? `SLA ${record.type} has breached target time.`
              : `SLA ${record.type} is at risk (>= 80% elapsed).`,
          actorId: null,
          metadata: {
            source: 'worker.sla-check',
            previousHealth: record.health,
            nextHealth,
            slaType: record.type,
            calculatedAt: now.toISOString(),
          },
        },
      }),
    ]);
  }

  const result = {
    total: records.length,
    changed,
    atRisk,
    breached,
  };

  log('INFO', 'SLA check completed', result);
  return result;
}
