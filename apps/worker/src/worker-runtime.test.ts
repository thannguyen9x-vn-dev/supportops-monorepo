import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkerConfig } from './config';
import {
  createWorkerConnection,
  processWorkerJob,
  RECURRING_JOB_RETRY_OPTIONS,
  upsertRecurringJobs,
} from './worker-runtime';

const { runSlaCheckMock, runEscalationCheckMock, logMock } = vi.hoisted(() => ({
  runSlaCheckMock: vi.fn(),
  runEscalationCheckMock: vi.fn(),
  logMock: vi.fn(),
}));

vi.mock('./jobs/sla-check.job', () => ({
  runSlaCheck: runSlaCheckMock,
}));

vi.mock('./jobs/escalation-check.job', () => ({
  runEscalationCheck: runEscalationCheckMock,
}));

vi.mock('./logger', () => ({
  log: logMock,
}));

const config: WorkerConfig = {
  redisUrl: 'redis://localhost:6379',
  queueName: 'supportops-worker',
  slaCheckEveryMs: 300000,
  escalationCheckEveryMs: 900000,
};

describe('worker-runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates redis connection config for bullmq', () => {
    expect(createWorkerConnection(config)).toEqual({
      url: 'redis://localhost:6379',
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  });

  it('routes sla-check jobs to sla processor', async () => {
    const job = { name: 'sla-check', id: 'job-1' } as unknown as Job;
    const prisma = {} as PrismaClient;

    await processWorkerJob(job, prisma);

    expect(runSlaCheckMock).toHaveBeenCalledWith(prisma);
    expect(runEscalationCheckMock).not.toHaveBeenCalled();
  });

  it('routes escalation-check jobs to escalation processor', async () => {
    const job = { name: 'escalation-check', id: 'job-2' } as unknown as Job;
    const prisma = {} as PrismaClient;

    await processWorkerJob(job, prisma);

    expect(runEscalationCheckMock).toHaveBeenCalledWith(prisma);
    expect(runSlaCheckMock).not.toHaveBeenCalled();
  });

  it('logs unknown jobs instead of throwing', async () => {
    const job = { name: 'unknown-job', id: 'job-3' } as unknown as Job;

    await processWorkerJob(job, {} as PrismaClient);

    expect(logMock).toHaveBeenCalledWith('WARN', 'Received unknown job name', { jobName: 'unknown-job' });
  });

  it('schedules recurring jobs with retry options', async () => {
    const queue = {
      add: vi.fn().mockResolvedValue(undefined),
    };

    await upsertRecurringJobs(queue, config);

    expect(queue.add).toHaveBeenCalledTimes(2);
    expect(queue.add).toHaveBeenNthCalledWith(
      1,
      'sla-check',
      {},
      {
        jobId: 'sla-check',
        repeat: { every: 300000 },
        removeOnComplete: 100,
        removeOnFail: 100,
        ...RECURRING_JOB_RETRY_OPTIONS,
      },
    );
    expect(queue.add).toHaveBeenNthCalledWith(
      2,
      'escalation-check',
      {},
      {
        jobId: 'escalation-check',
        repeat: { every: 900000 },
        removeOnComplete: 100,
        removeOnFail: 100,
        ...RECURRING_JOB_RETRY_OPTIONS,
      },
    );
  });

  it('propagates queue errors during recurring job upsert', async () => {
    const queue = {
      add: vi.fn().mockRejectedValue(new Error('redis unavailable')),
    };

    await expect(upsertRecurringJobs(queue, config)).rejects.toThrow('redis unavailable');
  });
});
