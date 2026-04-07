import { afterEach, describe, expect, it, vi } from 'vitest';

describe('worker config', () => {
  const envBackup = { ...process.env };

  afterEach(async () => {
    process.env = { ...envBackup };
    vi.resetModules();
  });

  it('exports queue names and default redis config', async () => {
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;

    vi.resetModules();
    const { QUEUE_NAMES, redisConfig } = await import('./config');

    expect(QUEUE_NAMES).toEqual({
      NOTIFICATION_FANOUT: 'notification-fanout',
      EMAIL_IMMEDIATE: 'email-immediate',
      EMAIL_DIGEST: 'email-digest',
      SLA_MONITOR: 'sla-monitor',
      IMPORT_REQUESTS: 'import-requests',
    });
    expect(redisConfig).toEqual({
      host: 'localhost',
      port: 6379,
      password: undefined,
    });
  });

  it('reads redis env values and validates invalid REDIS_PORT', async () => {
    process.env.REDIS_HOST = 'redis.internal';
    process.env.REDIS_PORT = 'invalid';
    process.env.REDIS_PASSWORD = 'secret';

    vi.resetModules();
    const { redisConfig } = await import('./config');

    expect(redisConfig).toEqual({
      host: 'redis.internal',
      port: 6379,
      password: 'secret',
    });
  });
});
