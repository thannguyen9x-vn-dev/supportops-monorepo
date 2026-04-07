import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ReportsFilterPanel } from "./ReportsFilterPanel";

describe("ReportsFilterPanel", () => {
  it("renders date fields and metrics", () => {
    render(
      <ReportsFilterPanel
        fromDate="2026-01-01"
        toDate="2026-03-31"
        selectedMetrics={["request_volume"]}
        isDateRangeInvalid={false}
        onFromDateChange={jest.fn()}
        onToDateChange={jest.fn()}
        onMetricsChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("reports.filters.fromDate")).toBeInTheDocument();
    expect(screen.getByLabelText("reports.filters.toDate")).toBeInTheDocument();
    expect(screen.getByText("reports.metrics.request_volume")).toBeInTheDocument();
  });

  it("calls handlers on date and metric changes", async () => {
    const user = userEvent.setup();
    const onFromDateChange = jest.fn();
    const onMetricsChange = jest.fn();

    render(
      <ReportsFilterPanel
        fromDate="2026-01-01"
        toDate="2026-03-31"
        selectedMetrics={["request_volume"]}
        isDateRangeInvalid={false}
        onFromDateChange={onFromDateChange}
        onToDateChange={jest.fn()}
        onMetricsChange={onMetricsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("reports.filters.fromDate"), {
      target: { value: "2026-01-15" },
    });
    await user.click(screen.getByLabelText("reports.metrics.sla_health"));

    expect(onFromDateChange).toHaveBeenCalled();
    expect(onMetricsChange).toHaveBeenCalledWith(["request_volume", "sla_health"]);
  });

  it("shows invalid date range error", () => {
    render(
      <ReportsFilterPanel
        fromDate="2026-03-31"
        toDate="2026-01-01"
        selectedMetrics={["request_volume"]}
        isDateRangeInvalid
        onFromDateChange={jest.fn()}
        onToDateChange={jest.fn()}
        onMetricsChange={jest.fn()}
      />,
    );

    expect(screen.getByText("reports.errors.invalidDateRange")).toBeInTheDocument();
  });
});
