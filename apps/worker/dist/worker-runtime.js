"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorkers = startWorkers;
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const config_1 = require("./config");
const email_dispatch_job_1 = require("./jobs/email-dispatch.job");
const sla_check_job_1 = require("./jobs/sla-check.job");
const import_requests_job_1 = require("./jobs/import-requests.job");
function createPlaceholderProcessor(queueName) {
    return async (job) => {
        console.info(`[worker] Placeholder processor for "${queueName}" received job ${String(job.id ?? '')}`);
    };
}
async function scheduleSlaCheck(queue) {
    await queue.add('sla-check', {}, { repeat: { every: 60_000 }, jobId: 'sla-check-recurring' });
}
function createRedisAdapter(queue) {
    return {
        async get(key) {
            const client = await queue.client;
            return client.get(key);
        },
        async set(key, value, options) {
            const client = await queue.client;
            if (options?.exSeconds) {
                await client.set(key, value, 'EX', options.exSeconds);
                return;
            }
            if (options?.keepTtl) {
                await client.set(key, value, 'KEEPTTL');
                return;
            }
            await client.set(key, value);
        },
        async del(key) {
            const client = await queue.client;
            await client.del(key);
        },
        async incr(key) {
            const client = await queue.client;
            return client.incr(key);
        },
        async expire(key, seconds) {
            const client = await queue.client;
            await client.expire(key, seconds);
        },
    };
}
function createMailService() {
    return {
        async send(payload) {
            void payload.html;
            console.info(`[worker] Email dispatched to ${payload.to}: ${payload.subject}`);
        },
    };
}
function createObjectStorageAdapter() {
    const storageRoot = (0, path_1.join)(process.cwd(), 'storage');
    return {
        async getObject(objectKey) {
            const normalizedKey = normalizeObjectKey(objectKey);
            return (0, promises_1.readFile)((0, path_1.join)(storageRoot, normalizedKey));
        },
        async removeObject(objectKey) {
            const normalizedKey = normalizeObjectKey(objectKey);
            try {
                await (0, promises_1.unlink)((0, path_1.join)(storageRoot, normalizedKey));
            }
            catch (error) {
                if (isFileNotFoundError(error)) {
                    return;
                }
                throw error;
            }
        },
    };
}
function normalizeObjectKey(objectKey) {
    return objectKey
        .replace(/^\/+/, '')
        .replace(/\.\.+/g, '')
        .replace(/\\/g, '/');
}
function isFileNotFoundError(error) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
function startWorkers() {
    const connection = config_1.redisConfig;
    const prisma = new client_1.PrismaClient();
    const workers = [];
    const notificationQueue = new bullmq_1.Queue(config_1.QUEUE_NAMES.NOTIFICATION_FANOUT, { connection });
    const slaQueue = new bullmq_1.Queue(config_1.QUEUE_NAMES.SLA_MONITOR, { connection });
    const digestQueue = new bullmq_1.Queue(config_1.QUEUE_NAMES.EMAIL_DIGEST, { connection });
    const redis = createRedisAdapter(digestQueue);
    const mailService = createMailService();
    const minioClient = createObjectStorageAdapter();
    void scheduleSlaCheck(slaQueue).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[worker] Failed to schedule recurring SLA check: ${message}`);
    });
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.SLA_MONITOR, async (job) => {
        if (job.name === 'sla-check') {
            await (0, sla_check_job_1.runSlaCheckJob)(prisma, notificationQueue);
            return;
        }
        await createPlaceholderProcessor(config_1.QUEUE_NAMES.SLA_MONITOR)(job);
    }, { connection }));
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.EMAIL_IMMEDIATE, async (job) => {
        await (0, email_dispatch_job_1.processImmediateEmail)(job.data, { redis, mailService });
    }, { connection }));
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.EMAIL_DIGEST, async (job) => {
        await (0, email_dispatch_job_1.processEmailDigestWorker)(job, { redis, mailService, digestQueue });
    }, { connection }));
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.IMPORT_REQUESTS, async (job) => {
        await (0, import_requests_job_1.processImportRequestsJob)(job.data, { prisma, redis, minioClient });
    }, { connection }));
    return workers;
}
//# sourceMappingURL=worker-runtime.js.map