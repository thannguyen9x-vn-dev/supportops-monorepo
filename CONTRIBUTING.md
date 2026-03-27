# Contributing to SupportOps

## Quick Start

```bash
# Install deps
pnpm install

# Start infra (Postgres + Redis)
docker compose -f docker-compose.dev.yml up -d

# Run migrations + seed
pnpm --filter @supportops/api exec prisma migrate deploy
pnpm --filter @supportops/api exec prisma db seed

# Start API
pnpm --filter @supportops/api dev

# Start Web
pnpm --filter @supportops/web dev
```

## Branch Workflow
- Branch from `develop`
- Follow Conventional Commits
- Keep PRs focused and atomic
- Ensure lint + typecheck + tests pass before PR

## Commit Format
```text
feat(module): short summary
fix(module): short summary
refactor(module): short summary
docs: short summary
test(module): short summary
chore: short summary
```

## Feature Delivery Order
1. Contracts first (`packages/types`)
2. Prisma migration (`apps/api/prisma/migrations`)
3. Backend module (NestJS service/controller/guard)
4. Frontend service/hook/component/page
5. Tests + i18n update

## Checklist
- Tenant filter present on all tenant data queries
- Validation decorators on all request DTOs
- No hardcoded API URL in frontend
- No user-facing hardcoded strings
- Loading/error/empty states handled
