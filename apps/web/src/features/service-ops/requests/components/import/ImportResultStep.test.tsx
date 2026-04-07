import { fireEvent, render, screen } from "@testing-library/react";

import { ImportResultStep } from "./ImportResultStep";

describe("ImportResultStep", () => {
  it("renders result summary and closes", () => {
    const onClose = jest.fn();

    render(
      <ImportResultStep
        onClose={onClose}
        result={{
          totalRows: 3,
          created: 2,
          failed: 1,
          errors: [{ row: 2, message: "invalid reporter" }],
        }}
      />,
    );

    expect(screen.getByText("import.result.success")).toBeInTheDocument();
    expect(screen.getByText("import.result.errors")).toBeInTheDocument();
    expect(screen.getByText("import.result.errorDetail")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "actions.close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
