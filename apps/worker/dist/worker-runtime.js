"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorkers = startWorkers;
const bullmq_1 = require("bullmq");
const config_1 = require("./config");
function createPlaceholderProcessor(queueName) {
    return async (job) => {
        console.info(`[worker] Placeholder processor for "${queueName}" received job ${String(job.id ?? '')}`);
    };
}
function startWorkers() {
    const connection = config_1.redisConfig;
    const workers = [];
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.SLA_MONITOR, createPlaceholderProcessor(config_1.QUEUE_NAMES.SLA_MONITOR), { connection }));
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.EMAIL_IMMEDIATE, createPlaceholderProcessor(config_1.QUEUE_NAMES.EMAIL_IMMEDIATE), {
        connection,
    }));
    workers.push(new bullmq_1.Worker(config_1.QUEUE_NAMES.EMAIL_DIGEST, createPlaceholderProcessor(config_1.QUEUE_NAMES.EMAIL_DIGEST), {
        connection,
    }));
    return workers;
}
//# sourceMappingURL=worker-runtime.js.map