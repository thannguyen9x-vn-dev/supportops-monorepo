import type { MessageDetail, MessageListItem, SendMessageRequest, StorageUsage } from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const messageService = {
  list: (params?: { page?: number; size?: number; search?: string }) =>
    apiClient.get<MessageListItem[]>(ENDPOINTS.MESSAGES.LIST, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 15,
        search: params?.search
      }
    }),

  getById: (id: string) => apiClient.get<MessageDetail>(ENDPOINTS.MESSAGES.DETAIL(id)),

  send: (data: SendMessageRequest) => apiClient.post<void>(ENDPOINTS.MESSAGES.LIST, data),

  reply: (id: string, body: string) => apiClient.post<void>(ENDPOINTS.MESSAGES.REPLY(id), { body }),

  forward: (id: string, recipientId: string) => apiClient.post<void>(ENDPOINTS.MESSAGES.FORWARD(id), { recipientId }),

  toggleStar: (id: string) => apiClient.put<void>(ENDPOINTS.MESSAGES.STAR(id)),

  markRead: (id: string) => apiClient.put<void>(ENDPOINTS.MESSAGES.READ(id)),

  bulkDelete: (ids: string[]) => apiClient.delete<void>(ENDPOINTS.MESSAGES.LIST, { ids }),

  getStorageUsage: () => apiClient.get<StorageUsage>(ENDPOINTS.MESSAGES.STORAGE)
};
