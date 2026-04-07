"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const email_dispatch_job_1 = require("./email-dispatch.job");
(0, vitest_1.describe)('email-dispatch job', () => {
    let redisStore;
    let redis;
    let mailService;
    let digestQueue;
    (0, vitest_1.beforeEach)(() => {
        redisStore = new Map();
        redis = {
            get: vitest_1.vi.fn(async (key) => redisStore.get(key) ?? null),
            set: vitest_1.vi.fn(async (key, value) => {
                redisStore.set(key, value);
            }),
            del: vitest_1.vi.fn(async (key) => {
                redisStore.delete(key);
            }),
            incr: vitest_1.vi.fn(async (key) => {
                const current = Number(redisStore.get(key) ?? '0') + 1;
                redisStore.set(key, String(current));
                return current;
            }),
            expire: vitest_1.vi.fn(async () => { }),
        };
        mailService = {
            send: vitest_1.vi.fn(async () => { }),
        };
        digestQueue = {
            add: vitest_1.vi.fn(async () => ({})),
        };
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.setSystemTime(new Date('2026-03-29T10:00:00.000Z'));
    });
    (0, vitest_1.it)('email.immediate sends email immediately', async () => {
        await (0, email_dispatch_job_1.processImmediateEmail)({
            userId: 'u1',
            requestId: 'r1',
            to: 'u1@example.com',
            eventType: 'REQUEST_ASSIGNED',
            payload: { requestCode: 'REQ-1' },
        }, { redis, mailService });
        (0, vitest_1.expect)(mailService.send).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('email.digest buffers events in 5-minute window', async () => {
        await (0, email_dispatch_job_1.processDigestEvent)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            eventType: 'REQUEST_CREATED',
            payload: { message: 'created' },
        }, { redis, digestQueue });
        await (0, email_dispatch_job_1.processDigestEvent)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            eventType: 'REQUEST_COMMENTED',
            payload: { message: 'comment' },
        }, { redis, digestQueue });
        const buffer = await redis.get('digest:t1:u1:r1');
        const events = JSON.parse(buffer ?? '[]');
        (0, vitest_1.expect)(events).toHaveLength(2);
    });
    (0, vitest_1.it)('email.digest sends one consolidated email after 5 minutes', async () => {
        await (0, email_dispatch_job_1.processDigestEvent)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            eventType: 'REQUEST_CREATED',
            payload: { message: 'created' },
        }, { redis, digestQueue });
        await (0, email_dispatch_job_1.processDigestEvent)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            eventType: 'REQUEST_STATUS_CHANGED',
            payload: { message: 'status' },
        }, { redis, digestQueue });
        await (0, email_dispatch_job_1.processDigestSend)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            bufferKey: 'digest:t1:u1:r1',
        }, { redis, mailService });
        (0, vitest_1.expect)(mailService.send).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('rate limit skips 6th event within one hour', async () => {
        for (let i = 0; i < 5; i += 1) {
            const allowed = await (0, email_dispatch_job_1.canSendEmail)(redis, 'u1', 'r1');
            (0, vitest_1.expect)(allowed).toBe(true);
        }
        const allowedSixth = await (0, email_dispatch_job_1.canSendEmail)(redis, 'u1', 'r1');
        (0, vitest_1.expect)(allowedSixth).toBe(false);
    });
    (0, vitest_1.it)('rate limit is isolated per requestId', async () => {
        for (let i = 0; i < 5; i += 1) {
            await (0, email_dispatch_job_1.canSendEmail)(redis, 'u1', 'r1');
        }
        const otherRequestAllowed = await (0, email_dispatch_job_1.canSendEmail)(redis, 'u1', 'r2');
        (0, vitest_1.expect)(otherRequestAllowed).toBe(true);
    });
    (0, vitest_1.it)('digest buffer key is deleted after send', async () => {
        await (0, email_dispatch_job_1.processDigestEvent)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            eventType: 'REQUEST_CREATED',
            payload: { message: 'created' },
        }, { redis, digestQueue });
        await (0, email_dispatch_job_1.processDigestSend)({
            userId: 'u1',
            requestId: 'r1',
            tenantId: 't1',
            to: 'u1@example.com',
            bufferKey: 'digest:t1:u1:r1',
        }, { redis, mailService });
        (0, vitest_1.expect)(await redis.get('digest:t1:u1:r1')).toBeNull();
    });
});
//# sourceMappingURL=email-dispatch.job.test.js.map