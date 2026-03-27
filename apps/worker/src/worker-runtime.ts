import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { WorkerConfig } from './config';
import { runEscalationCheck } from './jobs/escalation-check.job';
import { runSlaCheck } from './jobs/sla-check.job';
import { log } from './logger';

export type WorkerJobName = 'sla-check' | 'escalation-check';

export type WorkerConnection = {
  url: string;
  maxRetriesPerRequest: null;
  enableReadyCheck: false;
};

export const RECURRING_JOB_RETRY_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 30_000,
  },
};

export function createWorkerConnection(config: WorkerConfig): WorkerConnection {
  return {
    url: config.redisUrl,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export async function processWorkerJob(job: Job, prisma: PrismaClient): Promise<void> {
  if (job.name === 'sla-check') {
    await runSlaCheck(prisma);
    return;
  }

  if (job.name === 'escalation-check') {
    await runEscalationCheck(prisma);
    return;
  }

  log('WARN', 'Received unknown job name', { jobName: job.name });
}

type QueueLike = {
  add: (
    name: WorkerJobName,
    data: Record<string, never>,
    options: {
      jobId: WorkerJobName;
      repeat: { every: number };
      removeOnComplete: number;
      removeOnFail: number;
      attempts: number;
      backoff: { type: 'exponential'; delay: number };
    },
  ) => Promise<unknown>;
};

export async function upsertRecurringJobs(queue: QueueLike, config: WorkerConfig): Promise<void> {
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
        ...RECURRING_JOB_RETRY_OPTIONS,
      },
    );
  }

  log('INFO', 'Recurring jobs scheduled', {
    queueName: config.queueName,
    slaCheckEveryMs: config.slaCheckEveryMs,
    escalationCheckEveryMs: config.escalationCheckEveryMs,
    ...RECURRING_JOB_RETRY_OPTIONS,
  });
}
