import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useVirtualList } from "../useVirtualList";

describe("useVirtualList", () => {
  const items = Array.from({ length: 200 }, (_, index) => ({ id: index, name: `Item ${index}` }));

  it("returns scrollRef and virtual items", () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        estimateSize: 40
      })
    );

    expect(result.current.scrollRef).toBeDefined();
    expect(Array.isArray(result.current.virtualItems)).toBe(true);
    expect(result.current.virtualItems.length).toBeGreaterThan(0);
  });

  it("computes total size from item count and estimate", () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        estimateSize: 40
      })
    );

    expect(result.current.totalSize).toBe(200 * 40);
  });

  it("handles empty items", () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items: [],
        estimateSize: 40
      })
    );

    expect(result.current.virtualItems).toHaveLength(0);
    expect(result.current.totalSize).toBe(0);
  });

  it("updates total size when item list changes", () => {
    const { result, rerender } = renderHook(
      ({ hookItems }) =>
        useVirtualList({
          items: hookItems,
          estimateSize: 40
        }),
      { initialProps: { hookItems: items } }
    );

    expect(result.current.totalSize).toBe(200 * 40);
    rerender({ hookItems: items.slice(0, 50) });
    expect(result.current.totalSize).toBe(50 * 40);
  });

  it("supports scrollToIndex API", () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        estimateSize: 40
      })
    );

    expect(typeof result.current.scrollToIndex).toBe("function");
  });
});
