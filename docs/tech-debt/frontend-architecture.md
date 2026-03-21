# Frontend Architecture Backlog

This document stores architecture decisions and deferred improvements for the frontend.
Use it as a source of truth before creating implementation tasks.

## How To Use

1. Before starting a feature, check `Trigger Rules`.
2. If a trigger matches, create/update an issue from the relevant backlog item.
3. In PR, reference the item ID (for example: `FA-01`).
4. Mark item status when done.

## Status Legend

- `todo`: not started
- `planned`: approved and scheduled
- `in_progress`: currently implementing
- `done`: completed and verified

## Trigger Rules (Quick)

- If refresh token is readable by JS (`localStorage`/non-HttpOnly cookie): apply `FA-01`.
- If route bundle becomes heavy or includes large UI libs/charts/editors: apply `FA-02`.
- If list size can exceed ~1000 rows/items: apply `FA-03`.
- If route is public and mostly static: apply `FA-04` (SSG).
- If private/admin route has heavy initial data: apply `FA-04` (SSR prefetch/hydration).

---

## FA-01: Auth Token Hardening (HttpOnly Refresh Cookie)

- Status: `planned`
- Priority: `P0`
- Area: Security / Auth

### Current State

- `accessToken` stored in `sessionStorage`.
- Legacy refresh token handling existed in JS storage/cookie path.
- FE is moving toward cookie-based refresh flow.

### Risk

- Any JS-readable refresh token increases XSS blast radius.

### Target

- Refresh token only in HttpOnly cookie (`supportops_refresh_token`).
- FE never reads refresh token directly.
- API calls use `credentials: "include"`.

### Apply When

- Login/register/refresh/logout flow changes.
- Middleware/session behavior changes.

### Definition Of Done

- Login response does not require `refreshToken` in FE contract.
- `/auth/refresh` works with cookie-only request.
- CORS allows credentials with strict allowed origins.
- FE typecheck and auth integration tests pass.

---

## FA-02: Bundle Optimization (MUI/TanStack/RHF/Zod)

- Status: `todo`
- Priority: `P1`
- Area: Performance

### Current State

- `next.config.ts` not fully optimized for package imports and heavy component splitting.

### Risk

- Slower initial load and poorer UX on low-end devices.

### Target

- Prefer `optimizePackageImports` (Next 16).
- Use dynamic imports for heavy components only (tables/charts/editor).
- Keep route-level JS lean.

### Apply When

- New heavy dependency is added.
- Admin routes grow significantly.

### Definition Of Done

- `next.config.ts` includes validated import optimization.
- Heavy components are dynamically loaded with proper loading states.
- No unnecessary dynamic import on small/common components.

---

## FA-03: Virtual List For Large Datasets

- Status: `todo`
- Priority: `P1`
- Area: Performance / UX

### Current State

- Virtual list primitives exist in `packages/ui`.
- Not broadly applied yet in feature screens.

### Risk

- Rendering very large lists can cause scroll jank and long render times.

### Target

- Apply virtualization to high-volume lists (inbox/messages/activity).
- Keep pagination-only views unchanged unless needed.

### Apply When

- Expected list size can exceed ~1000 items.
- Infinite scroll or chat-like UI is used.

### Definition Of Done

- Affected screen uses `VirtualList`/`InfiniteVirtualList`.
- Empty/loading/error states are preserved.
- Scrolling remains smooth under high item count.

---

## FA-04: Rendering Strategy (CSR/SSR/SSG)

- Status: `todo`
- Priority: `P2`
- Area: Performance / Architecture

### Current State

- Most pages are client-rendered.

### Risk

- Missed optimization for static public pages.
- Slower first load for heavy server-fetchable admin dashboards.

### Target

- Public static pages: SSG/revalidate where suitable.
- Private interactive pages: CSR by default.
- Data-heavy admin summary pages: SSR prefetch + hydration selectively.

### Apply When

- Building public marketing pages.
- Dashboard pages with expensive initial data.

### Definition Of Done

- Route strategy documented in code comments.
- Data-fetch pattern matches route needs (no over-engineering).
- No auth/session regressions after rendering mode changes.

---

## FA-05: GraphQL Incremental Adoption

- Status: `in_progress`
- Priority: `P1`
- Area: Data Layer

### Current State

- REST remains the primary integration path.
- GraphQL pilot added for settings query (`meSettings`) with typed documents via codegen in `apps/web`.

### Target

- Keep REST and GraphQL side-by-side during migration.
- Use `.graphql` documents + codegen-generated typed documents for all new GraphQL operations.
- Avoid string-based GraphQL queries in feature services.

### Apply When

- Screen needs aggregated/complex reads across domains.
- Backend exposes a stable GraphQL query for that use case.

### Definition Of Done

- Operation exists in `src/graphql/documents/**`.
- `pnpm --filter web run codegen` generates/updates typed docs successfully.
- Service/hook consumes typed document from `src/graphql/generated.ts`.

---

## PR Checklist (Copy/Paste)

Use this in PR description when relevant:

- [ ] Checked token handling against `FA-01` (no JS-readable refresh token).
- [ ] Considered bundle impact (`FA-02`) and dynamic imported heavy parts only.
- [ ] Considered virtualization (`FA-03`) for large list surfaces.
- [ ] Chosen rendering strategy (`FA-04`) with clear reason.

## Issue Template (Short)

- Item: `FA-xx`
- Scope:
- Current behavior:
- Proposed change:
- Rollout/risk:
- Verification:
