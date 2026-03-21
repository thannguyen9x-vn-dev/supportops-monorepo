import type { Invoice } from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const invoiceService = {
  list: (params?: { page?: number; size?: number; search?: string }) =>
    apiClient.get<Invoice[]>(ENDPOINTS.INVOICES.LIST, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        search: params?.search
      }
    }),

  getById: (id: string) => apiClient.get<Invoice>(ENDPOINTS.INVOICES.DETAIL(id)),

  downloadPdf: (id: string): Promise<Blob> => apiClient.download(ENDPOINTS.INVOICES.PDF(id))
};
