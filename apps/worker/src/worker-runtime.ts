import { PrismaClient } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { QUEUE_NAMES, redisConfig } from './config';
import {
  EmailImmediateJobData,
  MailServiceLike,
  processEmailDigestWorker,
  processImmediateEmail,
  RedisLike,
} from './jobs/email-dispatch.job';
import { runSlaCheckJob } from './jobs/sla-check.job';
import { ImportRequestsJobData, MinioClientLike, processImportRequestsJob } from './jobs/import-requests.job';

function createPlaceholderProcessor(queueName: string): (job: Job) => Promise<void> {
  return async (job: Job): Promise<void> => {
    console.info(`[worker] Placeholder processor for "${queueName}" received job ${String(job.id ?? '')}`);
  };
}

async function scheduleSlaCheck(queue: Queue): Promise<void> {
  await queue.add('sla-check', {}, { repeat: { every: 60_000 }, jobId: 'sla-check-recurring' });
}

function createRedisAdapter(queue: Queue): RedisLike {
  return {
    async get(key: string): Promise<string | null> {
      const client = await queue.client;
      return client.get(key);
    },
    async set(key: string, value: string, options?: { exSeconds?: number; keepTtl?: boolean }): Promise<void> {
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
    async del(key: string): Promise<void> {
      const client = await queue.client;
      await client.del(key);
    },
    async incr(key: string): Promise<number> {
      const client = await queue.client;
      return client.incr(key);
    },
    async expire(key: string, seconds: number): Promise<void> {
      const client = await queue.client;
      await client.expire(key, seconds);
    },
  };
}

function createMailService(): MailServiceLike {
  return {
    async send(payload: { to: string; subject: string; html: string }): Promise<void> {
      void payload.html;
      console.info(`[worker] Email dispatched to ${payload.to}: ${payload.subject}`);
    },
  };
}

function createObjectStorageAdapter(): MinioClientLike {
  const storageRoot = join(process.cwd(), 'storage');
  return {
    async getObject(objectKey: string): Promise<Buffer> {
      const normalizedKey = normalizeObjectKey(objectKey);
      return readFile(join(storageRoot, normalizedKey));
    },
    async removeObject(objectKey: string): Promise<void> {
      const normalizedKey = normalizeObjectKey(objectKey);
      try {
        await unlink(join(storageRoot, normalizedKey));
      } catch (error) {
        if (isFileNotFoundError(error)) {
          return;
        }
        throw error;
      }
    },
  };
}

function normalizeObjectKey(objectKey: string): string {
  return objectKey
    .replace(/^\/+/, '')
    .replace(/\.\.+/g, '')
    .replace(/\\/g, '/');
}

function isFileNotFoundError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

export function startWorkers(): Worker[] {
  const connection = redisConfig;
  const prisma = new PrismaClient();
  const workers: Worker[] = [];
  const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION_FANOUT, { connection });
  const slaQueue = new Queue(QUEUE_NAMES.SLA_MONITOR, { connection });
  const digestQueue = new Queue(QUEUE_NAMES.EMAIL_DIGEST, { connection });
  const redis = createRedisAdapter(digestQueue);
  const mailService = createMailService();
  const minioClient = createObjectStorageAdapter();

  void scheduleSlaCheck(slaQueue).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[worker] Failed to schedule recurring SLA check: ${message}`);
  });

  workers.push(
    new Worker(
      QUEUE_NAMES.SLA_MONITOR,
      async (job: Job) => {
        if (job.name === 'sla-check') {
          await runSlaCheckJob(prisma, notificationQueue);
          return;
        }

        await createPlaceholderProcessor(QUEUE_NAMES.SLA_MONITOR)(job);
      },
      { connection },
    ),
  );

  workers.push(
    new Worker(
      QUEUE_NAMES.EMAIL_IMMEDIATE,
      async (job: Job) => {
        await processImmediateEmail(job.data as EmailImmediateJobData, { redis, mailService });
      },
      { connection },
    ),
  );

  workers.push(
    new Worker(
      QUEUE_NAMES.EMAIL_DIGEST,
      async (job: Job) => {
        await processEmailDigestWorker(job, { redis, mailService, digestQueue });
      },
      { connection },
    ),
  );

  workers.push(
    new Worker(
      QUEUE_NAMES.IMPORT_REQUESTS,
      async (job: Job) => {
        await processImportRequestsJob(job.data as ImportRequestsJobData, { prisma, redis, minioClient });
      },
      { connection },
    ),
  );

  return workers;
}
