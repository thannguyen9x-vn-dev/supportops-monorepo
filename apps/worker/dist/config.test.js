"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)('worker config', () => {
    const envBackup = { ...process.env };
    (0, vitest_1.afterEach)(async () => {
        process.env = { ...envBackup };
        vitest_1.vi.resetModules();
    });
    (0, vitest_1.it)('exports queue names and default redis config', async () => {
        delete process.env.REDIS_HOST;
        delete process.env.REDIS_PORT;
        delete process.env.REDIS_PASSWORD;
        vitest_1.vi.resetModules();
        const { QUEUE_NAMES, redisConfig } = await Promise.resolve().then(() => __importStar(require('./config')));
        (0, vitest_1.expect)(QUEUE_NAMES).toEqual({
            NOTIFICATION_FANOUT: 'notification-fanout',
            EMAIL_IMMEDIATE: 'email-immediate',
            EMAIL_DIGEST: 'email-digest',
            SLA_MONITOR: 'sla-monitor',
            IMPORT_REQUESTS: 'import-requests',
        });
        (0, vitest_1.expect)(redisConfig).toEqual({
            host: 'localhost',
            port: 6379,
            password: undefined,
        });
    });
    (0, vitest_1.it)('reads redis env values and validates invalid REDIS_PORT', async () => {
        process.env.REDIS_HOST = 'redis.internal';
        process.env.REDIS_PORT = 'invalid';
        process.env.REDIS_PASSWORD = 'secret';
        vitest_1.vi.resetModules();
        const { redisConfig } = await Promise.resolve().then(() => __importStar(require('./config')));
        (0, vitest_1.expect)(redisConfig).toEqual({
            host: 'redis.internal',
            port: 6379,
            password: 'secret',
        });
    });
});
//# sourceMappingURL=config.test.js.map