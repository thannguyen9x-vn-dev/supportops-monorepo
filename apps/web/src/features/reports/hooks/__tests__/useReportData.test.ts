import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";

jest.mock("../../services/report.service", () => ({
  reportService: {
    getOverview: jest.fn(),
  },
}));

import type { ReportOverview } from "@supportops/types";

import { reportService } from "../../services/report.service";
import { useReportData } from "../useReportData";

function createWrapper(queryClient: QueryClient) {
  function QueryWrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  QueryWrapper.displayName = "QueryWrapper";
  return QueryWrapper;
}

const reportSample: ReportOverview = {
  summary: {
    totalRequests: 10,
    openRequests: 4,
    resolvedRequests: 6,
    closedRequests: 6,
    slaComplianceRate: 0.873,
    slaBreachCount: 2,
    slaBreachActiveCount: 1,
    avgFirstResponseMinutes: 45,
    avgResolutionMinutes: 180,
  },
  byStatus: [
    { status: "OPEN", count: 4 },
    { status: "RESOLVED", count: 6 },
  ],
  byPriority: [{ priority: "HIGH", count: 2 }],
  byServiceType: [{ serviceTypeCode: "it", serviceTypeName: "IT", count: 10 }],
  volumeTrend: [{ date: "2026-03-01", created: 3, resolved: 2 }],
};

describe("useReportData", () => {
  const getOverviewMock = reportService.getOverview as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call API when from/to are missing", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(() => useReportData({ from: "", to: "" }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(getOverviewMock).not.toHaveBeenCalled();
    });
  });

  it("loads report data when filters are valid", async () => {
    getOverviewMock.mockResolvedValue(reportSample);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useReportData({ from: "2026-03-01", to: "2026-03-31" }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getOverviewMock).toHaveBeenCalledWith({ from: "2026-03-01", to: "2026-03-31" });
    expect(result.current.data?.summary.totalRequests).toBe(10);
  });

  it("reuses cache for 5 minutes", async () => {
    getOverviewMock.mockResolvedValue(reportSample);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = createWrapper(queryClient);

    const first = renderHook(() => useReportData({ from: "2026-03-01", to: "2026-03-31" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(first.result.current.isSuccess).toBe(true);
    });
    first.unmount();

    const second = renderHook(() => useReportData({ from: "2026-03-01", to: "2026-03-31" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(second.result.current.isSuccess).toBe(true);
    });

    expect(getOverviewMock).toHaveBeenCalledTimes(1);
  });
});
