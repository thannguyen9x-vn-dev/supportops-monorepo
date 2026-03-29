import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

jest.mock("@/features/reports/hooks/useReportData", () => ({
  useReportData: jest.fn(),
}));

jest.mock("../ReportFilters", () => ({
  ReportFilters: ({ onApply }: { onApply: () => void }) => (
    <button onClick={onApply} type="button">
      apply-filter
    </button>
  ),
}));

jest.mock("../ReportSummaryCards", () => ({
  ReportSummaryCards: () => <div>summary-cards</div>,
}));

jest.mock("../ReportVolumeChart", () => ({
  ReportVolumeChart: () => <div>volume-chart</div>,
}));

jest.mock("../ReportTrendChart", () => ({
  ReportTrendChart: () => <div>trend-chart</div>,
}));

jest.mock("../ReportServiceTypeChart", () => ({
  ReportServiceTypeChart: () => <div>service-type-chart</div>,
}));

import { useReportData } from "@/features/reports/hooks/useReportData";

import { ReportView } from "../ReportView";

describe("ReportView", () => {
  const useReportDataMock = useReportData as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeleton", () => {
    useReportDataMock.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: jest.fn(),
    });

    render(<ReportView />);

    expect(screen.getByTestId("report-loading-skeleton")).toBeInTheDocument();
  });

  it("renders error state and handles retry", async () => {
    const refetch = jest.fn();
    useReportDataMock.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch,
    });

    render(<ReportView />);

    expect(screen.getByText("error")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when totalRequests = 0", () => {
    useReportDataMock.mockReturnValue({
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      data: {
        summary: {
          totalRequests: 0,
          openRequests: 0,
          resolvedRequests: 0,
          closedRequests: 0,
          slaComplianceRate: 1,
          slaBreachCount: 0,
          slaBreachActiveCount: 0,
          avgFirstResponseMinutes: 0,
          avgResolutionMinutes: 0,
        },
        byStatus: [],
        byPriority: [],
        byServiceType: [],
        volumeTrend: [],
      },
    });

    render(<ReportView />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders summary and chart sections", () => {
    useReportDataMock.mockReturnValue({
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      data: {
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
        byStatus: [{ status: "OPEN", count: 4 }],
        byPriority: [{ priority: "HIGH", count: 2 }],
        byServiceType: [{ serviceTypeCode: "it", serviceTypeName: "IT", count: 10 }],
        volumeTrend: [{ date: "2026-03-01", created: 3, resolved: 2 }],
      },
    });

    render(<ReportView />);

    expect(screen.getByText("summary-cards")).toBeInTheDocument();
    expect(screen.getByText("volume-chart")).toBeInTheDocument();
    expect(screen.getByText("trend-chart")).toBeInTheDocument();
    expect(screen.getByText("service-type-chart")).toBeInTheDocument();
  });
});
