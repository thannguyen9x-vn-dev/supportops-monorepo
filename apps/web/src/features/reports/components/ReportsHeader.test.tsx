import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ReportsHeader } from "./ReportsHeader";

describe("ReportsHeader", () => {
  it("renders title and description", () => {
    render(<ReportsHeader />);

    expect(screen.getByText("reports.pageTitle")).toBeInTheDocument();
    expect(screen.getByText("reports.pageDescription")).toBeInTheDocument();
  });
});
