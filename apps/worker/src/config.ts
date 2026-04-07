export const QUEUE_NAMES = {
  NOTIFICATION_FANOUT: 'notification-fanout',
  EMAIL_IMMEDIATE: 'email-immediate',
  EMAIL_DIGEST: 'email-digest',
  SLA_MONITOR: 'sla-monitor',
  IMPORT_REQUESTS: 'import-requests',
} as const;

function parseRedisPort(value: string | undefined): number {
  if (!value) {
    return 6379;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6379;
}

export const redisConfig = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseRedisPort(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};
