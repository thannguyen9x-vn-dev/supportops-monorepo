"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";

import { toUserPreferences } from "../settings.mapper";
import type { NotificationItemKey, NotificationPreference } from "../settings.types";
import { getErrorMessage } from "../utils/getErrorMessage";

type UseNotificationPreferencesOptions = {
  t: (key: string) => string;
};

export function useNotificationPreferences({ t }: UseNotificationPreferencesOptions) {
  const toast = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);

  const toggle = useCallback(
    (key: NotificationItemKey, checked: boolean) => {
      let previousEnabled: boolean | undefined;

      setPreferences((current) => {
        const updatedPreferences = current.map((item) =>
          item.key === key
            ? ((previousEnabled = item.enabled), { ...item, enabled: checked })
            : item
        );

        void settingsService.updatePreferences(toUserPreferences(updatedPreferences)).catch((error) => {
          const rollbackEnabled = previousEnabled;
          if (rollbackEnabled === undefined) {
            return;
          }

          setPreferences((prev) =>
            prev.map((item) => (item.key === key ? { ...item, enabled: rollbackEnabled } : item))
          );
          toast.error(getErrorMessage(error, t("state.saveError")));
        });

        return updatedPreferences;
      });
    },
    [t, toast],
  );

  return { preferences, setPreferences, toggle };
}
