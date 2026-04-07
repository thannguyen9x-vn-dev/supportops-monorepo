# Master Checklist — SupportOps
# Từ Ý Tưởng Đến Production

---

## PHASE 0 — Bootstrap (Làm 1 lần duy nhất)

> Đây là nền tảng của toàn bộ hệ thống. Phải hoàn thành trước khi implement bất kỳ feature nào.

### 0.1 Monorepo & Tooling

```
[ ] Khởi tạo pnpm workspace (pnpm-workspace.yaml)
[ ] Cấu hình Turborepo (turbo.json)
[ ] Shared tsconfig (packages/tsconfig)
[ ] Shared eslint-config (packages/eslint-config)
[ ] .gitignore + .nvmrc (Node version)
[ ] pnpm-lock.yaml committed
```

### 0.2 Shared Packages

```
[ ] packages/types — setup + cấu trúc src/ (types/, schemas/, endpoints.ts, index.ts)
[ ] packages/ui — setup + headless hooks base
[ ] packages/ui-form — TextInputField, SelectOptionField, TextAreaField
[ ] packages/ui-dialog — FormDialog, ConfirmDialog
[ ] packages/ui-avatar — Avatar component
[ ] packages/ui-file-upload — FileUploadField, AvatarUpload
[ ] packages/ui-theme — ThemeProvider, colors
```

### 0.3 Backend Foundation

```
[ ] NestJS app setup (apps/api)
[ ] PrismaService singleton
[ ] ConfigModule với validation schema
[ ] GlobalExceptionFilter (maps exceptions → API error format)
[ ] ResponseTransformInterceptor (auto-wrap { data: ... })
[ ] LoggingInterceptor + TraceIdInterceptor
[ ] TenantContextInterceptor (AsyncLocalStorage)
[ ] ValidationPipe global (whitelist: true, forbidNonWhitelisted: true)
[ ] Helmet middleware
[ ] CORS configuration
[ ] Throttler (rate limiting)
[ ] Swagger setup (auto-generated tại /docs)
[ ] Health check endpoint
```

### 0.4 Auth & RBAC

```
[ ] JWT Strategy (Passport)
[ ] JwtAuthGuard + PermissionsGuard
[ ] @CurrentTenant(), @CurrentUser(), @Permissions(), @Public() decorators
[ ] Auth module: register, login, logout, refresh (HttpOnly cookie)
[ ] Email verification flow
[ ] Forgot/reset password flow
[ ] Invite/accept-invite flow
[ ] AuthRole + AuthPermission + AuthRolePermission tables
[ ] 4 roles seeded: EMPLOYEE, OPS_COORDINATOR, TECHNICIAN, TENANT_ADMIN
[ ] Permission seeds cho từng role
```

### 0.5 Frontend Foundation

```
[ ] Next.js app setup (apps/web) với App Router
[ ] AuthContext + useAuth hook
[ ] apiClient.ts (browser) + serverApiClient.ts (server)
[ ] next-intl setup (EN + VI messages files)
[ ] ThemeProvider từ @supportops/ui-theme
[ ] Route guards (auth redirect)
[ ] Loading + Error route boundaries (loading.tsx, error.tsx)
[ ] Layout: sidebar, header, navigation
```

### 0.6 Infrastructure & CI/CD

```
[ ] Docker setup: apps/api, apps/web, apps/portfolio
[ ] docker-compose.dev.yml (local dev)
[ ] docker-compose.prod.yml (production)
[ ] Nginx config + SSL (Let's Encrypt)
[ ] GitHub Actions: ci-pr.yml (lint + typecheck + test + build)
[ ] GitHub Actions: cd-staging.yml
[ ] GitHub Actions: cd-production.yml
[ ] GitHub Actions: security-scan.yml (CodeQL + Gitleaks + pnpm audit)
[ ] GitHub Secrets configured
```

### 0.7 Agent System Setup

```
[ ] AGENTS.md (root) — architectural law, module map, conventions
[ ] apps/web/AGENTS.md — FE architecture, component rules, UI library checklist
[ ] apps/api/AGENTS.md — BE conventions, controller pattern, exceptions
[ ] packages/types/AGENTS.md — contract rules
[ ] packages/ui/AGENTS.md — package boundary rules
[ ] docs/standards/TYPESCRIPT_STANDARDS.md
[ ] docs/standards/FRONTEND_STANDARDS.md
[ ] docs/standards/BACKEND_STANDARDS.md
[ ] docs/standards/TESTING_STANDARDS.md
[ ] docs/AGENT_PROMPT.md — prompts cho 4 agents
[ ] docs/AGENT_TASKS.md — domain map + roadmap
[ ] docs/requirements/_TEMPLATE.md — template cho REQ files
[ ] docs/designs/_TEMPLATE.md — template cho DESIGN files
[ ] docs/product-overview.md — business context
[ ] docs/auth-and-roles.md — RBAC documentation
```

---

## PHASE 1 — Feature Development (Lặp lại cho mỗi feature)

### Step 1.1 — PO: Viết Brief

```
[ ] Brief viết rõ: vấn đề gì, ai dùng, kết quả mong muốn
[ ] Brief không quá 1 trang — BA sẽ expand
[ ] Brief có mention scope giới hạn nếu có
```

### Step 1.2 — Agent 1 (BA): Phân tích Requirement

```
[ ] BA đọc: AGENT_TASKS.md + product-overview.md + auth-and-roles.md + AGENTS.md
[ ] BA tạo docs/requirements/REQ-XXXXX.md
[ ] REQ có: functional requirements, acceptance criteria, IN/OUT SCOPE, module impact, open questions, risks
[ ] BA tóm tắt cho PO: BLOCKER questions, module ảnh hưởng, scope hợp lý?
```

### Step 1.3 — PO: Review REQ

```
[ ] Acceptance criteria đủ rõ không?
[ ] Scope có hợp lý không?
[ ] Trả lời BLOCKER questions nếu có
[ ] Approve hoặc yêu cầu chỉnh
```

### Step 1.4 — Agent 2 (Tech Lead): Design

```
[ ] Tech Lead đọc: REQ + AGENTS.md (root + web + api) + standards/ + schema.prisma + packages/types/
[ ] Tech Lead tạo docs/designs/DESIGN-XXXXX.md
[ ] DESIGN có: API contracts, RBAC, DB changes, types contract, component tree, implementation order, testing plan, risks
[ ] Tech Lead kiểm tra tất cả constraints bắt buộc (xem AGENT_PROMPT.md §Agent 2)
[ ] Tech Lead tóm tắt cho PO: implementation order, dependencies, risks cần quyết định
```

### Step 1.5 — PO: Review DESIGN

```
[ ] API contracts hợp lý?
[ ] Component tree không quá phức tạp?
[ ] Implementation order rõ ràng?
[ ] Approve hoặc yêu cầu chỉnh
```

### Step 1.6 — Agent 3 (Developer): Implement

```
[ ] Developer đọc: DESIGN + REQ + AGENTS.md (root + web + api) + standards/
[ ] Developer báo PO: implementation order + ambiguities

Mỗi step trong implementation order:
[ ] Implement step N
[ ] pnpm typecheck — 0 errors
[ ] pnpm lint — 0 errors
[ ] Chạy test nếu có thay đổi
[ ] Báo PO: step xong, kết quả checks, step tiếp theo

Sau khi toàn bộ xong:
[ ] Tất cả component mới có .test.tsx
[ ] Tất cả service methods mới có .spec.ts
[ ] Không có file vượt size limit
[ ] Không có TODO/FIXME chưa giải quyết
[ ] docs/AGENT_TASKS.md đã cập nhật
```

### Step 1.7 — Agent 4 (Reviewer): Code Review

```
[ ] Reviewer đọc: DESIGN + REQ + AGENTS.md (root + web + api) + standards/
[ ] Reviewer review tất cả file thay đổi
[ ] Reviewer tạo review report với PASS/FAIL

Nếu FAIL:
[ ] Developer nhận list violations
[ ] Developer fix từng violation
[ ] Developer chạy lại typecheck + lint + test
[ ] Reviewer review lại → PASS
```

### Step 1.8 — PO: Final Sign-off

```
[ ] Review report PASS
[ ] Acceptance criteria đã được verify
[ ] Build pass (pnpm build)
[ ] Approve merge
```

### Step 1.9 — Deploy

```
[ ] Merge vào develop/main
[ ] CI pipeline pass
[ ] Deploy to staging
[ ] Smoke test trên staging
[ ] Deploy to production (nếu ready)
[ ] Monitor logs + error alerts
```

---

## Quality Gates — Không được skip

| Gate | Lệnh | Khi nào |
|---|---|---|
| Typecheck | `pnpm typecheck` | Sau mỗi implementation step |
| Lint | `pnpm lint` | Sau mỗi implementation step |
| Test FE | `pnpm --filter @supportops/web test` | Khi có FE changes |
| Test BE | `pnpm --filter @supportops/api test` | Khi có BE changes |
| Build UI | `pnpm --filter @supportops/ui build` | Khi có packages/ui changes |
| Build check | `pnpm build` | Trước khi merge |
| Security scan | GitHub Actions (tự động) | Mỗi PR |

---

## Forbidden Actions — Không được vi phạm bao giờ

```
❌ Sửa legacy modules (billing, invoice, kanban, message, product, subscription)
❌ Thêm npm dependency mới không có trong DESIGN
❌ Tạo Prisma migration không có trong DESIGN
❌ Implement khi chưa có REQ + DESIGN được approve
❌ Merge khi CI fail
❌ Deploy production khi staging chưa pass
❌ Sửa AGENTS.md hoặc standards/ mà không có PO review
❌ Bỏ qua Agent 4 Reviewer step
```

---

## Standards Version

| File | Version | Cập nhật lần cuối |
|---|---|---|
| TYPESCRIPT_STANDARDS.md | 1.0 | 2026-03-28 |
| FRONTEND_STANDARDS.md | 1.0 | 2026-03-28 |
| BACKEND_STANDARDS.md | 1.0 | 2026-03-28 |
| TESTING_STANDARDS.md | 1.0 | 2026-03-28 |
| AGENT_PROMPT.md | 2.0 | 2026-03-28 |

> Khi update standards: bump version, ghi lý do thay đổi, thông báo cho tất cả agents đọc lại.
