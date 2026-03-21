# Worker Roadmap

Status: planned, not implemented yet.

## Goal
Introduce `apps/worker` to process background jobs outside HTTP request lifecycle.

## Phase 1 (MVP)
1. Add queue infrastructure (BullMQ + Redis).
2. Implement `send-email` job with retry and exponential backoff.
3. Add dead-letter queue and structured logging.
4. Expose worker health/heartbeat metrics.
5. Add one integration test for job processing.

## Phase 2
1. Subscription/billing reconciliation jobs.
2. Scheduled cleanup (expired sessions, temp files).
3. File post-processing hooks (thumbnails, validation pipeline).

## Exit Criteria
- Worker can be deployed independently from `apps/api`.
- At-least-once delivery is observable and monitored.
- Failed jobs are traceable and recoverable.
