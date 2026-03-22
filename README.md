# SupportOps Platform

## What is this?
SupportOps is a multi-tenant internal operations platform for request management (IT/facilities/service operations). Teams can submit, triage, assign, resolve, and audit service requests with SLA tracking, role-based access control, and activity timelines.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, MUI |
| Backend | NestJS, TypeScript, Prisma |
| Database | PostgreSQL |
| Cache / Queue | Redis, BullMQ (worker) |
| Storage | MinIO (S3-compatible file storage) |
| CI/CD | GitHub Actions (runbook in `docs/cicd-nest-next-runbook.md`) |

## Monorepo Structure

```text
supportops-monorepo/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # NestJS backend API
│   └── worker/       # BullMQ background jobs
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

# 2) Start infra (Postgres + Redis + MinIO)
docker compose -f docker-compose.prod.yml up -d

# 3) Run database migrations + seed demo data
pnpm --filter @supportops/api exec prisma migrate deploy
pnpm --filter @supportops/api exec prisma db seed

# 4) Start API + Web
pnpm --filter @supportops/api dev
pnpm --filter @supportops/web dev
```

Default URLs:
- Web: `http://localhost:3000`
- API: `http://localhost:8081`

## Demo Accounts

| Email | Role | Password |
|---|---|---|
| `admin@supportops-demo.com` | `TENANT_ADMIN` | `DemoPass123!` |
| `coordinator@supportops-demo.com` | `OPS_COORDINATOR` | `DemoPass123!` |
| `technician@supportops-demo.com` | `TECHNICIAN` | `DemoPass123!` |
| `employee@supportops-demo.com` | `EMPLOYEE` | `DemoPass123!` |

## Key Features
- Auth & RBAC: register/login/refresh/invite/verify-email with permission guards.
- Requests: list, create (draft/submit), detail workflow, comments, work logs, assignment.
- Team management: invite members, change role/department, deactivate/reactivate.
- Settings: service types, SLA policies, workflow transition rules.
- Dashboard: ServiceOps KPI and recent activity from live API.
- SLA automation: worker jobs for SLA risk/breach and escalation checks.

## Architecture Docs
- [Product Overview](docs/product-overview.md)
- [Request Flow](docs/request-flow.md)
- [Auth and Roles](docs/auth-and-roles.md)
- [Monorepo Guide](docs/monorepo-guide.md)
- [API Spec](docs/api-spec.md)
- [MVP Roadmap](docs/AGENT_TASKS.md)
- [CI/CD Runbook](docs/cicd-nest-next-runbook.md)

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for coding conventions, task workflow, and quality gates.
