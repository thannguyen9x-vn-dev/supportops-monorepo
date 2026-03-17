## Settings Feature Standards

Apply these rules for all files in this folder.

## Folder Structure

Keep this structure:

```
settings/
  page.tsx
  settings.types.ts
  settings.mock.ts
  settings.module.css
  components/
    ProfileCard.tsx
    ProfileForm.tsx
    PasswordForm.tsx
    NotificationSettingsCard.tsx
  hooks/
    useSettingsLoader.ts
    useProfileForm.ts
    usePasswordForm.ts
    useNotificationPreferences.ts
```

## Responsibilities

- `page.tsx`: compose state + layout only.
- `settings.types.ts`: all local types.
- `settings.mock.ts`: mock data and mock async actions.
- `components/*`: presentational/section UI.
- `hooks/*`: each hook handles one concern.

## State and async patterns

- Keep optimistic updates in hooks (not page).
- For notification toggles, avoid stale closure issues in async rollback.
- Route/API side-effects should surface user feedback via toast.

## i18n and a11y

- Use `useTranslations("pages.settings")` in components/hooks where needed.
- Keep all user-facing strings in i18n JSON files.
- Interactive controls must keep accessible labels.

## Avatar upload behavior

- `ProfileCard` owns avatar upload integration with `/api/upload/avatar`.
- Map upload failures to translated toast messages.
