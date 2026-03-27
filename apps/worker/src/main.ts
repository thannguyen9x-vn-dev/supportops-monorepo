import { Job, Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { loadConfig } from './config';
import { log } from './logger';
import { createWorkerConnection, processWorkerJob, upsertRecurringJobs } from './worker-runtime';

const config = loadConfig();
const prisma = new PrismaClient();
const connection = createWorkerConnection(config);

const queue = new Queue(config.queueName, { connection });

const processor = async (job: Job): Promise<void> => {
  await processWorkerJob(job, prisma);
};

const worker = new Worker(config.queueName, processor, {
  connection,
  concurrency: 1,
});

async function shutdown(signal: string): Promise<void> {
  log('INFO', 'Worker shutdown requested', { signal });

  await worker.close();
  await queue.close();
  await prisma.$disconnect();

  log('INFO', 'Worker shutdown complete');
}

worker.on('ready', () => {
  log('INFO', 'Worker is ready', { queueName: config.queueName });
});

worker.on('completed', (job) => {
  log('INFO', 'Job completed', { jobId: job.id, jobName: job.name });
});

worker.on('failed', (job, error) => {
  log('ERROR', 'Job failed', {
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

void upsertRecurringJobs(queue, config).catch((error: Error) => {
  log('ERROR', 'Failed to initialize worker jobs', { error: error.message });
  process.exit(1);
});
