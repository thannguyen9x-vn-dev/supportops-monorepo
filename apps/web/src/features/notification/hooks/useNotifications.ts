"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import type { NotificationItem } from "@supportops/types";

import { notificationService } from "../services/notification.service";

export type NotificationFilter = "all" | "unread";

export function useNotifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const query = useQuery({
    queryKey: ["notifications", { page, filter }],
    queryFn: () => notificationService.list({ page, size: 20, unread: filter === "unread" }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notification-unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notification-unread-count"] });
    },
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const meta = query.data?.meta;
  const hasMore = Boolean(meta && meta.page < meta.totalPages);

  const unreadCountInList = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const loadMore = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const markRead = useCallback(
    async (id: string) => {
      await markReadMutation.mutateAsync(id);
    },
    [markReadMutation],
  );

  const markAllRead = useCallback(async () => {
    await markAllReadMutation.mutateAsync();
  }, [markAllReadMutation]);

  return {
    filter,
    setFilter,
    items,
    hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    unreadCountInList,
    loadMore,
    resetPage,
    markRead,
    markAllRead,
    isSaving: markReadMutation.isPending || markAllReadMutation.isPending,
  };
}

export function getNotificationHref(item: NotificationItem): string | null {
  if (!item.requestId) {
    return null;
  }

  return `/requests/${item.requestId}`;
}
