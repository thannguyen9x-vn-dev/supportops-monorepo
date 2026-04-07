"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const vitest_1 = require("vitest");
const escalation_check_job_1 = require("./escalation-check.job");
const { logMock } = vitest_1.vi.hoisted(() => ({
    logMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../logger', () => ({
    log: logMock,
}));
function createPrismaMock(candidates) {
    return {
        serviceRequest: {
            findMany: vitest_1.vi.fn().mockResolvedValue(candidates),
            update: vitest_1.vi.fn().mockResolvedValue({}),
        },
        auditLog: {
            findFirst: vitest_1.vi.fn().mockResolvedValue(null),
            create: vitest_1.vi.fn().mockResolvedValue({}),
        },
        requestActivity: {
            create: vitest_1.vi.fn().mockResolvedValue({}),
        },
        $transaction: vitest_1.vi.fn().mockResolvedValue([]),
    };
}
(0, vitest_1.describe)('runEscalationCheck', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('escalates candidate requests and records activity/audit logs', async () => {
        const prisma = createPrismaMock([
            {
                id: 'req-1',
                tenantId: 'tenant-1',
                status: client_1.RequestStatus.IN_PROGRESS,
            },
        ]);
        const result = await (0, escalation_check_job_1.runEscalationCheck)(prisma);
        (0, vitest_1.expect)(result).toEqual({
            candidates: 1,
            escalated: 1,
            skippedAlreadyEscalated: 0,
        });
        (0, vitest_1.expect)(prisma.$transaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(prisma.serviceRequest.update).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: { id: 'req-1' },
            data: { status: client_1.RequestStatus.WAITING_EXTERNAL_VENDOR },
        }));
        (0, vitest_1.expect)(logMock).toHaveBeenCalledWith('INFO', 'Escalation check completed', result);
    });
    (0, vitest_1.it)('skips requests already auto-escalated (edge case idempotency)', async () => {
        const prisma = createPrismaMock([
            {
                id: 'req-2',
                tenantId: 'tenant-1',
                status: client_1.RequestStatus.ASSIGNED,
            },
        ]);
        prisma.auditLog.findFirst.mockResolvedValueOnce({ id: 'audit-1' });
        const result = await (0, escalation_check_job_1.runEscalationCheck)(prisma);
        (0, vitest_1.expect)(result).toEqual({
            candidates: 1,
            escalated: 0,
            skippedAlreadyEscalated: 1,
        });
        (0, vitest_1.expect)(prisma.$transaction).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('handles empty candidate set', async () => {
        const prisma = createPrismaMock([]);
        const result = await (0, escalation_check_job_1.runEscalationCheck)(prisma);
        (0, vitest_1.expect)(result).toEqual({
            candidates: 0,
            escalated: 0,
            skippedAlreadyEscalated: 0,
        });
    });
    (0, vitest_1.it)('propagates prisma errors', async () => {
        const prisma = createPrismaMock([]);
        prisma.serviceRequest.findMany.mockRejectedValueOnce(new Error('query failed'));
        await (0, vitest_1.expect)((0, escalation_check_job_1.runEscalationCheck)(prisma)).rejects.toThrow('query failed');
    });
});
//# sourceMappingURL=escalation-check.job.test.js.map