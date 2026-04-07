"use client";

import { useEffect } from "react";

import { env } from "@/lib/config/env";

import {
  buildNotificationSseUrl,
  parseNotificationStreamEvent,
} from "../services/notification.service";

interface UseNotificationSSEOptions {
  onCount?: (count: number) => void;
  onCreated?: (notificationId: string) => void;
}

export function useNotificationSSE({ onCount, onCreated }: UseNotificationSSEOptions) {
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      eventSource = new EventSource(buildNotificationSseUrl(env.NEXT_PUBLIC_API_BASE_URL), {
        withCredentials: true,
      });

      eventSource.addEventListener("notification.unread_count", (event) => {
        const parsed = parseNotificationStreamEvent((event as MessageEvent).data);
        if (typeof parsed?.count === "number") {
          onCount?.(parsed.count);
        }
      });

      eventSource.addEventListener("notification.created", (event) => {
        const parsed = parseNotificationStreamEvent((event as MessageEvent).data);
        if (parsed?.notificationId) {
          onCreated?.(parsed.notificationId);
        }
      });

      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;

        if (retryTimer) {
          clearTimeout(retryTimer);
        }

        retryTimer = setTimeout(connect, 5_000);
      };
    };

    connect();

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      eventSource?.close();
    };
  }, [onCount, onCreated]);
}
