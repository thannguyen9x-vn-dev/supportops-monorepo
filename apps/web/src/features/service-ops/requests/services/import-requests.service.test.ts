import { SERVICE_OPS_ENDPOINTS } from "@supportops/types";

import { apiClient } from "@/lib/api";
import { importRequestsService } from "./import-requests.service";

jest.mock("@/lib/api", () => ({
  apiClient: {
    download: jest.fn(),
    upload: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("importRequestsService", () => {
  const downloadMock = apiClient.download as jest.Mock;
  const uploadMock = apiClient.upload as jest.Mock;
  const getMock = apiClient.get as jest.Mock;
  const postMock = apiClient.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("downloads template with selected format", async () => {
    const blob = new Blob(["a"], { type: "text/csv" });
    const createObjectUrlMock = jest.fn(() => "blob:test");
    const revokeObjectUrlMock = jest.fn();
    const clickMock = jest.fn();
    const anchor = { href: "", download: "", click: clickMock } as unknown as HTMLAnchorElement;

    downloadMock.mockResolvedValue(blob);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrlMock });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrlMock });
    jest.spyOn(document, "createElement").mockReturnValue(anchor);

    importRequestsService.downloadTemplate("csv");
    await Promise.resolve();

    expect(downloadMock).toHaveBeenCalledWith(SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_TEMPLATE, {
      params: { format: "csv" },
    });
    expect(createObjectUrlMock).toHaveBeenCalledWith(blob);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:test");
  });

  it("uploads file and returns enqueued job", async () => {
    const file = new File(["title"], "import.csv", { type: "text/csv" });
    uploadMock.mockResolvedValue({ data: { jobId: "job-1", status: "queued", fileName: "import.csv" } });

    const result = await importRequestsService.uploadImportFile(file);

    expect(uploadMock).toHaveBeenCalledWith(
      SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_UPLOAD,
      expect.any(FormData),
    );
    expect(result.jobId).toBe("job-1");
  });

  it("gets job status", async () => {
    getMock.mockResolvedValue({ data: { jobId: "job-1", status: "processing", progress: 30 } });

    const result = await importRequestsService.getJobStatus("job-1");

    expect(getMock).toHaveBeenCalledWith(
      SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_JOB_STATUS("job-1"),
    );
    expect(result.status).toBe("processing");
  });

  it("confirms import with skipped rows", async () => {
    postMock.mockResolvedValue({ data: { jobId: "job-1", status: "queued" } });

    const result = await importRequestsService.confirmImport("job-1", [2, 5]);

    expect(postMock).toHaveBeenCalledWith(
      SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_JOB_CONFIRM("job-1"),
      { skipRowIndices: [2, 5] },
    );
    expect(result).toEqual({ jobId: "job-1", status: "queued" });
  });
});
