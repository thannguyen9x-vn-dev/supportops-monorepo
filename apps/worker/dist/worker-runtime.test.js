"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_1 = require("./config");
const worker_runtime_1 = require("./worker-runtime");
const { workerConstructorMock } = vitest_1.vi.hoisted(() => ({
    workerConstructorMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('bullmq', () => ({
    Worker: workerConstructorMock,
}));
(0, vitest_1.describe)('startWorkers', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        workerConstructorMock.mockImplementation((name) => ({
            name,
            close: vitest_1.vi.fn().mockResolvedValue(undefined),
            on: vitest_1.vi.fn(),
        }));
    });
    (0, vitest_1.it)('creates SLA and email workers with shared redis connection', () => {
        const workers = (0, worker_runtime_1.startWorkers)();
        (0, vitest_1.expect)(workers).toHaveLength(3);
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenCalledTimes(3);
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(1, config_1.QUEUE_NAMES.SLA_MONITOR, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(2, config_1.QUEUE_NAMES.EMAIL_IMMEDIATE, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
        (0, vitest_1.expect)(workerConstructorMock).toHaveBeenNthCalledWith(3, config_1.QUEUE_NAMES.EMAIL_DIGEST, vitest_1.expect.any(Function), { connection: config_1.redisConfig });
    });
});
//# sourceMappingURL=worker-runtime.test.js.map