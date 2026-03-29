import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canSendEmail,
  DigestQueueLike,
  processDigestEvent,
  processDigestSend,
  processImmediateEmail,
  RedisLike,
} from './email-dispatch.job';

describe('email-dispatch job', () => {
  let redisStore: Map<string, string>;
  let redis: RedisLike;
  let mailService: { send: ReturnType<typeof vi.fn> };
  let digestQueue: DigestQueueLike;

  beforeEach(() => {
    redisStore = new Map();

    redis = {
      get: vi.fn(async (key: string) => redisStore.get(key) ?? null),
      set: vi.fn(async (key: string, value: string) => {
        redisStore.set(key, value);
      }),
      del: vi.fn(async (key: string) => {
        redisStore.delete(key);
      }),
      incr: vi.fn(async (key: string) => {
        const current = Number(redisStore.get(key) ?? '0') + 1;
        redisStore.set(key, String(current));
        return current;
      }),
      expire: vi.fn(async () => {}),
    };

    mailService = {
      send: vi.fn(async () => {}),
    };

    digestQueue = {
      add: vi.fn(async () => ({})),
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T10:00:00.000Z'));
  });

  it('email.immediate sends email immediately', async () => {
    await processImmediateEmail(
      {
        userId: 'u1',
        requestId: 'r1',
        to: 'u1@example.com',
        eventType: 'REQUEST_ASSIGNED',
        payload: { requestCode: 'REQ-1' },
      },
      { redis, mailService },
    );

    expect(mailService.send).toHaveBeenCalledTimes(1);
  });

  it('email.digest buffers events in 5-minute window', async () => {
    await processDigestEvent(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        eventType: 'REQUEST_CREATED',
        payload: { message: 'created' },
      },
      { redis, digestQueue },
    );

    await processDigestEvent(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        eventType: 'REQUEST_COMMENTED',
        payload: { message: 'comment' },
      },
      { redis, digestQueue },
    );

    const buffer = await redis.get('digest:t1:u1:r1');
    const events = JSON.parse(buffer ?? '[]');

    expect(events).toHaveLength(2);
  });

  it('email.digest sends one consolidated email after 5 minutes', async () => {
    await processDigestEvent(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        eventType: 'REQUEST_CREATED',
        payload: { message: 'created' },
      },
      { redis, digestQueue },
    );

    await processDigestEvent(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        eventType: 'REQUEST_STATUS_CHANGED',
        payload: { message: 'status' },
      },
      { redis, digestQueue },
    );

    await processDigestSend(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        bufferKey: 'digest:t1:u1:r1',
      },
      { redis, mailService },
    );

    expect(mailService.send).toHaveBeenCalledTimes(1);
  });

  it('rate limit skips 6th event within one hour', async () => {
    for (let i = 0; i < 5; i += 1) {
      const allowed = await canSendEmail(redis, 'u1', 'r1');
      expect(allowed).toBe(true);
    }

    const allowedSixth = await canSendEmail(redis, 'u1', 'r1');
    expect(allowedSixth).toBe(false);
  });

  it('rate limit is isolated per requestId', async () => {
    for (let i = 0; i < 5; i += 1) {
      await canSendEmail(redis, 'u1', 'r1');
    }

    const otherRequestAllowed = await canSendEmail(redis, 'u1', 'r2');
    expect(otherRequestAllowed).toBe(true);
  });

  it('digest buffer key is deleted after send', async () => {
    await processDigestEvent(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        eventType: 'REQUEST_CREATED',
        payload: { message: 'created' },
      },
      { redis, digestQueue },
    );

    await processDigestSend(
      {
        userId: 'u1',
        requestId: 'r1',
        tenantId: 't1',
        to: 'u1@example.com',
        bufferKey: 'digest:t1:u1:r1',
      },
      { redis, mailService },
    );

    expect(await redis.get('digest:t1:u1:r1')).toBeNull();
  });
});
