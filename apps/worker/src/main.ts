import { Job, Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { loadConfig } from './config';
import { runEscalationCheck } from './jobs/escalation-check.job';
import { runSlaCheck } from './jobs/sla-check.job';
import { log } from './logger';

type WorkerJobName = 'sla-check' | 'escalation-check';

const config = loadConfig();
const prisma = new PrismaClient();

const connection = {
  url: config.redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const queue = new Queue(config.queueName, { connection });

const processor = async (job: Job): Promise<void> => {
  if (job.name === 'sla-check') {
    await runSlaCheck(prisma);
    return;
  }

  if (job.name === 'escalation-check') {
    await runEscalationCheck(prisma);
    return;
  }

  log('WARN', 'Received unknown job name', { jobName: job.name });
};

const worker = new Worker(config.queueName, processor, {
  connection,
  concurrency: 1,
});

async function upsertRecurringJobs(): Promise<void> {
  const jobs: Array<{ name: WorkerJobName; everyMs: number }> = [
    { name: 'sla-check', everyMs: config.slaCheckEveryMs },
    { name: 'escalation-check', everyMs: config.escalationCheckEveryMs },
  ];

  for (const job of jobs) {
    await queue.add(
      job.name,
      {},
      {
        jobId: job.name,
        repeat: { every: job.everyMs },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }

  log('INFO', 'Recurring jobs scheduled', {
    queueName: config.queueName,
    slaCheckEveryMs: config.slaCheckEveryMs,
    escalationCheckEveryMs: config.escalationCheckEveryMs,
  });
}

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

void upsertRecurringJobs().catch((error: Error) => {
  log('ERROR', 'Failed to initialize worker jobs', { error: error.message });
  process.exit(1);
});
