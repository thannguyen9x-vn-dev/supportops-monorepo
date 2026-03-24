import type {
  Asset,
  AssetDetail,
  AssetDetailQuery,
  AssetListQuery,
  AssetType,
  CreateAssetInput,
  CreateAssetTypeInput,
  UpdateAssetInput,
  UpdateAssetTypeInput,
} from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const assetService = {
  // ─── Asset Types ───────────────────────────────────────────────────────────

  listAssetTypes: () =>
    apiClient.get<AssetType[]>(ENDPOINTS.ASSET_TYPES.LIST),

  createAssetType: (payload: CreateAssetTypeInput) =>
    apiClient.post<AssetType>(ENDPOINTS.ASSET_TYPES.CREATE, payload),

  updateAssetType: (id: string, payload: UpdateAssetTypeInput) =>
    apiClient.patch<AssetType>(ENDPOINTS.ASSET_TYPES.UPDATE(id), payload),

  deleteAssetType: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.ASSET_TYPES.DELETE(id)),

  // ─── Assets ────────────────────────────────────────────────────────────────

  list: (params?: AssetListQuery) =>
    apiClient.get<Asset[]>(ENDPOINTS.ASSETS.LIST, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        search: params?.search,
        status: params?.status,
        assetTypeId: params?.assetTypeId,
        locationId: params?.locationId,
      },
    }),

  getById: (id: string) =>
    apiClient.get<AssetDetail>(ENDPOINTS.ASSETS.DETAIL(id)),

  detail: (id: string, params?: AssetDetailQuery) =>
    apiClient.get<AssetDetail>(ENDPOINTS.ASSETS.DETAIL(id), {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        status: params?.status,
      },
    }),

  create: (payload: CreateAssetInput) =>
    apiClient.post<Asset>(ENDPOINTS.ASSETS.CREATE, payload),

  update: (id: string, payload: UpdateAssetInput) =>
    apiClient.patch<Asset>(ENDPOINTS.ASSETS.UPDATE(id), payload),

  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.ASSETS.DELETE(id)),
};
