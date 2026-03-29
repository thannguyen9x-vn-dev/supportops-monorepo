"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useNotificationSSE } from "./useNotificationSSE";
import { notificationService } from "../services/notification.service";

export function useNotificationCount() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: () => notificationService.unreadCount(),
  });

  useNotificationSSE({
    onCount: (nextCount) => {
      queryClient.setQueryData(["notification-unread-count"], { count: nextCount });
    },
    onCreated: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return data?.count ?? 0;
}
