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

## UI Component Library — BẮT BUỘC DÙNG TRƯỚC KHI TẠO MỚI

> **RULE:** Trước khi tạo bất kỳ UI component nào, phải kiểm tra danh sách dưới đây. Nếu đã có sẵn → dùng ngay, KHÔNG tạo lại từ đầu.

### Packages sẵn có

| Package | Import từ | Dùng cho |
|---|---|---|
| `@supportops/ui` | `@supportops/ui` | Headless hooks: `useDialog`, `useToast`, `useClipboard` |
| `@supportops/ui-avatar` | `@supportops/ui-avatar` | Avatar với status ring, các size xs→2xl |
| `@supportops/ui-dialog` | `@supportops/ui-dialog` | `FormDialog` cho mọi modal form |
| `@supportops/ui-file-upload` | `@supportops/ui-file-upload` | `FileUploadField`, `AvatarUpload`, `useFileUpload` |
| `@supportops/ui-form` | `@supportops/ui-form` | `TextInputField`, `TextAreaField`, `SelectOptionField`, `SelectDateField`, `PhoneNumberField` |
| `@supportops/ui-theme` | `@supportops/ui-theme` | `ThemeProvider`, `colors` |

### Checklist bắt buộc trước khi tạo component mới

Trước khi viết component UI mới, phải tự hỏi:

- [ ] Cần modal/dialog? → Dùng `FormDialog` từ `@supportops/ui-dialog` + `useDialog` từ `@supportops/ui`
- [ ] Cần hiển thị user avatar? → Dùng `Avatar` từ `@supportops/ui-avatar`
- [ ] Cần form field (text, select, date, phone)? → Dùng các field từ `@supportops/ui-form`
- [ ] Cần upload file? → Dùng `FileUploadField` hoặc `AvatarUpload` từ `@supportops/ui-file-upload`
- [ ] Cần toast notification? → Dùng `useToast` từ `@supportops/ui`
- [ ] Cần confirm action? → Dùng `ConfirmDialog` từ `@supportops/ui`

**Chỉ tạo component mới khi không có gì trong list trên đáp ứng được yêu cầu.**

---

## Component Size & Splitting Rules

### Giới hạn kích thước

| Loại file | Giới hạn | Hành động khi vượt |
|---|---|---|
| `page.tsx` (route) | ≤ 50 lines | Tách toàn bộ logic vào `[Module]View.tsx` |
| View component (`*View.tsx`) | ≤ 150 lines | Tách thành section components |
| Section component | ≤ 100 lines | Tách thành sub-components |
| Hook (`use*.ts`) | ≤ 120 lines | Tách hook con hoặc service |

### Cấu trúc bắt buộc cho trang phức tạp

```text
features/[module]/
├── components/
│   ├── [Module]View.tsx          ← Main container (client), orchestrates sections
│   ├── [Module]Header.tsx        ← Header/title/actions bar
│   ├── [Module]Section.tsx       ← Mỗi section lớn = 1 file riêng
│   └── [SubFeature]/
│       ├── [SubFeature]Panel.tsx
│       └── [SubFeature]Form.tsx
├── hooks/
│   └── use[Module].ts            ← State, data fetching, mutations
└── services/
    └── [module].service.ts
```

### Quy tắc tách component

1. **1 section = 1 file** — Activity Timeline, Comments, Work Log, Metadata sidebar → mỗi phần là file riêng
2. **Không nest quá 3 cấp** trong một file — nếu cần thêm cấp → tách file mới
3. **Props drilling quá 2 cấp** → dùng hook hoặc context thay vì truyền props
4. **Mỗi file chỉ có 1 exported component** — không export nhiều component từ cùng 1 file (trừ barrel `index.ts`)

### Ví dụ đúng — Request Detail page

```text
features/service-ops/requests/components/
├── detail/
│   ├── RequestDetailView.tsx      ← orchestrator, ~80 lines
│   ├── RequestDetailHeader.tsx    ← status badge, actions
│   ├── RequestOverviewPanel.tsx   ← serviceType, location, description
│   ├── RequestMetaSidebar.tsx     ← tags, impact, urgency
│   ├── activity/
│   │   ├── ActivityTimeline.tsx
│   │   └── ActivityItem.tsx
│   ├── comments/
│   │   ├── CommentsPanel.tsx
│   │   └── CommentForm.tsx
│   └── worklog/
│       ├── WorkLogPanel.tsx
│       └── WorkLogForm.tsx
```

---

## Key Rules
- Default to Server Component. Add `'use client'` only when needed.
- Never hardcode backend URL. Use env + API clients.
- Types and endpoints must come from `@supportops/types`.
- UI text must go through `next-intl` messages.
- Keep page files thin; move logic to features/services/hooks.
- Do not import `apiClient` directly inside components.
- No `any`.
- **KHÔNG tạo UI component mới nếu `packages/ui` đã có sẵn.**
- **KHÔNG để file component vượt quá giới hạn kích thước — tách ngay khi chạm ngưỡng.**
