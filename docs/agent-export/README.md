# SupportOps Platform

## What is this?
SupportOps is a multi-tenant internal operations platform for request management (IT/facilities/service operations). Teams can submit, triage, assign, resolve, and audit service requests with SLA tracking, role-based access control, and activity timelines.

- **Live demo**: [app.thannguyen.org](https://app.thannguyen.org)
- **Portfolio**: [thannguyen.org](https://thannguyen.org)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, MUI 7 |
| Backend | NestJS 11, TypeScript, Prisma 6 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, BullMQ (worker) |
| Storage | Local file storage with signed URL access control |
| CI/CD | GitHub Actions — build, push to GHCR, SSH deploy |

## Monorepo Structure

```text
supportops-monorepo/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # NestJS backend API
│   ├── worker/       # BullMQ background jobs
│   └── portfolio/    # Portfolio / landing page (Next.js)
├── packages/
│   ├── types/        # Shared API/domain contracts
│   ├── ui/           # Shared UI packages
│   ├── eslint-config/
│   └── tsconfig/
└── docs/
```

## Quick Start

```bash
# 1) Install dependencies
pnpm install

# 2) Start infra (Postgres + Redis)
docker compose -f docker-compose.dev.yml up -d

# 3) Copy and configure env
cp apps/api/.env.example apps/api/.env

# 4) Run database migrations + seed demo data
pnpm --filter @supportops/api exec prisma migrate deploy
pnpm --filter @supportops/api exec prisma db seed

# 5) Start API + Web
pnpm --filter @supportops/api dev
pnpm --filter @supportops/web dev
```

Default URLs:
- Web: `http://localhost:3000`
- API: `http://localhost:8081`

## Demo Accounts

Password for all accounts: `SupportOps@123`

| Role | Email |
|---|---|
| Tenant Admin | `sarah.chen@supportops.dev` |
| Ops Coordinator | `marcus.rivera@supportops.dev` |
| Technician | `jordan.kim@supportops.dev` |
| Employee | `oliver.davis@supportops.dev` |

## Key Features
- Auth & RBAC: register/login/refresh/invite/verify-email with permission guards
- Requests: list, create (draft/submit), detail workflow, comments, work logs, assignment
- Team management: invite members, change role/department, deactivate/reactivate
- Settings: service types, SLA policies, workflow transition rules
- Dashboard: KPI overview and recent activity from live API
- SLA automation: worker jobs for SLA risk/breach and escalation checks

## Architecture Docs
- [Product Overview](docs/product-overview.md)
- [Request Flow](docs/request-flow.md)
- [Auth and Roles](docs/auth-and-roles.md)
- [Monorepo Guide](docs/monorepo-guide.md)
- [API Spec](docs/api-spec.md)
- [CI/CD Runbook](docs/cicd-nest-next-runbook.md)

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for coding conventions, branch workflow, and quality gates.
