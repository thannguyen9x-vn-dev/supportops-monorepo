# Worker (Planned)

This app is a placeholder for background jobs/queue processing.
Detailed plan: `docs/worker-roadmap.md`.

## Planned scope
- Email delivery and retry queue
- Billing/subscription reconciliation jobs
- Scheduled cleanup/retention jobs
- File processing (thumbnails/virus-scan hooks)

## Suggested stack
- NestJS standalone app or BullMQ worker
- Redis as queue backend
- Shared DTO/contracts from `@supportops/types`

## Definition of done (phase 1)
1. `bullmq` queue setup with Redis connection
2. One production job (`send-email`) with retry/backoff
3. Worker health endpoint/heartbeat metric
4. Structured logs + dead-letter handling
5. Basic integration test for processor
