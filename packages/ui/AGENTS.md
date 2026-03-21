# AGENTS.md — Shared UI Package (`packages/ui`)

## Purpose
`@supportops/ui` is the reusable UI library for SupportOps.

- Scope: shared headless hooks + shared styled components.
- Out of scope: feature/business logic, API calls, domain services.
- Consumption: imported by `apps/web` and future apps.

## Architecture
`packages/ui` follows a layered model:

1. `src/headless/*`: UI-agnostic hooks (state/logic/a11y only).
2. `src/components/*`: styled components consuming headless hooks.
3. Feature composition lives outside this package (`apps/web/src/features/*`).

Dependency direction must stay one-way:
`features -> components -> headless`.

## Package Boundaries
- Do not import from `apps/web/*` or backend packages.
- Do not import business contracts in shared UI unless explicitly requested.
- Keep APIs generic and reusable across modules.

## Coding Rules
- Use strict TypeScript, avoid `any`.
- Export public APIs through `src/index.ts`.
- Also export at nearest barrel (`headless/index.ts`, `components/index.ts`).
- Keep files small and composable.
- Prefer semantic HTML and proper keyboard support.
- Add ARIA attributes for interactive controls.

## Headless Hook Rules
- No JSX rendering in headless hooks.
- No CSS/styling concerns in headless hooks.
- Return stable handlers when practical (`useCallback`).
- Provide typed options/return interfaces in `types.ts`.

## Styled Component Rules
- Accept all UI text/config via props.
- Handle error/loading/empty/disabled states.
- Keep implementation presentation-focused.
- Avoid implicit coupling to one feature/module.

## Form Field Convention
For `src/components/form/fields/*`:
- Props include `name`, optional `form`, and UI options.
- Bind using `useFormField` from headless layer.
- Forward accessibility attributes (`aria-invalid`, `aria-describedby`).
- Surface validation errors consistently.

## Virtual List Convention
For `src/components/virtual-list/*`:
- Use headless virtual hooks.
- Require explicit container `height`.
- Expose `renderItem` render-prop API.
- Support empty state and loading state when relevant.

## Export Convention
When adding a hook/component:
1. Export from its local folder index.
2. Export from `src/headless/index.ts` or `src/components/index.ts`.
3. Export from `src/index.ts` if it is public.

## Safety Checks Before Finish
- `pnpm --filter @supportops/ui typecheck`
- Ensure no accidental imports from app-level code.
- Ensure generated `dist/` is not manually edited.
