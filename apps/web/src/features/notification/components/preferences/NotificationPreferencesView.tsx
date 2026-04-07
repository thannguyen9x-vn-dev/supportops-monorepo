"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { useNotificationPreferences } from "../../hooks/useNotificationPreferences";
import { PreferencesTable } from "./PreferencesTable";

export function NotificationPreferencesView() {
  const t = useTranslations("notificationPreferences");
  const preferences = useNotificationPreferences(t("saved"));

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{t("title")}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t("subtitle")}
        </Typography>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <PreferencesTable
          isLoading={preferences.isLoading}
          isSaving={preferences.isSaving}
          onSave={preferences.save}
          onToggle={preferences.setEventChannel}
          preferences={preferences.preferences}
        />
      </Paper>
    </Stack>
  );
}
