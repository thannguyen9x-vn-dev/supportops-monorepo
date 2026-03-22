# Worker Roadmap

Status: planned, not implemented yet. See `docs/AGENT_TASKS.md` Task 2.3 for implementation spec.

## Goal

Introduce `apps/worker` to process background jobs outside HTTP request lifecycle.
Focus: SLA monitoring and escalation for the ServiceOps domain.

> **⚠️ Out of scope:** billing/subscription reconciliation, invoice processing — these legacy modules are being retired.

## Phase 1 — SLA Monitor (MVP)

1. Setup BullMQ + Redis connection.
2. Job: `sla-check` — runs every 5 minutes.
   - Query requests WHERE status IN (SUBMITTED, TRIAGE, ASSIGNED, IN_PROGRESS).
   - Calculate SLA elapsed time.
   - Update `slaHealth` → `AT_RISK` if elapsed > 80% of threshold.
   - Update `slaHealth` → `BREACHED` if elapsed > 100%.
3. Job: `escalation-check` — runs every 15 minutes.
   - Query requests WHERE `slaHealth` = BREACHED AND `escalated` = false.
   - Mark as escalated.
   - Log activity event.
4. Dead-letter queue and structured logging.
5. Worker health/heartbeat metrics endpoint.

## Phase 2 — Notifications

1. Job: `send-email` — triggered by SLA breach / escalation / assignment events.
   - Retry with exponential backoff.
   - Respects user notification preferences.
2. Scheduled cleanup: expired sessions, temp files.

## Exit Criteria

- Worker can be deployed independently from `apps/api`.
- At-least-once delivery is observable and monitored.
- Failed jobs are traceable and recoverable.
- `pnpm --filter @supportops/worker build` passes (no longer a TODO echo).
