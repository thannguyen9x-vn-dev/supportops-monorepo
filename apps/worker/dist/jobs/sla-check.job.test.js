"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const vitest_1 = require("vitest");
const sla_check_job_1 = require("./sla-check.job");
(0, vitest_1.describe)('runSlaCheckJob', () => {
    let prisma;
    let queue;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.setSystemTime(new Date('2026-03-29T10:00:00.000Z'));
        prisma = {
            slaRecord: {
                findMany: vitest_1.vi.fn().mockResolvedValue([]),
                update: vitest_1.vi.fn().mockResolvedValue({}),
            },
            slaPolicy: {
                findMany: vitest_1.vi.fn().mockResolvedValue([]),
            },
        };
        queue = {
            add: vitest_1.vi.fn().mockResolvedValue({}),
        };
    });
    (0, vitest_1.it)('skips paused records via query filter (pausedAt != null)', async () => {
        await (0, sla_check_job_1.runSlaCheckJob)(prisma, queue);
        (0, vitest_1.expect)(prisma.slaRecord.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: vitest_1.expect.objectContaining({
                pausedAt: null,
            }),
        }));
    });
    (0, vitest_1.it)('skips records that already have nearBreachNotifiedAt (idempotent)', async () => {
        await (0, sla_check_job_1.runSlaCheckJob)(prisma, queue);
        (0, vitest_1.expect)(prisma.slaRecord.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: vitest_1.expect.objectContaining({
                nearBreachNotifiedAt: null,
            }),
        }));
        (0, vitest_1.expect)(prisma.slaRecord.update).not.toHaveBeenCalled();
        (0, vitest_1.expect)(queue.add).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('enqueues near-breach when minutesRemaining <= threshold', async () => {
        const record = {
            id: 's1',
            tenantId: 't1',
            requestId: 'r1',
            type: client_1.SlaType.ASSIGNMENT,
            targetAt: new Date('2026-03-29T10:20:00.000Z'),
            totalPausedSeconds: 0,
            request: {
                tenantId: 't1',
                assigneeId: 'u1',
                serviceType: { code: 'IT' },
            },
        };
        prisma.slaRecord.findMany.mockResolvedValue([record]);
        prisma.slaPolicy.findMany.mockResolvedValue([
            { tenantId: 't1', serviceTypeCode: 'IT', nearBreachThresholdMinutes: 30 },
        ]);
        await (0, sla_check_job_1.runSlaCheckJob)(prisma, queue);
        (0, vitest_1.expect)(queue.add).toHaveBeenCalledWith('sla.near-breach', vitest_1.expect.objectContaining({ requestId: 'r1', tenantId: 't1', assigneeId: 'u1' }));
        (0, vitest_1.expect)(prisma.slaRecord.update).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: { id: 's1' },
            data: vitest_1.expect.objectContaining({ nearBreachNotifiedAt: vitest_1.expect.any(Date) }),
        }));
    });
    (0, vitest_1.it)('marks breached and enqueues breached job when minutesRemaining <= 0', async () => {
        const record = {
            id: 's2',
            tenantId: 't1',
            requestId: 'r2',
            type: client_1.SlaType.RESOLUTION,
            targetAt: new Date('2026-03-29T09:30:00.000Z'),
            totalPausedSeconds: 0,
            request: {
                tenantId: 't1',
                assigneeId: 'u2',
                serviceType: { code: 'IT' },
            },
        };
        prisma.slaRecord.findMany.mockResolvedValue([record]);
        await (0, sla_check_job_1.runSlaCheckJob)(prisma, queue);
        (0, vitest_1.expect)(prisma.slaRecord.update).toHaveBeenCalledWith({
            where: { id: 's2' },
            data: { isBreached: true, health: client_1.SlaHealth.BREACHED },
        });
        (0, vitest_1.expect)(queue.add).toHaveBeenCalledWith('sla.breached', vitest_1.expect.objectContaining({ requestId: 'r2', tenantId: 't1', assigneeId: 'u2' }));
    });
    (0, vitest_1.it)('skips RESOLVED/CLOSED/CANCELLED/WAITING_FOR_CUSTOMER requests by filter', async () => {
        await (0, sla_check_job_1.runSlaCheckJob)(prisma, queue);
        (0, vitest_1.expect)(prisma.slaRecord.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: vitest_1.expect.objectContaining({
                request: {
                    status: {
                        notIn: vitest_1.expect.arrayContaining(['RESOLVED', 'CLOSED', 'CANCELLED', 'WAITING_FOR_CUSTOMER']),
                    },
                },
            }),
        }));
    });
    (0, vitest_1.it)('uses totalPausedSeconds when computing adjustedTarget', async () => {
        const record = {
            id: 's3',
            tenantId: 't1',
            requestId: 'r3',
            type: client_1.SlaType.ASSIGNMENT,
            targetAt: new Date('2026-03-29T09:59:40.000Z'),
            totalPausedSeconds: 30,
            request: {
                tenantId: 't1',
                assigneeId: 'u3',
                serviceType: { code: 'IT' },
            },
        };
        prisma.slaRecord.findMany.mockResolvedValue([record]);
        prisma.slaPolicy.findMany.mockResolvedValue([
            { tenantId: 't1', serviceTypeCode: 'IT', nearBreachThresholdMinutes: 5 },
        ]);
        await (0, sla_check_job_1.runSlaCheckJob)(prisma, queue);
        (0, vitest_1.expect)(queue.add).toHaveBeenCalledWith('sla.near-breach', vitest_1.expect.objectContaining({ requestId: 'r3' }));
        (0, vitest_1.expect)(prisma.slaRecord.update).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ where: { id: 's3' } }));
    });
});
//# sourceMappingURL=sla-check.job.test.js.map