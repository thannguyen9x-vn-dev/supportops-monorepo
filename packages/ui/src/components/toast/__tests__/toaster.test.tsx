import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "../../../test-utils/render";
import { Toaster } from "../Toaster";

describe("Toaster", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when list is empty", () => {
    const { container } = render(<Toaster onRemove={vi.fn()} toasts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders toasts, supports position and close callback", async () => {
    const onRemove = vi.fn();

    render(
      <Toaster
        onRemove={onRemove}
        position="bottom-left"
        toasts={[{ id: "a", title: "Saved" }]}
      />
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Saved").closest('[aria-live="polite"]')?.className).toContain("bottom-4 left-4");

    screen.getByRole("button", { name: "Close notification" }).click();
    expect(onRemove).toHaveBeenCalledWith("a");
  });

  it("auto-removes toast by duration", () => {
    const onRemove = vi.fn();
    render(
      <Toaster
        onRemove={onRemove}
        toasts={[{ id: "timer", title: "Auto", durationMs: 50 }]}
      />
    );

    vi.advanceTimersByTime(60);
    expect(onRemove).toHaveBeenCalledWith("timer");
  });
});
