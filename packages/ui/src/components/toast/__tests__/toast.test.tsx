import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "../../../test-utils/render";
import { Toast } from "../Toast";

describe("Toast", () => {
  it("renders default variant and accessible status role", () => {
    render(<Toast id="1" title="Saved" />);

    const toast = screen.getByRole("status");
    expect(toast).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(toast.className).toContain("border-blue-200");
  });

  it("renders error variant with description and calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Toast
        description="Please retry"
        id="toast-2"
        onClose={onClose}
        title="Failed"
        variant="error"
      />
    );

    expect(screen.getByText("Please retry")).toBeInTheDocument();
    expect(screen.getByRole("status").className).toContain("border-red-200");

    await user.click(screen.getByRole("button", { name: "Close notification" }));
    expect(onClose).toHaveBeenCalledWith("toast-2");
  });
});
