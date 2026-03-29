import type {
  ApiResponse,
  ListNotificationsQuery,
  NotificationItem,
  NotificationPreferenceItem,
  NotificationUnreadCount,
  PageMeta,
} from "@supportops/types";
import {
  NOTIFICATION_ENDPOINTS,
  NOTIFICATION_PREFERENCE_ENDPOINTS,
} from "@supportops/types";

import { apiClient } from "@/lib/api";

export interface NotificationListResult {
  items: NotificationItem[];
  meta: PageMeta;
}

export const notificationService = {
  async list(query: ListNotificationsQuery): Promise<NotificationListResult> {
    const response = await apiClient.get<NotificationItem[]>(NOTIFICATION_ENDPOINTS.list, {
      params: {
        page: query.page ?? 1,
        size: query.size ?? 20,
        unread: query.unread,
      },
    });

    return {
      items: response.data,
      meta: response.meta ?? {
        page: query.page ?? 1,
        size: query.size ?? 20,
        total: response.data.length,
        totalPages: 1,
      },
    };
  },

  async markRead(id: string): Promise<NotificationItem> {
    const response = await apiClient.patch<NotificationItem>(NOTIFICATION_ENDPOINTS.markRead(id));
    return response.data;
  },

  async markAllRead(): Promise<number> {
    const response = await apiClient.patch<{ count: number }>(NOTIFICATION_ENDPOINTS.markAllRead);
    return response.data.count;
  },

  async unreadCount(): Promise<NotificationUnreadCount> {
    const response = await apiClient.get<NotificationUnreadCount>(NOTIFICATION_ENDPOINTS.unreadCount);
    return response.data;
  },
};

export const notificationPreferencesService = {
  async get(): Promise<NotificationPreferenceItem[]> {
    const response = await apiClient.get<{ preferences: NotificationPreferenceItem[] }>(
      NOTIFICATION_PREFERENCE_ENDPOINTS.get,
    );
    return response.data.preferences;
  },

  async update(preferences: NotificationPreferenceItem[]): Promise<NotificationPreferenceItem[]> {
    const response = await apiClient.put<{ preferences: NotificationPreferenceItem[] }>(
      NOTIFICATION_PREFERENCE_ENDPOINTS.update,
      { preferences },
    );

    return response.data.preferences;
  },
};

export interface NotificationSsePayload {
  notificationId?: string;
  count?: number;
}

export function buildNotificationSseUrl(baseUrl: string): string {
  return `${baseUrl}${NOTIFICATION_ENDPOINTS.stream}`;
}

export function parseNotificationStreamEvent(raw: string): NotificationSsePayload | null {
  try {
    const payload = JSON.parse(raw) as unknown;
    if (!payload || typeof payload !== "object") {
      return null;
    }
    return payload as NotificationSsePayload;
  } catch {
    return null;
  }
}

export type NotificationEventResponse = ApiResponse<NotificationItem>;
