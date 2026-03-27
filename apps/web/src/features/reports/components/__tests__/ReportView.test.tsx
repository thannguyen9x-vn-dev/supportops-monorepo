import userEvent from "@testing-library/user-event";

import { render, screen } from "../../../../../__tests__/setup/test-utils";

jest.mock("@/features/reports/hooks/useReportData", () => ({
  useReportData: jest.fn(),
}));

import { useReportData } from "@/features/reports/hooks/useReportData";

import { ReportView } from "../ReportView";

describe("ReportView", () => {
  const useReportDataMock = useReportData as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    useReportDataMock.mockReturnValue({
      data: { salesSummary: null, transactions: [] },
      loadState: "loading",
      reload: jest.fn(),
    });

    render(<ReportView period="day" titleKey="title" />);

    expect(screen.getByText("state.loading")).toBeInTheDocument();
  });

  it("renders error state and retry", async () => {
    const reload = jest.fn();
    useReportDataMock.mockReturnValue({
      data: { salesSummary: null, transactions: [] },
      loadState: "error",
      reload,
    });

    render(<ReportView period="day" titleKey="title" />);

    await userEvent.click(screen.getByRole("button", { name: "action.retry" }));

    expect(reload).toHaveBeenCalled();
  });

  it("renders summary and transactions", () => {
    useReportDataMock.mockReturnValue({
      data: {
        salesSummary: {
          dataPoints: [
            { label: "A", templates: 2, invoicing: 5 },
            { label: "B", templates: 3, invoicing: 10 },
          ],
        },
        transactions: [
          {
            id: "txn-1",
            description: "Subscription",
            amount: 120,
            status: "COMPLETED",
            dateTime: "2026-03-01T00:00:00.000Z",
          },
        ],
      },
      loadState: "ready",
      reload: jest.fn(),
    });

    render(<ReportView period="month" titleKey="overviewTitle" />);

    expect(screen.getByText("overviewTitle")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("summary.templates")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
