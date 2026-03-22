import { PrismaClient, RequestActivityType, RequestStatus, SlaHealth } from '@prisma/client';
import { log } from '../logger';

const ESCALATABLE_STATUSES = [
  RequestStatus.SUBMITTED,
  RequestStatus.TRIAGE,
  RequestStatus.ASSIGNED,
  RequestStatus.IN_PROGRESS,
] as const;

export type EscalationCheckResult = {
  candidates: number;
  escalated: number;
  skippedAlreadyEscalated: number;
};

export async function runEscalationCheck(prisma: PrismaClient): Promise<EscalationCheckResult> {
  const candidates = await prisma.serviceRequest.findMany({
    where: {
      status: { in: [...ESCALATABLE_STATUSES] },
      slaRecords: {
        some: {
          health: SlaHealth.BREACHED,
        },
      },
    },
    select: {
      id: true,
      tenantId: true,
      status: true,
    },
  });

  let escalated = 0;
  let skippedAlreadyEscalated = 0;

  for (const request of candidates) {
    const autoEscalationEvent = await prisma.auditLog.findFirst({
      where: {
        tenantId: request.tenantId,
        requestId: request.id,
        action: 'REQUEST_AUTO_ESCALATED',
      },
      select: { id: true },
    });

    if (autoEscalationEvent) {
      skippedAlreadyEscalated += 1;
      continue;
    }

    await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: request.id },
        data: {
          status: RequestStatus.WAITING_EXTERNAL_VENDOR,
        },
      }),
      prisma.requestActivity.create({
        data: {
          tenantId: request.tenantId,
          requestId: request.id,
          type: RequestActivityType.SLA_BREACHED,
          title: 'Request escalated by system',
          description: 'Request moved to WAITING_EXTERNAL_VENDOR after SLA breach.',
          actorId: null,
          metadata: {
            source: 'worker.escalation-check',
            previousStatus: request.status,
            nextStatus: RequestStatus.WAITING_EXTERNAL_VENDOR,
            isAuto: true,
          },
        },
      }),
      prisma.auditLog.create({
        data: {
          tenantId: request.tenantId,
          requestId: request.id,
          entityType: 'REQUEST_ESCALATION',
          entityId: request.id,
          action: 'REQUEST_AUTO_ESCALATED',
          actorId: null,
          afterData: {
            isAuto: true,
            previousStatus: request.status,
            nextStatus: RequestStatus.WAITING_EXTERNAL_VENDOR,
          },
        },
      }),
    ]);

    escalated += 1;
  }

  const result = {
    candidates: candidates.length,
    escalated,
    skippedAlreadyEscalated,
  };

  log('INFO', 'Escalation check completed', result);
  return result;
}
