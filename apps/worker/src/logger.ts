export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const payload = {
    timestamp: new Date().toISOString(),
    service: 'supportops-worker',
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  if (level === 'ERROR') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'WARN') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}
