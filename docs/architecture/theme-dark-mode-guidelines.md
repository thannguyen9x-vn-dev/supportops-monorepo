# Theme Dark Mode Guidelines

## Scope
- Frontend runtime theme is controlled by MUI color schemes (`light` and `dark`) in `packages/ui/theme`.
- App-level styles should consume MUI CSS variables (`--mui-*`) or MUI semantic tokens (`text.primary`, `background.paper`, etc.).

## Source of Truth
- Theme setup:
  - `packages/ui/theme/src/createAppTheme.ts`
  - `packages/ui/theme/src/utils/paletteUtil.ts`
- Provider + mode handling:
  - `packages/ui/theme/src/ThemeProvider.tsx`
  - `apps/web/src/app/layout.tsx` (with `InitColorSchemeScript`)

## Rules
- Do not use raw hex colors in app UI unless there is a hard requirement.
- Prefer semantic tokens:
  - Text: `text.primary`, `text.secondary`
  - Surfaces: `background.default`, `background.paper`
  - Borders: `divider`
  - States: `action.hover`, `action.selected`, `action.disabledBackground`
- For mode-specific overrides, prefer `theme.applyStyles("dark", { ... })` in theme/component overrides.
- In CSS Modules, prefer:
  - `var(--mui-palette-text-primary)`
  - `var(--mui-palette-background-paper)`
  - `var(--mui-palette-divider)`
  - `rgba(var(--mui-palette-primary-mainChannel) / <alpha>)` when tinting.

## Accessibility
- Maintain sufficient contrast for text and chip/badge foregrounds in both modes.
- Keep icon and placeholder colors on semantic secondary tokens, not fixed greys.

## PWA Manifest Note
- `apps/web/src/app/manifest.ts` supports one `background_color` and one `theme_color` only.
- These values are static and cannot switch per light/dark mode.
