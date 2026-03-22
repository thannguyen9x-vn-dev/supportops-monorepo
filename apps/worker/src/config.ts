export type WorkerConfig = {
  redisUrl: string;
  queueName: string;
  slaCheckEveryMs: number;
  escalationCheckEveryMs: number;
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig(): WorkerConfig {
  return {
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    queueName: process.env.WORKER_QUEUE_NAME ?? 'supportops-sla-monitor',
    slaCheckEveryMs: parseNumber(process.env.WORKER_SLA_CHECK_EVERY_MS, 5 * 60 * 1000),
    escalationCheckEveryMs: parseNumber(process.env.WORKER_ESCALATION_CHECK_EVERY_MS, 15 * 60 * 1000),
  };
}
