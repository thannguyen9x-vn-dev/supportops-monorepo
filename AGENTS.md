# AGENTS.md — SupportOps Platform

## Repository Naming
- This repository is a monorepo containing frontend (`apps/web`), backend (`apps/api`), and worker (`apps/worker`).
- Use a neutral repository name (for example `supportops-admin`, `supportops-platform`, or `supportops-monorepo`) to avoid the impression that it is frontend-only.

## Project Overview
SupportOps is a multi-tenant internal operations platform for managing service requests — think IT helpdesk / internal ticketing where teams submit, assign, track, and resolve requests.

- **Frontend**: Next.js (App Router) + TypeScript + MUI-based design system
- **Backend**: NestJS + TypeScript + Prisma
- **Database**: PostgreSQL + Prisma migrations
- **Cache**: Redis (queued jobs planned)
- **Storage**: MinIO (S3-compatible) for file uploads
- **Monorepo**: pnpm workspaces

## Monorepo Structure

```text
root/
├── apps/
│   ├── web/                    # Next.js Frontend (port 3000)
│   ├── api/                    # NestJS Backend (port 8081)
│   └── worker/                 # Background job workers (BullMQ — planned)
├── packages/
│   ├── ui/                     # Shared UI components (React + MUI)
│   ├── types/                  # API contracts: types, Zod schemas, endpoint constants
│   ├── eslint-config/          # Shared ESLint flat configs
│   └── tsconfig/               # Shared TypeScript base configs
├── docs/                       # Documentation
├── pnpm-workspace.yaml
└── AGENTS.md                   # ← This file
```

## Module Map

```text
┌─────────────────────────────────────────────────────────────────┐
│                      SupportOps Platform                         │
├──────────────────┬───────────────────────┬──────────────────────┤
│   CORE           │   SERVICE-OPS         │   SETTINGS/ADMIN     │
├──────────────────┼───────────────────────┼──────────────────────┤
│ Auth & RBAC      │ Requests (CRUD)       │ Workflow config      │
│ User Profile     │ Assignment            │ SLA policies         │
│ Team Management  │ SLA tracking          │ Service types        │
│ File Upload      │ Escalation            │ Admin (user mgmt)    │
│                  │ Resolution            │                      │
│                  │ Work Logs             │                      │
│                  │ Audit Log             │                      │
└──────────────────┴───────────────────────┴──────────────────────┘
```

**Legacy modules removed (Phase 3.4 completed):**
`product`, `kanban`, `message`, `billing`, `subscription`, `invoice`

## Key Architectural Principles

### 1. Backend-Agnostic Frontend
- Frontend NEVER hardcodes backend URLs
- All API calls: Component → Hook → Service → `apiClient.ts`
- All types come from `@supportops/types`
- Changing backend = changing ONE env variable (`NEXT_PUBLIC_API_BASE_URL`)

### 2. Contracts as Single Source of Truth
- `packages/types/` defines ALL API types, Zod schemas, and endpoint paths
- Both FE and BE MUST conform to these contracts
- When adding a new API endpoint: update `packages/types/` FIRST
- Organized under `core/` and `service-ops/` subdirectories

### 3. Multi-Tenancy (Shared DB, tenant_id column)
- Every data table has `tenantId` column
- Tenant resolved from JWT claims on every request
- Backend uses `@CurrentTenant()` decorator to scope ALL queries
- NEVER write a query without `tenantId` filter

### 4. Consistent API Response Format
```json
// Success (single)
{ "data": { ... } }

// Success (paginated)
{
  "data": [ ... ],
  "meta": { "page": 1, "size": 20, "total": 100, "totalPages": 5 }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": ["email: must not be blank"],
    "traceId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 5. Module-Based Architecture
Backend organized under `apps/api/src/modules/`:
- `auth/` — register, login, refresh, logout, verify-email, forgot/reset password, invite
- `user/` — profile, preferences, sessions, team management
- `file/` — upload, access URL
- `service-ops/request/` — service request CRUD
- `service-ops/assignment/`, `sla/`, `escalation/`, `resolution/`, `work-log/`, `asset/`

Frontend organized under `apps/web/src/features/`:
- `auth/` — guards, services, hooks
- `team/` — team member list, invite, role management
- `service-ops/requests/` — list, detail, intake screens
- `layout/` — navigation, header, sidebar

## Database Schema (Core Models)

```text
Tenant
  │
  ├── User ──── Membership (role in tenant)
  │      │──── UserPreference
  │      │──── RefreshSession
  │      │──── Invite
  │
  ├── AuthRole ──── AuthRolePermission ──── AuthPermission
  │
  ├── ServiceType
  │
  ├── ServiceRequest
  │      │──── RequestActivity
  │      │──── RequestComment
  │      │──── RequestAttachment
  │      │──── WorkLog
  │      │──── SlaRecord
  │      └──── AssignmentHistory
  │
  ├── AuditLog
  │
  └── UploadedFile
```

## Implementation Status (v1)

### Done
- Auth full flow: register, login, logout, refresh (HttpOnly cookie), verify-email, forgot/reset password, invite/accept-invite
- User profile: get, update, avatar upload, change password, sessions
- Team management: list members, invite, deactivate, reactivate, change role
- Service requests: list (paginated, tab-aware, filtered by status/serviceType/assignee/location/SLA), create (draft or submit mode)
- Request detail: workflow endpoint, status transitions, assign/reassign, comments, work logs
- Settings: service types, SLA policies, workflow transitions CRUD
- Admin: user management (UI)
- File upload via MinIO
- RBAC: permission-based guards on all endpoints

### In Progress / Planned
- SLA background jobs (assignment SLA + resolution SLA monitoring)
- Escalation automation
- Background worker (BullMQ + Redis)
- Email notifications
- Dashboard / KPI aggregation

## Coding Standards

### TypeScript (Frontend)
- Strict mode enabled
- No `any` — use `unknown` then narrow
- Prefer `interface` over `type` for object shapes
- Use barrel exports (`index.ts`) per module
- Components: `PascalCase.tsx`, Utils: `camelCase.ts`, Services: `kebab-case.service.ts`

### TypeScript (Backend - NestJS)
- Strict mode enabled
- Use DTO classes with `class-validator` and `class-transformer`
- Keep controllers thin; business logic in services
- Module-first organization (`modules/<feature>`)
- Prisma for data access — always include `tenantId` in queries
- Global exception handling through Nest filters

### Git Commits
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Scope by module: `feat(auth): add login endpoint`
- Atomic commits — one logical change per commit

### Pre-Commit Quality Gate (Required)
- Before any `git commit` or `git push`, run:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm --filter @supportops/web test` (when frontend/web code changes)
- `pnpm --filter @supportops/ui build` (when shared UI package changes)
- `pnpm --filter @supportops/web build` (when web routes/pages are changed)
- `pnpm --filter @supportops/api build` (when backend code changes)
- If backend or shared packages are changed, run the corresponding package tests before commit.
- Only commit after these checks pass locally (unless explicitly asked to skip).

## Important File Locations

| Purpose | Path |
|---|---|
| API Client | `apps/web/src/lib/api/apiClient.ts` |
| Auth Context | `apps/web/src/lib/auth/AuthContext.tsx` |
| Environment Config | `apps/web/src/lib/config/env.ts` |
| API Contracts (types) | `packages/types/src/types/` and `packages/types/src/service-ops/` |
| API Contracts (schemas) | `packages/types/src/schemas/` |
| API Endpoints | `packages/types/src/endpoints.ts` |
| Feature Services (FE) | `apps/web/src/features/*/services/` |
| Nest Entry | `apps/api/src/main.ts` |
| App Module | `apps/api/src/app.module.ts` |
| Prisma Schema | `apps/api/prisma/schema.prisma` |
| Auth Module | `apps/api/src/modules/auth/` |
| Request Module | `apps/api/src/modules/service-ops/request/` |
| Docker Compose | `docker-compose.prod.yml` |

## How to Run

```bash
# Infrastructure (PostgreSQL + Redis + MinIO)
cd apps/api && docker compose up -d

# Backend
cd apps/api && pnpm dev                  # http://localhost:8081

# Frontend
cd apps/web && pnpm dev                  # http://localhost:3000

# Type-check contracts
cd packages/types && pnpm typecheck

# Build shared UI (required after source changes)
cd packages/ui && pnpm build
```

## Testing

### Frontend
- Unit: Jest 29 + React Testing Library + MSW v2
- E2E: Playwright (planned)
- Files: `*.test.ts(x)` — see `docs/tech-debt/frontend-architecture.md` for MSW setup details
- Run: `npx jest --testPathPattern="..." --no-coverage` from `apps/web/`

### Backend
- Unit: Jest (Nest testing utilities)
- Integration: Supertest + real PostgreSQL/containers
- Files: `*.spec.ts` under module directories
