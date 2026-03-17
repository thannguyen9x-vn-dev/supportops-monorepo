"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@mui/material";

import type { NotificationItemKey, NotificationPreference } from "../settings.types";

import styles from "../settings.module.css";

type NotificationSettingsCardProps = {
  description: string;
  items: NotificationPreference[];
  onToggle: (key: NotificationItemKey, checked: boolean) => void;
  title: string;
};

export function NotificationSettingsCard({
  title,
  description,
  items,
  onToggle,
}: NotificationSettingsCardProps) {
  const t = useTranslations("pages.settings");

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <p className={styles.sectionDescription}>{description}</p>

      <div className={styles.preferenceList}>
        {items.map((item) => (
          <div className={styles.preferenceItem} key={item.key}>
            <div className={styles.preferenceContent}>
              <p className={styles.preferenceTitle}>{t(`notifications.items.${item.key}.title`)}</p>
              <p className={styles.preferenceDescription}>{t(`notifications.items.${item.key}.description`)}</p>
            </div>
            <Switch
              checked={item.enabled}
              inputProps={{ "aria-label": t(`notifications.items.${item.key}.title`) }}
              onChange={(event) => {
                onToggle(item.key, event.target.checked);
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
