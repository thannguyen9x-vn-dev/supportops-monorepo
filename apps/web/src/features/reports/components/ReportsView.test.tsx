import { render, screen } from "@testing-library/react";

jest.mock("../hooks/useReports", () => ({
  useReports: jest.fn(),
}));

jest.mock("./ReportsHeader", () => ({
  ReportsHeader: () => <div>reports-header</div>,
}));

jest.mock("./ReportsFilterPanel", () => ({
  ReportsFilterPanel: () => <div>reports-filter-panel</div>,
}));

jest.mock("./ReportsExportActions", () => ({
  ReportsExportActions: () => <div>reports-export-actions</div>,
}));

import { useReports } from "../hooks/useReports";
import { ReportsView } from "./ReportsView";

describe("ReportsView", () => {
  const useReportsMock = useReports as jest.Mock;

  it("renders composed sections", () => {
    useReportsMock.mockReturnValue({
      fromDate: "2026-01-01",
      toDate: "2026-03-31",
      selectedMetrics: ["request_volume"],
      isExportingCsv: false,
      isExportingExcel: false,
      isExportingPdf: false,
      exportError: null,
      isDateRangeInvalid: false,
      handleFromDateChange: jest.fn(),
      handleToDateChange: jest.fn(),
      handleMetricsChange: jest.fn(),
      handleExportCsv: jest.fn(),
      handleExportExcel: jest.fn(),
      handleExportPdf: jest.fn(),
    });

    render(<ReportsView />);

    expect(screen.getByText("reports-header")).toBeInTheDocument();
    expect(screen.getByText("reports-filter-panel")).toBeInTheDocument();
    expect(screen.getByText("reports-export-actions")).toBeInTheDocument();
  });
});
