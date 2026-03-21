import type { ApiResponse, Product } from "@supportops/types";
import { ENDPOINTS } from "@supportops/types";

import { serverApiClient } from "@/lib/api/serverApiClient";

export const productServerService = {
  list: (params?: { page?: number; size?: number; search?: string; category?: string }): Promise<ApiResponse<Product[]>> =>
    serverApiClient.get<Product[]>(ENDPOINTS.PRODUCTS.LIST, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        search: params?.search,
        category: params?.category
      }
    }),

  getById: (id: string): Promise<ApiResponse<Product>> => serverApiClient.get<Product>(ENDPOINTS.PRODUCTS.DETAIL(id))
};
