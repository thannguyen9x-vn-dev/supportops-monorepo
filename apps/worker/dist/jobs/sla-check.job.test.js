"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const vitest_1 = require("vitest");
const sla_check_job_1 = require("./sla-check.job");
const { logMock } = vitest_1.vi.hoisted(() => ({
    logMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../logger', () => ({
    log: logMock,
}));
function createPrismaMock(records) {
    return {
        slaRecord: {
            findMany: vitest_1.vi.fn().mockResolvedValue(records),
            update: vitest_1.vi.fn().mockResolvedValue({}),
        },
        requestActivity: {
            create: vitest_1.vi.fn().mockResolvedValue({}),
        },
        $transaction: vitest_1.vi.fn().mockResolvedValue([]),
    };
}
(0, vitest_1.describe)('runSlaCheck', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.setSystemTime(new Date('2026-01-01T00:08:00.000Z'));
    });
    (0, vitest_1.it)('updates changed records and writes SLA warning activity on at-risk transition', async () => {
        const prisma = createPrismaMock([
            {
                id: 'sla-1',
                tenantId: 'tenant-1',
                requestId: 'req-1',
                type: 'ASSIGNMENT',
                health: client_1.SlaHealth.ON_TRACK,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                targetAt: new Date('2026-01-01T00:10:00.000Z'),
                breachedAt: null,
                isBreached: false,
            },
        ]);
        const result = await (0, sla_check_job_1.runSlaCheck)(prisma);
        (0, vitest_1.expect)(result).toEqual({
            total: 1,
            changed: 1,
            atRisk: 1,
            breached: 0,
        });
        (0, vitest_1.expect)(prisma.$transaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(prisma.requestActivity.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                type: client_1.RequestActivityType.SLA_WARNING,
                title: 'SLA at risk',
            }),
        }));
        (0, vitest_1.expect)(logMock).toHaveBeenCalledWith('INFO', 'SLA check completed', result);
    });
    (0, vitest_1.it)('keeps breached records updated without creating duplicate activity when health does not change', async () => {
        const breachedAt = new Date('2026-01-01T00:04:00.000Z');
        const prisma = createPrismaMock([
            {
                id: 'sla-2',
                tenantId: 'tenant-1',
                requestId: 'req-2',
                type: 'RESOLUTION',
                health: client_1.SlaHealth.BREACHED,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                targetAt: new Date('2026-01-01T00:03:00.000Z'),
                breachedAt,
                isBreached: true,
            },
        ]);
        const result = await (0, sla_check_job_1.runSlaCheck)(prisma);
        (0, vitest_1.expect)(result).toEqual({
            total: 1,
            changed: 0,
            atRisk: 0,
            breached: 1,
        });
        (0, vitest_1.expect)(prisma.slaRecord.update).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: { id: 'sla-2' },
            data: vitest_1.expect.objectContaining({
                isBreached: true,
                breachedAt,
            }),
        }));
        (0, vitest_1.expect)(prisma.$transaction).not.toHaveBeenCalled();
        (0, vitest_1.expect)(prisma.requestActivity.create).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('marks SLA as breached when target window is invalid (edge case targetAt <= createdAt)', async () => {
        const prisma = createPrismaMock([
            {
                id: 'sla-3',
                tenantId: 'tenant-1',
                requestId: 'req-3',
                type: 'ASSIGNMENT',
                health: client_1.SlaHealth.ON_TRACK,
                createdAt: new Date('2026-01-01T00:08:00.000Z'),
                targetAt: new Date('2026-01-01T00:07:00.000Z'),
                breachedAt: null,
                isBreached: false,
            },
        ]);
        const result = await (0, sla_check_job_1.runSlaCheck)(prisma);
        (0, vitest_1.expect)(result.breached).toBe(1);
        (0, vitest_1.expect)(prisma.$transaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(prisma.requestActivity.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                type: client_1.RequestActivityType.SLA_BREACHED,
                title: 'SLA breached',
            }),
        }));
    });
    (0, vitest_1.it)('propagates prisma errors', async () => {
        const prisma = createPrismaMock([]);
        prisma.slaRecord.findMany.mockRejectedValueOnce(new Error('db down'));
        await (0, vitest_1.expect)((0, sla_check_job_1.runSlaCheck)(prisma)).rejects.toThrow('db down');
    });
});
//# sourceMappingURL=sla-check.job.test.js.map