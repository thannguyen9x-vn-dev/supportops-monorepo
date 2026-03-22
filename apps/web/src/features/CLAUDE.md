# Feature Architecture Guide

Applies to **all features** under `apps/web/src/features/`. Read this before writing any feature code.
For task ownership, DoD, and sprint context → read `docs/agent-task-sheet.md`.

---

## Standard Directory Structure

Every feature follows this layout:

```
<feature-name>/
├── components/
│   ├── *View.tsx          # Top-level page views ("use client", orchestrator only)
│   ├── *Card.tsx          # Detail page section cards (presentational)
│   ├── *Dialog.tsx        # Modal dialogs
│   ├── *Panel.tsx         # Collapsible/tab panels
│   ├── *.module.css       # Scoped CSS modules
│   └── <sub-domain>/      # Group related sub-components into named subfolders
├── hooks/
│   └── use*.ts            # Data fetching + state management
├── services/
│   └── *.service.ts       # API calls only — no UI logic, no state
├── utils/
│   ├── *Actions.ts        # Available actions per role/status
│   ├── *Access.ts         # RBAC and section visibility logic
│   └── formatters.ts      # Pure data formatting helpers
└── types.ts               # All type definitions for this feature
```

---

## Adding a New Feature — Follow This Order

1. **Types first** — define interfaces, union types, constant label maps in `types.ts`
2. **Service** — add API methods in `*.service.ts`
3. **RBAC** — add visibility/access logic in `*Access.ts` if role-gated
4. **Actions** — add available action logic in `*Actions.ts` if applicable
5. **i18n** — add keys to `en.json` and `vi.json` before using `t()`
6. **Hook** — add state, data fetching, and mutation handlers
7. **Components** — create Card/Panel/Dialog as presentational components
8. **Screen** — wire everything up, pass props down

---

## Types (`types.ts`)

```ts
// Union types for enums
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";

// Interfaces for data structures
export interface FeatureDetail { id: string; status: Status; ... }

// Constant maps for labels (used with i18n keys)
export const STATUS_LABELS: Record<Status, string> = { ... };
```

- Never define types inline in component props
- All feature-scoped types live here

---

## Service Layer (`*.service.ts`)

```ts
export const featureService = {
  list: (params?) => apiClient.get<ListDto>(ENDPOINTS.feature, { params }),
  detail: (id: string) => apiClient.get<DetailDto>(`${ENDPOINTS.feature}/${id}`, { cache: "no-store" }),
  create: (payload) => apiClient.post(ENDPOINTS.feature, payload),
};
```

- Single exported object with all methods
- `{ cache: "no-store" }` for user-specific or frequently updated data
- No UI logic, no state, no error handling — just typed API calls

---

## Hooks (`hooks/use*.ts`)

```ts
// State shape
const [data, setData] = useState<FeatureDetail | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);
const [loadError, setLoadError] = useState<string | null>(null);
const [mutationError, setMutationError] = useState<string | null>(null);
const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);

// Handlers
const handleAction = useCallback(async () => { ... }, [deps]);
```

- One hook per major screen/view
- Use `executeMutation(runner, successMessage)` for consistent error/success handling
- Use `useMemo` for expensive data transformations
- Handler naming: `handle[ActionName]` (handleAssign, handleSubmit, handleDelete)

---

## Component Patterns

### View (`*View.tsx`) — Orchestrator
```tsx
"use client";
export default function FeatureDetailView() {
  const t = useTranslations("pages.<feature>.<screen>");
  const { data, handleAction } = useFeatureHook();
  return <EntityDetailLayout><FeatureCard data={data} onAction={handleAction} /></EntityDetailLayout>;
}
```
- `"use client"` always
- No business logic — delegate to hooks and utils
- No direct API calls

### Card/Panel — Presentational
- No state, no data fetching
- Use `SectionCard` wrapper for consistent section styling
- Use MUI `Grid` with `size={{ xs: 12, md: 6 }}` for responsive layout
- Use theme Typography variants: `textSmRegular`, `textBase`, `body2`

### Dialog
- Props: `open`, `onClose`, `onSubmit`
- Internal form state only — emit results via callbacks

---

## RBAC (`*Access.ts`)

```ts
export function getSectionVisibility(role: UserRole, data: FeatureDetail): SectionVisibility {
  return {
    showAdminSection: role === "TENANT_ADMIN" || role === "OPS_COORDINATOR",
    ...
  };
}
```

- All role-based visibility logic here — never inline in components

---

## Styling

- CSS Modules for component styles (`.module.css`) — no global CSS
- MUI `sx` prop for one-off overrides
- `alpha(color, opacity)` from MUI for transparent backgrounds

---

## i18n

- All user-facing text via `useTranslations("pages.<feature>.<screen>")`
- Add to both `en.json` and `vi.json` before using
- Constant maps (`STATUS_LABELS`, `ROLE_LABELS`) map domain values to i18n keys

---

## Data Flow

```
Service  →  Hook (fetch + transform + state + handlers)
              →  Screen (layout orchestration)
                   →  Card / Panel / Dialog (display + emit events)
                        →  Hook handlers (mutations + state update)
```

---

## Must NOT Do

- Fetch data inside Card, Panel, or Dialog components
- Put RBAC/access logic inside components
- Hard-code user-facing strings
- Define types inline in component props
- Add Redux/Zustand — use `useState` + custom hooks
