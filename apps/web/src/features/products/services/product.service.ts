import type {
  CreateProductRequest,
  Product,
  ProductImage,
  ProductListItem,
  UpdateProductRequest
} from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const productService = {
  list: (params?: { page?: number; size?: number; search?: string }) =>
    apiClient.get<ProductListItem[]>(ENDPOINTS.PRODUCTS.LIST, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        search: params?.search
      }
    }),

  getById: (id: string) => apiClient.get<Product>(ENDPOINTS.PRODUCTS.DETAIL(id)),

  create: (data: CreateProductRequest) => apiClient.post<Product>(ENDPOINTS.PRODUCTS.LIST, data),

  update: (id: string, data: UpdateProductRequest) => apiClient.put<Product>(ENDPOINTS.PRODUCTS.DETAIL(id), data),

  delete: (id: string) => apiClient.delete<void>(ENDPOINTS.PRODUCTS.DETAIL(id)),

  bulkDelete: (ids: string[]) => apiClient.delete<void>(ENDPOINTS.PRODUCTS.BULK_DELETE, { ids }),

  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return apiClient.upload<ProductImage[]>(ENDPOINTS.PRODUCTS.IMAGES(productId), formData);
  },

  deleteImage: (productId: string, imageId: string) =>
    apiClient.delete<void>(ENDPOINTS.PRODUCTS.IMAGE(productId, imageId))
};
