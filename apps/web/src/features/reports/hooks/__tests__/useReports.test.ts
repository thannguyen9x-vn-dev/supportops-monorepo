import { act, renderHook, waitFor } from "@testing-library/react";
import { ALL_EXPORT_METRICS } from "@supportops/types";

jest.mock("../../services/reports.service", () => ({
  reportsService: {
    exportCsv: jest.fn(),
    exportExcel: jest.fn(),
    exportPdf: jest.fn(),
  },
}));

import { reportsService } from "../../services/reports.service";
import { useReports } from "../useReports";

describe("useReports", () => {
  const originalCreateElement = document.createElement.bind(document);
  const exportCsvMock = reportsService.exportCsv as jest.Mock;
  const exportExcelMock = reportsService.exportExcel as jest.Mock;
  const exportPdfMock = reportsService.exportPdf as jest.Mock;
  const createObjectUrlMock = jest.fn(() => "blob:test-url");
  const revokeObjectUrlMock = jest.fn();
  const clickMock = jest.fn();
  const createElementSpy = jest.spyOn(document, "createElement");

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrlMock });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrlMock });
    createElementSpy.mockImplementation((tagName: string): HTMLElement => {
      if (tagName === "a") {
        return { click: clickMock } as unknown as HTMLElement;
      }
      return originalCreateElement(tagName);
    });
  });

  afterAll(() => {
    createElementSpy.mockRestore();
  });

  it("sets default state", () => {
    const { result } = renderHook(() => useReports());

    expect(result.current.selectedMetrics).toEqual(ALL_EXPORT_METRICS);
    expect(result.current.exportError).toBeNull();
  });

  it("exports CSV and toggles loading state", async () => {
    exportCsvMock.mockResolvedValue(new Blob(["a,b"]));
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.handleExportCsv();
    });

    expect(exportCsvMock).toHaveBeenCalledTimes(1);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:test-url");
    await waitFor(() => expect(result.current.isExportingCsv).toBe(false));
  });

  it("sets error when export fails", async () => {
    exportExcelMock.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.handleExportExcel();
    });

    expect(result.current.exportError).toBe("reports.errors.exportFailed");
  });

  it("exports PDF", async () => {
    exportPdfMock.mockResolvedValue(new Blob(["pdf"]));
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.handleExportPdf();
    });

    expect(exportPdfMock).toHaveBeenCalledTimes(1);
  });
});
