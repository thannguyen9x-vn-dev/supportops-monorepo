"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const escalation_check_job_1 = require("./jobs/escalation-check.job");
const sla_check_job_1 = require("./jobs/sla-check.job");
const logger_1 = require("./logger");
const config = (0, config_1.loadConfig)();
const prisma = new client_1.PrismaClient();
const connection = {
    url: config.redisUrl,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};
const queue = new bullmq_1.Queue(config.queueName, { connection });
const processor = async (job) => {
    if (job.name === 'sla-check') {
        await (0, sla_check_job_1.runSlaCheck)(prisma);
        return;
    }
    if (job.name === 'escalation-check') {
        await (0, escalation_check_job_1.runEscalationCheck)(prisma);
        return;
    }
    (0, logger_1.log)('WARN', 'Received unknown job name', { jobName: job.name });
};
const worker = new bullmq_1.Worker(config.queueName, processor, {
    connection,
    concurrency: 1,
});
async function upsertRecurringJobs() {
    const jobs = [
        { name: 'sla-check', everyMs: config.slaCheckEveryMs },
        { name: 'escalation-check', everyMs: config.escalationCheckEveryMs },
    ];
    for (const job of jobs) {
        await queue.add(job.name, {}, {
            jobId: job.name,
            repeat: { every: job.everyMs },
            removeOnComplete: 100,
            removeOnFail: 100,
        });
    }
    (0, logger_1.log)('INFO', 'Recurring jobs scheduled', {
        queueName: config.queueName,
        slaCheckEveryMs: config.slaCheckEveryMs,
        escalationCheckEveryMs: config.escalationCheckEveryMs,
    });
}
async function shutdown(signal) {
    (0, logger_1.log)('INFO', 'Worker shutdown requested', { signal });
    await worker.close();
    await queue.close();
    await prisma.$disconnect();
    (0, logger_1.log)('INFO', 'Worker shutdown complete');
}
worker.on('ready', () => {
    (0, logger_1.log)('INFO', 'Worker is ready', { queueName: config.queueName });
});
worker.on('completed', (job) => {
    (0, logger_1.log)('INFO', 'Job completed', { jobId: job.id, jobName: job.name });
});
worker.on('failed', (job, error) => {
    (0, logger_1.log)('ERROR', 'Job failed', {
        jobId: job?.id,
        jobName: job?.name,
        error: error.message,
    });
});
process.on('SIGINT', () => {
    void shutdown('SIGINT').finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM').finally(() => process.exit(0));
});
void upsertRecurringJobs().catch((error) => {
    (0, logger_1.log)('ERROR', 'Failed to initialize worker jobs', { error: error.message });
    process.exit(1);
});
//# sourceMappingURL=main.js.map