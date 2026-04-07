import type {
  CannedResponse,
  CannedResponsePickerItem,
  CreateCannedResponseInput,
  PageMeta,
  UpdateCannedResponseInput,
} from "@supportops/types";
import { CANNED_RESPONSE_ENDPOINTS } from "@supportops/types";

import { apiClient } from "@/lib/api";

export interface CannedResponseListResult {
  items: CannedResponse[];
  meta: PageMeta;
}

export const cannedResponseService = {
  async list(query?: { page?: number; size?: number; q?: string }): Promise<CannedResponseListResult> {
    const response = await apiClient.get<CannedResponse[]>(CANNED_RESPONSE_ENDPOINTS.list, {
      params: {
        page: query?.page ?? 1,
        size: query?.size ?? 30,
        q: query?.q,
      },
    });

    return {
      items: response.data,
      meta: response.meta ?? {
        page: query?.page ?? 1,
        size: query?.size ?? 30,
        total: response.data.length,
        totalPages: 1,
      },
    };
  },

  async search(q: string): Promise<CannedResponsePickerItem[]> {
    const response = await apiClient.get<CannedResponsePickerItem[]>(CANNED_RESPONSE_ENDPOINTS.search, {
      params: { q },
    });
    return response.data;
  },

  async create(data: CreateCannedResponseInput): Promise<CannedResponse> {
    const response = await apiClient.post<CannedResponse>(CANNED_RESPONSE_ENDPOINTS.create, data);
    return response.data;
  },

  async update(id: string, data: UpdateCannedResponseInput): Promise<CannedResponse> {
    const response = await apiClient.put<CannedResponse>(CANNED_RESPONSE_ENDPOINTS.update(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(CANNED_RESPONSE_ENDPOINTS.delete(id));
  },
};
