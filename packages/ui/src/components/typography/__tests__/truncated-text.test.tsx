import { describe, expect, it } from "vitest";

import { render, screen } from "../../../test-utils/render";
import { TruncatedText } from "../TruncatedText";

describe("TruncatedText", () => {
  it("renders with default truncation behavior", () => {
    render(<TruncatedText>Long content</TruncatedText>);

    const element = screen.getByText("Long content");
    expect(element.tagName).toBe("SPAN");
    expect(element).toHaveStyle({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
  });

  it("applies title and custom style props", () => {
    render(
      <TruncatedText style={{ maxWidth: 120 }} title="Full title">
        Text
      </TruncatedText>
    );

    const element = screen.getByText("Text");
    expect(element).toHaveAttribute("title", "Full title");
    expect(element).toHaveStyle({ maxWidth: "120px" });
  });
});
