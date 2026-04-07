"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_1 = require("./config");
const worker_runtime_1 = require("./worker-runtime");
const { workerConstructorMock, queueConstructorMock, queueAddMock } = vitest_1.vi.hoisted(() => ({
    workerConstructorMock: vitest_1.vi.fn(),
    queueConstructorMock: vitest_1.vi.fn(),
    queueAddMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('@prisma/client', () => ({
    PrismaClient: vitest_1.vi.fn(),
    Prisma: {},
    NotificationEventType: {
        BULK_IMPORT_COMPLETED: 'BULK_IMPORT_COMPLETED',
    },
    RequestPriority: {
        LOW: 'LOW',
        MEDIUM: 'MEDIUM',
        HIGH: 'HIGH',
        URGENT: 'URGENT',
    },
    RequestStatus: {
        SUBMITTED: 'SUBMITTED',
        RESOLVED: 'RESOLVED',
        CLOSED: 'CLOSED',
        CANCELLED: 'CANCELLED',
        WAITING_FOR_CUSTOMER: 'WAITING_FOR_CUSTOMER',
    },
    SourceChannel: {
        API: 'API',
    },
    UserStatus: {
        ACTIVE: 'ACTIVE',
    },
    SlaHealth: {
        BREACHED: 'BREACHED',
    },
}));
vitest_1.vi.mock('bullmq', () => ({
    Worker: workerConstructorMock,
    Queue: queueConstructorMock,
}));
(0, vitest_1.describe)('startWorkers', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        queueAddMock.mockResolvedValue({});
        queueConstructorMock.mockImplementation(() => ({
            add: queueAddMock,
        }));
        workerConstructorMock.mockImplementation((name) => ({
            name,
            close: vitest_1.vi.fn().mockResolvedValue(undefined),
            on: vitest_1.vi.fn(),
        }));
    });
    (0, vitest_1.it)('creates SLA and email workers with shared redis connection', () => {
        const workers = (0, worker_runtime_1.startWorkers)();
        (0, vitest_1.expect)(workers).toHaveLength(4);
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenCalledTimes(4);
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(1, config_1.QUEUE_NAMES.SLA_MONITOR, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(2, config_1.QUEUE_NAMES.EMAIL_IMMEDIATE, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(3, config_1.QUEUE_NAMES.EMAIL_DIGEST, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(4, config_1.QUEUE_NAMES.IMPORT_REQUESTS, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
        (0, vitest_1.expect)(queueConstructorMock).toHaveBeenCalledWith(config_1.QUEUE_NAMES.NOTIFICATION_FANOUT, { connection: config_1.redisConfig });
        (0, vitest_1.expect)(queueConstructorMock).toHaveBeenCalledWith(config_1.QUEUE_NAMES.SLA_MONITOR, { connection: config_1.redisConfig });
        (0, vitest_1.expect)(queueAddMock).toHaveBeenCalledWith('sla-check', {}, { repeat: { every: 60_000 }, jobId: 'sla-check-recurring' });
    });
});
//# sourceMappingURL=worker-runtime.test.js.map