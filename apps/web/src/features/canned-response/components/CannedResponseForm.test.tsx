import { fireEvent, render, screen } from "@testing-library/react";

import { CannedResponseForm } from "./CannedResponseForm";

describe("CannedResponseForm", () => {
  it("validates shortcut format a-z0-9_-", async () => {
    render(
      <CannedResponseForm
        onClose={jest.fn()}
        onSubmit={async () => {}}
        open
      />
    );

    const titleInput = screen.getByLabelText("titleField");
    const bodyInput = screen.getByLabelText("body");
    const shortcutInput = screen.getByLabelText("shortcut");

    fireEvent.change(titleInput, { target: { value: "Reset Password" } });
    fireEvent.change(bodyInput, { target: { value: "Sample body" } });
    fireEvent.change(shortcutInput, { target: { value: "INVALID SPACE" } });

    expect(screen.getByText("shortcutInvalid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "save" })).toBeDisabled();
  });
});
