# Contributing to SupportOps

## Quick Start

```bash
# install deps
pnpm install

# start infra
cd apps/api && docker compose up -d

# run backend
cd apps/api && ./gradlew bootRun

# run frontend
cd apps/web && pnpm dev
```

## Workflow
- Branch from `main`
- Follow Conventional Commits
- Keep PRs focused and atomic
- Ensure tests pass before PR

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
2. Migration (`apps/api/src/main/resources/db/migration`)
3. Backend module
4. Frontend service/hook/component/page
5. Tests + i18n update

## Checklist
- Tenant filter present on all tenant data queries
- Validation annotations on request DTOs
- No hardcoded API URL in frontend
- No user-facing hardcoded strings
- Loading/error/empty states handled
