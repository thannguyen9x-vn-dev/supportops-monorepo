## File Upload Package Standards (`@supportops/ui-file-upload`)

Apply these rules for all files under `packages/ui/file-upload`.

## Scope and boundaries

- This package is reusable UI + hook logic for file upload.
- Do NOT import from `apps/web/*`.
- Allowed imports:
  - React / MUI
  - `@supportops/ui-avatar`
  - local `./*` modules

## Public API

- Export package API only via `src/index.ts`.
- Keep exports explicit and stable.
- When adding a new hook/component/type, update `src/index.ts` in the same change.

## File structure

Keep files split by concern:

- `useFileUpload.ts` + `useFileUpload.types.ts`: upload state machine, validation, progress, callbacks.
- `useImageCrop.ts`: crop state + crop blob utility.
- `ImageCropDialog.tsx`: crop UI (MUI Dialog).
- `AvatarUpload.tsx`: avatar-specific composition.
- `FileUpload.tsx`: generic upload surface (drop/select/list).
- `fileUpload.constants.ts`: limits, presets, default rules.

## Upload behavior conventions

- `uploadFn` is injected from consumer when real API is needed.
- If no `uploadFn` is provided, fallback to mock upload behavior.
- Always expose progress updates via `onProgress`.
- Throw `Error` from upload flow for consumer-level error handling.
- Avoid embedding app-specific toast/i18n logic in generic hooks.

## Validation conventions

Default limits:

- Video: `50MB`
- Non-video files: `2MB`

Rules:

- Keep validation centralized in `fileUpload.constants.ts` or `useFileUpload.ts`.
- Use deterministic error reasons/messages.
- Prefer MIME-based checks first, then size checks.

## Cropping conventions

- `AvatarUpload` supports `cropOnSelect` (default `true`).
- If crop is enabled, upload should wait for cropped result.
- Revoke object URLs when replaced/removed/unmounted.

## TypeScript conventions

- Strict typing only. No `any`.
- Exported functions/types should have explicit signatures.
- Use `type` for unions/status and function signatures.

## Accessibility and UX

- Interactive elements must have accessible names.
- Keep keyboard interaction for file picker trigger.
- Keep loading/progress states observable and predictable.

## Build and release hygiene

- Do not edit `dist/*` manually.
- Run package checks after source changes:
  - `pnpm --filter @supportops/ui-file-upload typecheck`
  - `pnpm --filter @supportops/ui-file-upload build`
