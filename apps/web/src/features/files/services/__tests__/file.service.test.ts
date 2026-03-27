import { apiClient } from "@/lib/api/apiClient";

import { fileService } from "../file.service";

jest.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    upload: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
  },
}));

describe("fileService", () => {
  const mockUpload = apiClient.upload as jest.Mock;
  const mockDelete = apiClient.delete as jest.Mock;
  const mockGet = apiClient.get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockResolvedValue({ data: { files: [{ id: "file-1" }] } });
    mockDelete.mockResolvedValue({ data: null });
    mockGet.mockResolvedValue({ data: { url: "https://cdn.example.com/file-1?signed=true" } });
  });

  it("uploads files and returns uploaded list", async () => {
    const uploaded = await fileService.uploadFiles([new File(["hello"], "hello.txt")]);

    expect(mockUpload).toHaveBeenCalled();
    expect(uploaded[0]?.id).toBe("file-1");
  });

  it("deletes file", async () => {
    await fileService.deleteFile("file-99");

    expect(mockDelete).toHaveBeenCalledWith("/files/file-99");
  });

  it("gets signed access url", async () => {
    const url = await fileService.getAccessUrl("https://cdn.example.com/raw", 120);

    expect(mockGet).toHaveBeenCalledWith("/files/access-url", {
      params: { url: "https://cdn.example.com/raw", expiresInSeconds: 120 },
    });
    expect(url).toContain("signed=true");
  });
});
