import { apiClient } from "@/lib/api";

import { assetService } from "../asset.service";

jest.mock("@/lib/api", () => ({
  ENDPOINTS: {
    ASSET_TYPES: {
      LIST: "/asset-types",
      CREATE: "/asset-types",
      UPDATE: (id: string) => `/asset-types/${id}`,
      DELETE: (id: string) => `/asset-types/${id}`,
    },
    ASSETS: {
      LIST: "/assets",
      CREATE: "/assets",
      DETAIL: (id: string) => `/assets/${id}`,
      UPDATE: (id: string) => `/assets/${id}`,
      DELETE: (id: string) => `/assets/${id}`,
    },
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("assetService", () => {
  const mockGet = apiClient.get as jest.Mock;
  const mockPost = apiClient.post as jest.Mock;
  const mockPatch = apiClient.patch as jest.Mock;
  const mockDelete = apiClient.delete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: { total: 0 } });
    mockPost.mockResolvedValue({ data: { id: "created" } });
    mockPatch.mockResolvedValue({ data: { id: "updated" } });
    mockDelete.mockResolvedValue({ data: null });
  });

  it("lists asset types", async () => {
    await assetService.listAssetTypes();

    expect(mockGet).toHaveBeenCalledWith("/asset-types");
  });

  it("lists assets with default pagination", async () => {
    await assetService.list();

    expect(mockGet).toHaveBeenCalledWith("/assets", {
      params: {
        page: 1,
        size: 20,
        search: undefined,
        status: undefined,
        assetTypeId: undefined,
        locationId: undefined,
      },
    });
  });

  it("gets asset detail", async () => {
    await assetService.detail("asset-1", { page: 2, size: 10, status: "IN_USE" as never });

    expect(mockGet).toHaveBeenCalledWith("/assets/asset-1", {
      params: { page: 2, size: 10, status: "IN_USE" },
    });
  });

  it("creates, updates and deletes asset type", async () => {
    await assetService.createAssetType({ name: "Mobile" });
    await assetService.updateAssetType("asset-type-1", { name: "Laptop Updated" });
    await assetService.deleteAssetType("asset-type-1");

    expect(mockPost).toHaveBeenCalledWith("/asset-types", { name: "Mobile" });
    expect(mockPatch).toHaveBeenCalledWith("/asset-types/asset-type-1", { name: "Laptop Updated" });
    expect(mockDelete).toHaveBeenCalledWith("/asset-types/asset-type-1");
  });

  it("creates, updates and deletes asset", async () => {
    await assetService.create({ assetCode: "AST-100" } as never);
    await assetService.update("asset-1", { name: "Renamed" } as never);
    await assetService.delete("asset-1");

    expect(mockPost).toHaveBeenCalledWith("/assets", { assetCode: "AST-100" });
    expect(mockPatch).toHaveBeenCalledWith("/assets/asset-1", { name: "Renamed" });
    expect(mockDelete).toHaveBeenCalledWith("/assets/asset-1");
  });
});
