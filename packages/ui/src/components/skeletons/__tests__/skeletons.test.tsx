import { describe, expect, it } from "vitest";

import { render, screen } from "../../../test-utils/render";
import { CardSkeleton } from "../CardSkeleton";
import { DetailSkeleton } from "../DetailSkeleton";
import { FormSkeleton } from "../FormSkeleton";
import { ListSkeleton } from "../ListSkeleton";
import { TableSkeleton } from "../TableSkeleton";

describe("Skeleton components", () => {
  it("renders CardSkeleton default and variants", () => {
    const { rerender } = render(<CardSkeleton count={2} />);
    expect(screen.getAllByText((_, el) => el?.className.includes("rounded-lg border") ?? false).length).toBeGreaterThan(0);

    rerender(<CardSkeleton count={1} variant="horizontal" />);
    expect(screen.getByText((_, el) => el?.className.includes("h-[120px] w-[160px]") ?? false)).toBeInTheDocument();

    rerender(<CardSkeleton count={1} variant="compact" />);
    expect(screen.getByText((_, el) => el?.className.includes("h-8 w-8") ?? false)).toBeInTheDocument();
  });

  it("renders DetailSkeleton options", () => {
    render(<DetailSkeleton fields={3} showTabs tabCount={3} />);
    expect(screen.getAllByText((_, el) => el?.className.includes("h-5") ?? false).length).toBeGreaterThan(0);
  });

  it("renders FormSkeleton with field variants", () => {
    render(
      <FormSkeleton
        fields={[
          { type: "textarea", span: 2 },
          { type: "switch" },
          { type: "checkbox" },
          { type: "radio" },
          { type: "file" }
        ]}
        showActions
      />
    );

    expect(screen.getAllByText((_, el) => el?.className.includes("animate-pulse") ?? false).length).toBeGreaterThan(5);
  });

  it("renders ListSkeleton variants", () => {
    const { rerender } = render(<ListSkeleton count={2} showAction />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    rerender(<ListSkeleton avatarVariant="square" count={1} showAvatar />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders TableSkeleton with options", () => {
    const { rerender } = render(<TableSkeleton columns={3} rows={2} showCheckbox />);
    expect(screen.getAllByText((_, el) => el?.className.includes("animate-pulse") ?? false).length).toBeGreaterThan(3);

    rerender(<TableSkeleton rows={1} showPagination={false} showToolbar={false} />);
    expect(screen.getAllByText((_, el) => el?.className.includes("animate-pulse") ?? false).length).toBeGreaterThan(1);
  });
});
