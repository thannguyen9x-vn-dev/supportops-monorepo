# API Medium Hardening

## Structured Logging (Pino)

- API now uses `nestjs-pino` with JSON logs in production.
- Local/dev uses `pino-pretty` for readable output.
- Configure log level with `LOG_LEVEL` (default: `info`).

## Readiness Endpoint

- `GET /api/v1/health`: liveness probe.
- `GET /api/v1/ready`: readiness probe (checks PostgreSQL + Redis).
- If any dependency is down, API returns `503 SERVICE_UNAVAILABLE`.

## Audit Log Retention

- Script: `pnpm --filter @supportops/api audit:prune`
- Env var: `AUDIT_LOG_RETENTION_DAYS` (default `2555` days ~= 7 years).

Example cron (daily at 01:30):

```bash
30 1 * * * cd /opt/supportops && AUDIT_LOG_RETENTION_DAYS=2555 pnpm --filter @supportops/api audit:prune >> /var/log/supportops-audit-prune.log 2>&1
```

## Error Monitoring Baseline

- API tracks server-side 5xx errors in a sliding window.
- When threshold is exceeded, it writes an alert log.
- Optional webhook alert via `ERROR_ALERT_WEBHOOK_URL`.

Env vars:

- `ERROR_ALERT_THRESHOLD` (default `20`)
- `ERROR_ALERT_WINDOW_MS` (default `300000`, 5 minutes)
- `ERROR_ALERT_COOLDOWN_MS` (default `900000`, 15 minutes)
- `ERROR_ALERT_WEBHOOK_URL` (optional)
