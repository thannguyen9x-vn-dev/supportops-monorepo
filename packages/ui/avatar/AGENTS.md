## Avatar Package Standards (`@supportops/ui-avatar`)

Apply these rules for all files under `packages/ui/avatar`.

## Scope and boundaries

- This package provides reusable avatar primitives.
- Do NOT import from `apps/web/*`.
- Allowed imports:
  - React / MUI
  - local `./*` modules

## Public API

- Export public API only through `src/index.ts`.
- Keep exports explicit (component + types).
- Any new public prop/type must be exported in `src/index.ts`.

## File structure

Keep concern-based split:

- `Avatar.tsx`: UI composition + fallback behavior.
- `Avatar.types.ts`: public prop and token types.
- `Avatar.constants.ts`: size map, initials/color helpers.
- `index.ts`: package exports only.

## Behavior conventions

- Support image source with fallback sequence:
  - image
  - initials (from `name`)
  - default icon
- Support `size` tokens and optional `dimension` override.
- Support shape variants (`circular`, `rounded`, `square`).
- Preserve passthrough styling via `className` and `sx`.

## Styling conventions

- Prefer MUI tokens / CSS variables for colors.
- Avoid hardcoded palette values unless necessary fallback.
- Keep sizing deterministic via token map.

## TypeScript conventions

- Strict typing only. No `any`.
- Exported functions/types should have explicit signatures.
- Keep prop names stable and backward compatible.

## Accessibility conventions

- Ensure meaningful `alt` fallback (`alt ?? name`).
- Do not remove semantic avatar behavior provided by MUI.

## Build and release hygiene

- Do not edit `dist/*` manually.
- Run package checks after source changes:
  - `pnpm --filter @supportops/ui-avatar typecheck`
  - `pnpm --filter @supportops/ui-avatar build`
