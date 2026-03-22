"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSlaCheck = runSlaCheck;
const client_1 = require("@prisma/client");
const logger_1 = require("../logger");
const ACTIVE_REQUEST_STATUSES = [
    client_1.RequestStatus.SUBMITTED,
    client_1.RequestStatus.TRIAGE,
    client_1.RequestStatus.ASSIGNED,
    client_1.RequestStatus.IN_PROGRESS,
];
function computeHealth(now, createdAt, targetAt) {
    if (now >= targetAt) {
        return client_1.SlaHealth.BREACHED;
    }
    const totalMs = targetAt.getTime() - createdAt.getTime();
    if (totalMs <= 0) {
        return client_1.SlaHealth.BREACHED;
    }
    const elapsedMs = now.getTime() - createdAt.getTime();
    if (elapsedMs / totalMs >= 0.8) {
        return client_1.SlaHealth.AT_RISK;
    }
    return client_1.SlaHealth.ON_TRACK;
}
async function runSlaCheck(prisma) {
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
        if (nextHealth === client_1.SlaHealth.AT_RISK) {
            atRisk += 1;
        }
        if (nextHealth === client_1.SlaHealth.BREACHED) {
            breached += 1;
        }
        if (!isChanged) {
            await prisma.slaRecord.update({
                where: { id: record.id },
                data: {
                    lastCalculatedAt: now,
                    ...(nextHealth === client_1.SlaHealth.BREACHED
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
                    isBreached: nextHealth === client_1.SlaHealth.BREACHED,
                    breachedAt: nextHealth === client_1.SlaHealth.BREACHED ? record.breachedAt ?? now : null,
                },
            }),
            prisma.requestActivity.create({
                data: {
                    tenantId: record.tenantId,
                    requestId: record.requestId,
                    type: nextHealth === client_1.SlaHealth.BREACHED ? client_1.RequestActivityType.SLA_BREACHED : client_1.RequestActivityType.SLA_WARNING,
                    title: nextHealth === client_1.SlaHealth.BREACHED ? 'SLA breached' : 'SLA at risk',
                    description: nextHealth === client_1.SlaHealth.BREACHED
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
    (0, logger_1.log)('INFO', 'SLA check completed', result);
    return result;
}
//# sourceMappingURL=sla-check.job.js.map