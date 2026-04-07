"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationPreferenceItem } from "@supportops/types";
import { useCallback, useMemo, useState } from "react";

import { useToast } from "@/features/common/toast/useToast";

import { notificationPreferencesService } from "../services/notification.service";

export function useNotificationPreferences(savedMessage: string) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [localDraftPreferences, setLocalDraftPreferences] = useState<NotificationPreferenceItem[] | null>(null);

  const query = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => notificationPreferencesService.get(),
  });

  const preferences = useMemo(
    () => localDraftPreferences ?? query.data ?? [],
    [localDraftPreferences, query.data],
  );

  const mutation = useMutation({
    mutationFn: (nextPreferences: NotificationPreferenceItem[]) =>
      notificationPreferencesService.update(nextPreferences),
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences"], updated);
      setLocalDraftPreferences(updated);
      toast.success(savedMessage);
    },
  });

  const setEventChannel = useCallback(
    (eventType: NotificationPreferenceItem["eventType"], channel: "inApp" | "email", checked: boolean) => {
      setLocalDraftPreferences((current) =>
        (current ?? query.data ?? []).map((item) =>
          item.eventType === eventType
            ? {
                ...item,
                [channel]: checked,
              }
            : item,
        ),
      );
    },
    [query.data],
  );

  const save = useCallback(async () => {
    await mutation.mutateAsync(preferences);
    await queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
  }, [mutation, preferences, queryClient]);

  return {
    preferences,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    setEventChannel,
    save,
  };
}
