import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("@/features/dashboard/services/dashboard.service", () => ({
  dashboardService: {
    getSummary: jest.fn(),
    getRecentActivity: jest.fn(),
    getRequestTrend: jest.fn(),
  },
}));

import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { useDashboardOverview } from "../useDashboardOverview";

describe("useDashboardOverview", () => {
  const getSummary = dashboardService.getSummary as jest.Mock;
  const getRecentActivity = dashboardService.getRecentActivity as jest.Mock;
  const getRequestTrend = dashboardService.getRequestTrend as jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads overview successfully", async () => {
    getSummary.mockResolvedValue({ data: { scope: "PERSONAL", kpis: {}, requestsByStatus: [], requestsByPriority: [], slaOverview: {} } });
    getRecentActivity.mockResolvedValue({ data: [{ id: "a-1" }] });
    getRequestTrend.mockResolvedValue({ data: [{ date: "2026-03-01", submitted: 1, resolved: 1 }] });

    const { result } = renderHook(() => useDashboardOverview());

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.loadState).toBe("ready"));
    expect(result.current.trend).toHaveLength(1);
  });

  it("sets error when api fails", async () => {
    getSummary.mockRejectedValue(new Error("boom"));
    getRecentActivity.mockResolvedValue({ data: [] });
    getRequestTrend.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useDashboardOverview());

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.loadState).toBe("error"));
  });

  it("reload transitions to refreshing then ready", async () => {
    getSummary.mockResolvedValue({ data: { scope: "PERSONAL", kpis: {}, requestsByStatus: [], requestsByPriority: [], slaOverview: {} } });
    getRecentActivity.mockResolvedValue({ data: [] });
    getRequestTrend.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useDashboardOverview());

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.loadState).toBe("ready"));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.loadState).toBe("ready");
    expect(getSummary).toHaveBeenCalledTimes(2);
  });
});
