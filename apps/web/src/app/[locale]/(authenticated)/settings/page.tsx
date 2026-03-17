"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button, CircularProgress } from "@mui/material";

import { NotificationSettingsCard } from "./components/NotificationSettingsCard";
import { PasswordForm } from "./components/PasswordForm";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileForm } from "./components/ProfileForm";
import { useNotificationPreferences } from "./hooks/useNotificationPreferences";
import { usePasswordForm } from "./hooks/usePasswordForm";
import { useProfileForm } from "./hooks/useProfileForm";
import { useSettingsLoader } from "./hooks/useSettingsLoader";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const t = useTranslations("pages.settings");

  const settings = useSettingsLoader();
  const notifications = useNotificationPreferences({ t });

  const profile = useProfileForm({
    onSaved: (values) => {
      settings.setData((prev) =>
        prev
          ? {
              ...prev,
              profile: values,
            }
          : prev,
      );
    },
    t,
  });

  const password = usePasswordForm({ t });
  const { data: settingsData } = settings;
  const { reset: resetProfileForm } = profile;
  const { setPreferences } = notifications;

  useEffect(() => {
    if (!settingsData) {
      return;
    }

    resetProfileForm(settingsData.profile);
    setPreferences(settingsData.notifications);
  }, [resetProfileForm, setPreferences, settingsData]);

  const groupedNotifications = useMemo(
    () => ({
      alerts: notifications.preferences.filter((item) => item.group === "alerts"),
      email: notifications.preferences.filter((item) => item.group === "email"),
    }),
    [notifications.preferences],
  );

  if (settings.loadState === "loading") {
    return (
      <div className={styles.centeredState}>
        <CircularProgress size={28} />
        <p>{t("state.loading")}</p>
      </div>
    );
  }

  if (settings.loadState === "error") {
    return (
      <div className={styles.centeredState}>
        <Alert severity="error">{t("state.error")}</Alert>
        <Button onClick={() => void settings.reload()} size="medium" variant="contained">
          {t("action.retry")}
        </Button>
      </div>
    );
  }

  if (settings.loadState === "empty" || !settings.data) {
    return (
      <div className={styles.centeredState}>
        <Alert severity="info">{t("state.empty")}</Alert>
        <Button onClick={() => void settings.reload()} size="medium" variant="outlined">
          {t("action.reload")}
        </Button>
      </div>
    );
  }

  const data = settings.data;

  return (
    <div className={styles.page}>
      <div className={styles.leftColumn}>
        <ProfileCard
          avatarUrl={data.avatarUrl}
          firstName={data.profile.firstName}
          lastName={data.profile.lastName}
          onAvatarUpdated={(nextAvatarUrl) => {
            settings.setData((prev) =>
              prev
                ? {
                    ...prev,
                    avatarUrl: nextAvatarUrl,
                  }
                : prev,
            );
          }}
        />

        <NotificationSettingsCard
          description={t("notifications.alertsDescription")}
          items={groupedNotifications.alerts}
          onToggle={notifications.toggle}
          title={t("notifications.alertsTitle")}
        />
        <NotificationSettingsCard
          description={t("notifications.emailDescription")}
          items={groupedNotifications.email}
          onToggle={notifications.toggle}
          title={t("notifications.emailTitle")}
        />
      </div>

      <div className={styles.rightColumn}>
        <ProfileForm
          control={profile.control}
          handleSubmit={profile.handleSubmit}
          onSubmit={profile.onSubmit}
          submitState={profile.submitState}
        />

        <PasswordForm
          control={password.control}
          handleSubmit={password.handleSubmit}
          onSubmit={password.onSubmit}
          submitState={password.submitState}
        />
      </div>
    </div>
  );
}
