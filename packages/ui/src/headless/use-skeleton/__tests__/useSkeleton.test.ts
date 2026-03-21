import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSkeleton } from "../useSkeleton";

describe("useSkeleton", () => {
  it("generates the expected item count", () => {
    const { result } = renderHook(() => useSkeleton({ count: 5 }));
    expect(result.current.items).toHaveLength(5);
  });

  it("uses default key prefix", () => {
    const { result } = renderHook(() => useSkeleton({ count: 2 }));
    expect(result.current.items).toEqual(["skeleton-0", "skeleton-1"]);
  });

  it("uses custom key prefix", () => {
    const { result } = renderHook(() => useSkeleton({ count: 2, keyPrefix: "row" }));
    expect(result.current.items).toEqual(["row-0", "row-1"]);
  });

  it("returns accessibility container props", () => {
    const { result } = renderHook(() => useSkeleton({ count: 1 }));
    expect(result.current.containerProps).toEqual({
      "aria-busy": true,
      "aria-label": "Loading content",
      role: "status"
    });
  });

  it("memoizes items for unchanged params", () => {
    const { result, rerender } = renderHook(() => useSkeleton({ count: 3, keyPrefix: "x" }));
    const initial = result.current.items;
    rerender();
    expect(result.current.items).toBe(initial);
  });
});
