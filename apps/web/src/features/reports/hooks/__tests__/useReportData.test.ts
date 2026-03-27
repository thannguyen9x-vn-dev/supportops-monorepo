import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("@/features/dashboard/services/dashboard.service", () => ({
  dashboardService: {
    getSalesSummary: jest.fn(),
    getTransactions: jest.fn(),
  },
}));

import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { useReportData } from "../useReportData";

describe("useReportData", () => {
  const getSalesSummary = dashboardService.getSalesSummary as jest.Mock;
  const getTransactions = dashboardService.getTransactions as jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads report data", async () => {
    getSalesSummary.mockResolvedValue({ data: { dataPoints: [{ label: "A", templates: 1, invoicing: 2 }] } });
    getTransactions.mockResolvedValue({ data: [{ id: "txn-1" }] });

    const { result } = renderHook(() => useReportData("month"));

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.loadState).toBe("ready"));
    expect(getSalesSummary).toHaveBeenCalledWith("month");
    expect(result.current.data.transactions[0]?.id).toBe("txn-1");
  });

  it("sets error state when fetch fails", async () => {
    getSalesSummary.mockRejectedValue(new Error("boom"));
    getTransactions.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useReportData("day"));

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.loadState).toBe("error"));
  });

  it("reload resets loading then ready", async () => {
    getSalesSummary.mockResolvedValue({ data: { dataPoints: [] } });
    getTransactions.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useReportData("year"));

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.loadState).toBe("ready"));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.loadState).toBe("ready");
    expect(getSalesSummary).toHaveBeenCalledTimes(2);
  });
});
