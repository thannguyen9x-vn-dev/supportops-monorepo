"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const logger_1 = require("./logger");
(0, vitest_1.describe)('log', () => {
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
    };
    (0, vitest_1.afterEach)(() => {
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('writes INFO logs to console.log', () => {
        const infoSpy = vitest_1.vi.spyOn(console, 'log').mockImplementation(() => undefined);
        (0, logger_1.log)('INFO', 'hello');
        (0, vitest_1.expect)(infoSpy).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('writes WARN logs to console.warn', () => {
        const warnSpy = vitest_1.vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        (0, logger_1.log)('WARN', 'careful');
        (0, vitest_1.expect)(warnSpy).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('writes ERROR logs to console.error', () => {
        const errorSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => undefined);
        (0, logger_1.log)('ERROR', 'boom', { reason: 'test' });
        (0, vitest_1.expect)(errorSpy).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=logger.test.js.map