# AGENTS.md — Backend (apps/api)

## Tech Stack

- NestJS (latest) — framework
- TypeScript 5.x (strict mode)
- Prisma — ORM + migrations
- PostgreSQL — primary database
- Redis — queue (BullMQ, planned for worker)
- MinIO — S3-compatible file storage
- Passport.js + JWT — auth strategy
- class-validator + class-transformer — DTO validation
- Swagger (OpenAPI) — auto-generated at `/docs`

---

## Directory Structure

```text
apps/api/src/
├── common/
│   ├── decorators/          ← @CurrentTenant(), @CurrentUser(), @Permissions(), @Public(), @Roles()
│   ├── dto/                 ← Shared DTOs (PageMeta, PaginationQuery)
│   ├── exceptions/          ← Typed app exceptions (AppException, NotFoundException, ForbiddenException, ConflictException)
│   ├── filters/             ← GlobalExceptionFilter (maps exceptions → API error format)
│   ├── guards/              ← JwtAuthGuard, PermissionsGuard, RolesGuard
│   ├── interceptors/        ← TenantContextInterceptor, ResponseTransformInterceptor, LoggingInterceptor, TraceIdInterceptor
│   ├── middleware/          ← HTTP middleware
│   ├── storage/             ← MinIO client wrappers
│   └── types/               ← Shared internal types
├── config/                  ← NestJS ConfigModule schemas + Swagger setup
├── modules/
│   ├── auth/                ← Login, register, refresh, logout, verify-email, forgot/reset-password, invite
│   │   ├── dto/
│   │   └── strategies/      ← JwtStrategy (Passport)
│   ├── user/                ← Profile, preferences, sessions, team management (invite, deactivate, role change)
│   │   └── dto/
│   ├── file/                ← Upload + MinIO signed URL
│   ├── dashboard/           ← KPI aggregates (TODO — placeholder)
│   ├── service-ops/
│   │   ├── request/         ← ServiceRequest CRUD, status transitions, comments, work logs, SLA
│   │   ├── assignment/      ← Assignment history
│   │   ├── sla/             ← SLA policies CRUD
│   │   ├── escalation/      ← Escalation rules
│   │   ├── work-log/        ← Work log entries
│   │   ├── asset/           ← Asset management
│   │   └── resolution/      ← Resolution tracking
│   ├── core/
│   │   ├── auth/            ← Core auth helpers
│   │   ├── user/            ← Core user helpers
│   │   ├── tenant/          ← TenantContext (AsyncLocalStorage)
│   │   ├── role/            ← Role management
│   │   ├── permission/      ← Permission management
│   │   ├── workflow/        ← Workflow transition config
│   │   ├── comment/         ← Comment system
│   │   ├── notification/    ← Notification preferences
│   │   ├── audit/           ← Audit log
│   │   └── work-item/       ← Generic work item
│   └── [legacy — DO NOT TOUCH]
│       ├── billing/
│       ├── invoice/
│       ├── kanban/
│       ├── message/
│       ├── product/
│       └── subscription/
└── prisma/
    └── prisma.service.ts    ← PrismaService (singleton)
```

---

## Key Conventions

### 1. Controller — keep thin

Controllers only handle HTTP concerns: parse params, call service, return result.
No business logic in controllers.

```typescript
// Good
@Get(':id/workflow')
@Permissions({ any: ['request.read.all', 'request.read.own'] })
getWorkflow(
  @CurrentTenant() tenantId: string,
  @CurrentUser('sub') userId: string,
  @Param('id', ParseUUIDPipe) id: string,
) {
  return this.requestService.detailWorkflow(tenantId, userId, id);
}

// Bad — logic in controller
@Get(':id')
async getOne(@Param('id') id: string) {
  const req = await this.prisma.serviceRequest.findFirst({ where: { id } }); // never
  if (!req) throw new Error('not found');
  return req;
}
```

### 2. Multi-tenancy — ALWAYS filter by tenantId

Every Prisma query on tenant-scoped data MUST include `tenantId`.
Use `@CurrentTenant()` decorator to extract from JWT. Never trust request body for tenantId.

```typescript
// Good
async findById(tenantId: string, id: string) {
  return this.prisma.serviceRequest.findFirst({
    where: { id, tenantId },  // always both
  });
}

// Bad — missing tenantId
async findById(id: string) {
  return this.prisma.serviceRequest.findFirst({ where: { id } }); // data leak risk
}
```

### 3. DTO validation — always use class-validator

All incoming request bodies must be typed DTO classes with decorators.
`ValidationPipe` is global — it strips unknown fields (`whitelist: true`) and throws on extras.

```typescript
export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsEnum(RequestPriority)
  priority: RequestPriority;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### 4. Exception types — use typed exceptions, not raw Error

```typescript
// Good
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { ConflictException } from '../../../common/exceptions/conflict.exception';

throw new NotFoundException('REQUEST_NOT_FOUND', 'Request not found');
throw new ForbiddenException('TRANSITION_NOT_ALLOWED', 'Role cannot perform this transition');
throw new ConflictException('SERVICE_TYPE_CODE_EXISTS', 'Service type code already exists');

// Bad
throw new Error('not found');
throw new HttpException('Forbidden', 403);
```

### 5. Permissions — use @Permissions() decorator

```typescript
@Permissions({ all: ['request.create'] })          // must have ALL
@Permissions({ any: ['request.read.all', 'request.read.own'] })  // must have ANY
@Public()                                           // no auth needed
```

Available permissions: `request.create`, `request.read.all`, `request.read.own`, `request.assign`,
`request.reassign`, `request.resolve`, `request.close`, `request.reopen`, `request.escalate`,
`request.start_work`, `comment.create.public`, `comment.create.internal`, `comment.read.internal`,
`workflow.manage`, `sla.manage`, `user.invite`, `user.deactivate`, `role.manage`, `audit.read`

### 6. Response format — use ResponseTransformInterceptor

The global `ResponseTransformInterceptor` wraps all returns automatically:
```json
{ "data": <your return value> }
```

For paginated responses, return `{ data: T[], meta: PageMeta }` — interceptor wraps the whole object.

**Do not manually wrap** in `{ data: ... }` inside services or controllers.

### 7. Prisma — Typed queries, no raw SQL unless necessary

```typescript
// Prisma typed relations — always use include, not raw join
const request = await this.prisma.serviceRequest.findFirst({
  where: { id, tenantId },
  include: {
    serviceType: { select: { code: true, name: true } },
    assignee: { select: { id: true, firstName: true, lastName: true } },
  },
});
```

Use `Prisma.XxxGetPayload<...>` types for complex includes to keep TypeScript happy.

---

## Module Structure Pattern

Every module follows this file layout:

```text
modules/<feature>/
├── <feature>.module.ts      ← @Module decorator, import/export
├── <feature>.controller.ts  ← HTTP handlers only
├── <feature>.service.ts     ← Business logic
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    └── <feature>-response.dto.ts
```

---

## Key Files

| Purpose | Path |
|---|---|
| Entry point | `src/main.ts` |
| App module | `src/app.module.ts` |
| Prisma schema | `prisma/schema.prisma` |
| Seed script | `prisma/seed.ts` |
| PrismaService | `src/prisma/prisma.service.ts` |
| JWT Strategy | `src/modules/auth/strategies/jwt.strategy.ts` |
| TenantContext | `src/modules/core/tenant/tenant.context.ts` |
| Global exception filter | `src/common/filters/global-exception.filter.ts` |
| Response transform | `src/common/interceptors/response-transform.interceptor.ts` |
| @CurrentTenant() | `src/common/decorators/current-tenant.decorator.ts` |
| @CurrentUser() | `src/common/decorators/current-user.decorator.ts` |
| @Permissions() | `src/common/decorators/permissions.decorator.ts` |
| Request module | `src/modules/service-ops/request/` |
| User module | `src/modules/user/` |
| Auth module | `src/modules/auth/` |

---

## Swagger

Auto-generated at `http://localhost:8081/docs`.

Annotate all controllers and DTOs:

```typescript
@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestController { ... }

@ApiOperation({ summary: 'Get request workflow detail' })
@ApiParam({ name: 'id', type: String })
@Get(':id/workflow')
getWorkflow(...) { ... }
```

---

## Testing

- Unit tests: `*.spec.ts` beside the file being tested
- Framework: Jest + NestJS testing utilities
- Run: `pnpm --filter @supportops/api test`
- Build check: `pnpm --filter @supportops/api build`

---

## ⛔ DO NOT

| Action | Reason |
|---|---|
| Add logic to controllers | Thin controllers only |
| Query without `tenantId` | Multi-tenant data isolation |
| Use `any` type | Strict TypeScript |
| Throw raw `Error` or `HttpException` | Use typed app exceptions |
| Touch legacy modules (billing, invoice, kanban, message, product, subscription) | Being retired |
| Add a new role beyond the 4 existing | No requirement yet |
| Bypass `@Permissions()` with manual role check in service | Use the guard system |
| Manually wrap response in `{ data: ... }` | Interceptor handles it |
