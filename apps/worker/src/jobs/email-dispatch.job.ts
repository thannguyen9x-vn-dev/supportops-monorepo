import { Job, Queue } from 'bullmq';
import { buildDigestHtml, buildDigestSubject, DigestEventItem } from '../templates/email-digest.template';
import { buildImmediateHtml, buildImmediateSubject } from '../templates/email-immediate.template';

export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { exSeconds?: number; keepTtl?: boolean }): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

export interface MailServiceLike {
  send(payload: { to: string; subject: string; html: string }): Promise<void>;
}

export interface DigestQueueLike {
  add(
    name: string,
    data: EmailDigestSendJobData,
    options?: { delay?: number; jobId?: string },
  ): Promise<unknown>;
}

export interface EmailImmediateJobData {
  userId: string;
  requestId: string;
  to: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface EmailDigestEventJobData {
  userId: string;
  requestId: string;
  tenantId: string;
  to: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface EmailDigestSendJobData {
  userId: string;
  requestId: string;
  tenantId: string;
  to: string;
  bufferKey: string;
}

function buildRateLimitKey(userId: string, requestId: string): string {
  return `email-rate:${userId}:${requestId}`;
}

export async function canSendEmail(redis: RedisLike, userId: string, requestId: string): Promise<boolean> {
  const rateKey = buildRateLimitKey(userId, requestId);
  const sentCount = Number((await redis.get(rateKey)) ?? 0);
  if (sentCount >= 5) {
    return false;
  }

  await redis.incr(rateKey);
  await redis.expire(rateKey, 3600);
  return true;
}

export async function processImmediateEmail(
  data: EmailImmediateJobData,
  deps: { redis: RedisLike; mailService: MailServiceLike },
): Promise<void> {
  if (!(await canSendEmail(deps.redis, data.userId, data.requestId))) {
    return;
  }

  const subject = buildImmediateSubject(data.eventType, data.payload);
  const html = buildImmediateHtml(data.eventType, data.payload);
  await deps.mailService.send({
    to: data.to,
    subject,
    html,
  });
}

export async function processDigestEvent(
  data: EmailDigestEventJobData,
  deps: { redis: RedisLike; digestQueue: DigestQueueLike },
): Promise<void> {
  const bufferKey = `digest:${data.tenantId}:${data.userId}:${data.requestId}`;
  const existing = await deps.redis.get(bufferKey);
  const events: DigestEventItem[] = existing ? JSON.parse(existing) : [];

  events.push({
    eventType: data.eventType,
    payload: data.payload,
    at: new Date().toISOString(),
  });

  if (events.length === 1) {
    await deps.redis.set(bufferKey, JSON.stringify(events), { exSeconds: 300 });
    await deps.digestQueue.add(
      'send-digest',
      {
        userId: data.userId,
        requestId: data.requestId,
        tenantId: data.tenantId,
        to: data.to,
        bufferKey,
      } as EmailDigestSendJobData,
      {
        delay: 300_000,
        jobId: `digest-${bufferKey}`,
      },
    );
    return;
  }

  await deps.redis.set(bufferKey, JSON.stringify(events), { keepTtl: true });
}

export async function processDigestSend(
  data: EmailDigestSendJobData,
  deps: { redis: RedisLike; mailService: MailServiceLike },
): Promise<void> {
  const raw = await deps.redis.get(data.bufferKey);
  if (!raw) {
    return;
  }

  const events = JSON.parse(raw) as DigestEventItem[];
  if (!(await canSendEmail(deps.redis, data.userId, data.requestId))) {
    return;
  }

  const subject = buildDigestSubject(events, data.requestId);
  const html = buildDigestHtml(events, data.requestId, data.tenantId);

  await deps.mailService.send({
    to: data.to,
    subject,
    html,
  });

  await deps.redis.del(data.bufferKey);
}

export async function processEmailDigestWorker(
  job: Job,
  deps: { redis: RedisLike; mailService: MailServiceLike; digestQueue: DigestQueueLike },
): Promise<void> {
  if (job.name === 'send-digest') {
    await processDigestSend(job.data as EmailDigestSendJobData, deps);
    return;
  }

  await processDigestEvent(job.data as EmailDigestEventJobData, deps);
}
