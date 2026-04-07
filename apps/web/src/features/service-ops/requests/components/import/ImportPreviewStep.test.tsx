import { fireEvent, render, screen } from "@testing-library/react";

import { ImportPreviewStep } from "./ImportPreviewStep";

describe("ImportPreviewStep", () => {
  it("shows confirm count and calls confirm action", () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    render(
      <ImportPreviewStep
        isConfirming={false}
        onConfirm={onConfirm}
        onToggleRow={jest.fn()}
        preview={{
          totalRows: 5,
          validRows: 3,
          errorRows: [{ row: 1, message: "invalid" }],
          warningRows: [{ row: 2, type: "duplicate_in_file", message: "dup" }],
        }}
        skippedRows={new Set([1, 2])}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "import.preview.confirmButton" });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
