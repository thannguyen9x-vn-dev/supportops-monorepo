# AGENTS.md — Frontend (apps/web)

## Tech Stack
- Next.js 15+ (App Router) — SSR / SSG / Hybrid Rendering
- TypeScript 5.7+ (strict mode)
- MUI-based design system (`packages/ui`)
- next-intl for i18n (EN + VI)
- Zod for form validation
- React Hook Form
- TanStack Table v8 (complex table with inline editing)
- pnpm workspace

## Testing Stack
- Unit / Component: Jest + React Testing Library
- E2E / Integration: Playwright
- API Mocking: MSW for both Jest and Playwright

## Architecture — Layer Diagram

```text
┌────────────────────────────────────────────────────────────┐
│  app/[locale]/               (Route Layer)                 │
│  ├── page.tsx                Server Component (default)    │
│  ├── loading.tsx             Streaming / Suspense          │
│  ├── error.tsx               Error Boundary                │
│  └── layout.tsx              Shared Layout                 │
├────────────────────────────────────────────────────────────┤
│  features/*/components/      (UI Components)               │
│  ├── ServerComponent.tsx     RSC — data fetch at server    │
│  └── ClientComponent.tsx     'use client' — interactivity  │
├────────────────────────────────────────────────────────────┤
│  features/*/hooks/           (Client Hooks)                │
│  └── use[Feature].ts         state / mutations             │
├────────────────────────────────────────────────────────────┤
│  features/*/services/        (API Services)                │
│  ├── [module].service.ts     Client-side (browser fetch)   │
│  └── [module].server.ts      Server-side (server fetch)    │
├────────────────────────────────────────────────────────────┤
│  features/*/tables/          (Table Definitions)           │
│  ├── columns.tsx             TanStack column defs          │
│  ├── cells/                  Custom cell renderers         │
│  └── filters/                Table filter components       │
├────────────────────────────────────────────────────────────┤
│  lib/api/                                                  │
│  ├── apiClient.ts            Browser HTTP client           │
│  └── serverApiClient.ts      Server HTTP client (RSC)      │
├────────────────────────────────────────────────────────────┤
│  @supportops/types       (Shared Types + Schemas)      │
└────────────────────────────────────────────────────────────┘
```

Data flow: `Page -> Component -> Hook -> Service -> apiClient/serverApiClient -> Backend`

## Rendering Strategy Guide

### SSG
Use for public pages with infrequent data updates.
- Example: pricing, plans, login/register shell
- Use `export const revalidate = ...` + `generateStaticParams`

### SSR
Use for user-specific or sensitive data.
- Example: dashboard, settings, billing, invoices
- Use `export const dynamic = 'force-dynamic'`

### Hybrid (SSR shell + client interactivity)
Use when initial data must be server-rendered but interactions are rich on client.
- Example: products table with search/filter/edit modal
- Pattern: server loader fetches initial payload -> pass to client shell -> URL-driven transitions (`router.push` / `router.refresh`)

## Server vs Client Services

### `*.server.ts`
- Runs only on server components / route handlers
- Uses `serverApiClient`
- Can read forwarded headers/cookies

### `*.service.ts`
- Runs in browser
- Uses `apiClient`
- Handles in-memory token flow via existing auth utilities

## Route Conventions
Each route folder should include:
- `page.tsx`: main server component
- `loading.tsx`: fallback for route-level suspense
- `error.tsx`: client error boundary
- `not-found.tsx`: 404 state

## Complex Table Convention (TanStack v8)

```text
features/[module]/tables/
├── [Module]DataTable.tsx
├── columns.tsx
├── cells/
├── filters/
├── toolbar/
└── hooks/
```

Required capabilities:
- Server pagination + URL sync
- Column sorting/filtering
- Row selection + bulk actions
- Inline edit with pending-change buffer
- Save all / discard all flows

## Testing Architecture

```text
apps/web/
├── __tests__/
│   ├── setup/
│   ├── mocks/
│   └── helpers/
├── e2e/
├── jest.config.ts
└── playwright.config.ts
```

- Jest for unit/component tests
- Playwright for e2e
- MSW as shared API mocking layer

## Key Rules
- Default to Server Component. Add `'use client'` only when needed.
- Never hardcode backend URL. Use env + API clients.
- Types and endpoints must come from `@supportops/types`.
- UI text must go through `next-intl` messages.
- Keep page files thin; move logic to features/services/hooks.
- Do not import `apiClient` directly inside components.
- No `any`.
