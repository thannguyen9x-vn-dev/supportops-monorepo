# Monorepo Guide

## Repository layout

```text
supportops-monorepo/
├── apps/
│   ├── web/      # Next.js frontend
│   ├── api/      # NestJS backend
│   └── worker/   # BullMQ background jobs
├── packages/
│   ├── types/         # Shared API/domain contracts
│   ├── ui/            # Shared UI packages
│   ├── eslint-config/ # Shared lint config
│   └── tsconfig/      # Shared TS config
└── docs/
```

## Package responsibilities
- `apps/web`: route rendering, hooks, feature services, i18n UI.
- `apps/api`: REST endpoints, RBAC, business logic, Prisma persistence.
- `apps/worker`: scheduled SLA and escalation jobs.
- `@supportops/types`: shared enums/domain/dto/ui types and endpoints.
- `@supportops/ui*`: reusable frontend UI building blocks.

## Dependency direction
1. `apps/*` can depend on `packages/*`.
2. `packages/*` must not depend on `apps/*`.
3. `@supportops/types` stays pure (no runtime business logic).

## Build and run order
1. Install dependencies:
   - `pnpm install`
2. Start infrastructure (Postgres/Redis/MinIO) as configured.
3. Generate/apply Prisma artifacts in API when schema changes.
4. Run apps:
   - `pnpm --filter @supportops/api dev`
   - `pnpm --filter @supportops/web dev`
   - `pnpm --filter @supportops/worker dev` (when worker validation is needed)

## Quality gate (local)
- `pnpm lint`
- `pnpm typecheck`
- `pnpm --filter @supportops/web test` (if frontend changed)
- `pnpm --filter @supportops/web build` (if routes/pages changed)
- `pnpm --filter @supportops/api build` (if backend changed)
- `pnpm --filter @supportops/ui build` (if shared UI changed)

## Typical feature workflow
1. Define/update contracts in `@supportops/types`.
2. Implement backend endpoint/service.
3. Wire frontend service/hook/component.
4. Add i18n keys and tests.
5. Run quality gate and update docs.
