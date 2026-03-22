"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEscalationCheck = runEscalationCheck;
const client_1 = require("@prisma/client");
const logger_1 = require("../logger");
const ESCALATABLE_STATUSES = [
    client_1.RequestStatus.SUBMITTED,
    client_1.RequestStatus.TRIAGE,
    client_1.RequestStatus.ASSIGNED,
    client_1.RequestStatus.IN_PROGRESS,
];
async function runEscalationCheck(prisma) {
    const candidates = await prisma.serviceRequest.findMany({
        where: {
            status: { in: [...ESCALATABLE_STATUSES] },
            slaRecords: {
                some: {
                    health: client_1.SlaHealth.BREACHED,
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
                    status: client_1.RequestStatus.WAITING_EXTERNAL_VENDOR,
                },
            }),
            prisma.requestActivity.create({
                data: {
                    tenantId: request.tenantId,
                    requestId: request.id,
                    type: client_1.RequestActivityType.SLA_BREACHED,
                    title: 'Request escalated by system',
                    description: 'Request moved to WAITING_EXTERNAL_VENDOR after SLA breach.',
                    actorId: null,
                    metadata: {
                        source: 'worker.escalation-check',
                        previousStatus: request.status,
                        nextStatus: client_1.RequestStatus.WAITING_EXTERNAL_VENDOR,
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
                        nextStatus: client_1.RequestStatus.WAITING_EXTERNAL_VENDOR,
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
    (0, logger_1.log)('INFO', 'Escalation check completed', result);
    return result;
}
//# sourceMappingURL=escalation-check.job.js.map