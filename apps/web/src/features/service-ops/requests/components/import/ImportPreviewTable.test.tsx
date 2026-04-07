import { fireEvent, render, screen } from "@testing-library/react";

import { ImportPreviewTable } from "./ImportPreviewTable";

describe("ImportPreviewTable", () => {
  it("renders error rows as disabled and warning rows as toggleable", () => {
    const onToggleRow = jest.fn();

    render(
      <ImportPreviewTable
        errorRows={[{ row: 3, message: "invalid service type" }]}
        onToggleRow={onToggleRow}
        skippedRows={new Set([3, 4])}
        validRowCount={2}
        warningRows={[{ row: 4, type: "duplicate_recent", message: "possible duplicate" }]}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const errorCheckbox = checkboxes[0];
    const warningCheckbox = checkboxes[1];

    if (!errorCheckbox || !warningCheckbox) {
      throw new Error("expected error and warning checkboxes");
    }
    expect(errorCheckbox).toBeDisabled();
    expect(errorCheckbox).not.toBeChecked();

    expect(warningCheckbox).not.toBeChecked();

    fireEvent.click(warningCheckbox);
    expect(onToggleRow).toHaveBeenCalledWith(4);
  });
});
