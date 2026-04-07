import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ReportsExportActions } from "./ReportsExportActions";

describe("ReportsExportActions", () => {
  it("renders 3 export actions", () => {
    render(
      <ReportsExportActions
        isExportingCsv={false}
        isExportingExcel={false}
        isExportingPdf={false}
        exportError={null}
        isDateRangeInvalid={false}
        onExportCsv={jest.fn()}
        onExportExcel={jest.fn()}
        onExportPdf={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "reports.actions.exportCsv" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "reports.actions.exportExcel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "reports.actions.exportPdf" })).toBeInTheDocument();
  });

  it("triggers export callbacks", async () => {
    const user = userEvent.setup();
    const onExportCsv = jest.fn();

    render(
      <ReportsExportActions
        isExportingCsv={false}
        isExportingExcel={false}
        isExportingPdf={false}
        exportError={null}
        isDateRangeInvalid={false}
        onExportCsv={onExportCsv}
        onExportExcel={jest.fn()}
        onExportPdf={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "reports.actions.exportCsv" }));
    expect(onExportCsv).toHaveBeenCalledTimes(1);
  });

  it("shows error message", () => {
    render(
      <ReportsExportActions
        isExportingCsv={false}
        isExportingExcel={false}
        isExportingPdf={false}
        exportError="reports.errors.exportFailed"
        isDateRangeInvalid={false}
        onExportCsv={jest.fn()}
        onExportExcel={jest.fn()}
        onExportPdf={jest.fn()}
      />,
    );

    expect(screen.getByText("reports.errors.exportFailed")).toBeInTheDocument();
  });
});
