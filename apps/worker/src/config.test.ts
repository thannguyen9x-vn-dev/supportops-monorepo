import { afterEach, describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('uses defaults when env vars are missing', () => {
    delete process.env.REDIS_URL;
    delete process.env.WORKER_QUEUE_NAME;
    delete process.env.WORKER_SLA_CHECK_EVERY_MS;
    delete process.env.WORKER_ESCALATION_CHECK_EVERY_MS;

    expect(loadConfig()).toEqual({
      redisUrl: 'redis://localhost:6379',
      queueName: 'supportops-sla-monitor',
      slaCheckEveryMs: 300000,
      escalationCheckEveryMs: 900000,
    });
  });

  it('reads env vars and keeps only positive numeric intervals', () => {
    process.env.REDIS_URL = 'redis://example:6379';
    process.env.WORKER_QUEUE_NAME = 'custom-queue';
    process.env.WORKER_SLA_CHECK_EVERY_MS = '60000';
    process.env.WORKER_ESCALATION_CHECK_EVERY_MS = '-1';

    expect(loadConfig()).toEqual({
      redisUrl: 'redis://example:6379',
      queueName: 'custom-queue',
      slaCheckEveryMs: 60000,
      escalationCheckEveryMs: 900000,
    });
  });
});
