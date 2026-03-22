# SupportOps Monorepo

This repository contains the **SupportOps Admin monorepo**:

- Frontend: `apps/web` (Next.js)
- Backend API: `apps/api` (NestJS)
- Worker: `apps/worker`
- Shared packages: `packages/*`

## Repository Naming

If you rename this repository, use a neutral name that reflects FE + BE + worker, for example:

- `supportops-admin`
- `supportops-platform`
- `supportops-monorepo`

## Quick Start

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm -r --if-present test
```
