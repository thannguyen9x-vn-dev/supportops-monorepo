# Worker (Phase 1)

Worker app for ServiceOps background jobs.

## Implemented in Phase 1
- BullMQ queue + Redis connection
- `sla-check` recurring job (default every 5 minutes)
- `escalation-check` recurring job (default every 15 minutes)
- Prisma-backed updates for SLA health and auto-escalation
- Structured JSON logs for start/completion/failure

## Scope note
- Focused only on ServiceOps SLA monitoring/escalation.
- Billing/subscription legacy jobs are out of scope.

## Run
```bash
pnpm --filter @supportops/worker dev
```

## Environment variables
- `REDIS_URL` (default: `redis://localhost:6379`)
- `WORKER_QUEUE_NAME` (default: `supportops-sla-monitor`)
- `WORKER_SLA_CHECK_EVERY_MS` (default: `300000`)
- `WORKER_ESCALATION_CHECK_EVERY_MS` (default: `900000`)
