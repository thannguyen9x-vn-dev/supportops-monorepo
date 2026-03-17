"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { settingsService } from "@/features/settings/services/settings.service";

import type { LoadState, SettingsData } from "../settings.types";
import { toNotificationPreferences, toProfileFormValues } from "../settings.mapper";

type UseSettingsLoaderReturn = {
  data: SettingsData | null;
  loadState: LoadState;
  reload: () => Promise<void>;
  setData: Dispatch<SetStateAction<SettingsData | null>>;
};

export function useSettingsLoader(): UseSettingsLoaderReturn {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<SettingsData | null>(null);

  const reload = useCallback(async () => {
    setLoadState("loading");

    try {
      const preferencesPromise = settingsService.getPreferencesGraphql().catch(() => settingsService.getPreferences());
      const [{ data: profile }, { data: preferences }] = await Promise.all([
        settingsService.getProfile(),
        preferencesPromise
      ]);

      if (!profile) {
        setLoadState("empty");
        setData(null);
        return;
      }

      setData({
        avatarUrl: profile.avatarUrl ?? null,
        profile: toProfileFormValues(profile),
        notifications: toNotificationPreferences(preferences)
      });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void reload();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [reload]);

  return { data, loadState, reload, setData };
}
