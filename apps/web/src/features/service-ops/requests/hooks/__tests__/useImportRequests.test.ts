import { act, renderHook, waitFor } from "@testing-library/react";

import { useImportRequests } from "../useImportRequests";

jest.mock("../../services/import-requests.service", () => ({
  importRequestsService: {
    downloadTemplate: jest.fn(),
    uploadImportFile: jest.fn(),
    getJobStatus: jest.fn(),
    confirmImport: jest.fn(),
  },
}));

import { importRequestsService } from "../../services/import-requests.service";

describe("useImportRequests", () => {
  const uploadImportFileMock = importRequestsService.uploadImportFile as jest.Mock;
  const getJobStatusMock = importRequestsService.getJobStatus as jest.Mock;
  const confirmImportMock = importRequestsService.confirmImport as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("uploads file and moves to preview state when preview is ready", async () => {
    uploadImportFileMock.mockResolvedValue({ jobId: "job-1", status: "queued" });
    getJobStatusMock.mockResolvedValue({
      jobId: "job-1",
      status: "preview_ready",
      preview: {
        totalRows: 3,
        validRows: 1,
        errorRows: [{ row: 1, message: "invalid" }],
        warningRows: [{ row: 2, type: "duplicate_recent", message: "warn" }],
      },
    });

    const { result } = renderHook(() => useImportRequests());

    await act(async () => {
      await result.current.uploadFile(new File(["a"], "import.csv", { type: "text/csv" }));
    });

    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });

    await waitFor(() => {
      expect(result.current.step).toBe("preview");
    });
    expect(result.current.skippedRows.has(1)).toBe(true);
    expect(result.current.skippedRows.has(2)).toBe(false);
  });

  it("toggles only warning rows", async () => {
    uploadImportFileMock.mockResolvedValue({ jobId: "job-1", status: "queued" });
    getJobStatusMock.mockResolvedValue({
      jobId: "job-1",
      status: "preview_ready",
      preview: {
        totalRows: 2,
        validRows: 1,
        errorRows: [{ row: 1, message: "invalid" }],
        warningRows: [{ row: 2, type: "duplicate_recent", message: "warn" }],
      },
    });

    const { result } = renderHook(() => useImportRequests());
    await act(async () => {
      await result.current.uploadFile(new File(["a"], "import.csv", { type: "text/csv" }));
    });
    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });

    await waitFor(() => expect(result.current.step).toBe("preview"));

    act(() => {
      result.current.toggleRow(1);
      result.current.toggleRow(2);
    });

    expect(result.current.skippedRows.has(1)).toBe(true);
    expect(result.current.skippedRows.has(2)).toBe(true);
  });

  it("confirm import sends skipped rows and reaches result state", async () => {
    uploadImportFileMock.mockResolvedValue({ jobId: "job-1", status: "queued" });
    getJobStatusMock
      .mockResolvedValueOnce({
        jobId: "job-1",
        status: "preview_ready",
        preview: {
          totalRows: 2,
          validRows: 1,
          errorRows: [{ row: 1, message: "invalid" }],
          warningRows: [{ row: 2, type: "duplicate_recent", message: "warn" }],
        },
      })
      .mockResolvedValueOnce({
        jobId: "job-1",
        status: "completed",
        result: { totalRows: 2, created: 1, failed: 1, errors: [] },
      });
    confirmImportMock.mockResolvedValue({ jobId: "job-1", status: "queued" });

    const { result } = renderHook(() => useImportRequests());

    await act(async () => {
      await result.current.uploadFile(new File(["a"], "import.csv", { type: "text/csv" }));
    });
    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });
    await waitFor(() => expect(result.current.step).toBe("preview"));

    act(() => {
      result.current.toggleRow(2);
    });

    await act(async () => {
      await result.current.confirmImport();
    });
    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });

    await waitFor(() => expect(result.current.step).toBe("result"));
    expect(confirmImportMock).toHaveBeenCalledWith("job-1", [1, 2]);
    expect(result.current.jobStatus?.status).toBe("completed");
  });
});
