"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = exports.QUEUE_NAMES = void 0;
exports.QUEUE_NAMES = {
    NOTIFICATION_FANOUT: 'notification-fanout',
    EMAIL_IMMEDIATE: 'email-immediate',
    EMAIL_DIGEST: 'email-digest',
    SLA_MONITOR: 'sla-monitor',
};
function parseRedisPort(value) {
    if (!value) {
        return 6379;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 6379;
}
exports.redisConfig = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseRedisPort(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
};
//# sourceMappingURL=config.js.map