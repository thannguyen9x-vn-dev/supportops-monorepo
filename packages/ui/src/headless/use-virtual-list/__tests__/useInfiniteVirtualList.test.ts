import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useInfiniteVirtualList } from "../useInfiniteVirtualList";

describe("useInfiniteVirtualList", () => {
  it("returns virtual state and loading flag", () => {
    const onLoadMore = vi.fn();
    const items = Array.from({ length: 50 }, (_, index) => ({ id: index }));

    const { result } = renderHook(() =>
      useInfiniteVirtualList({
        items,
        estimateSize: 40,
        hasMore: true,
        isLoadingMore: false,
        onLoadMore
      })
    );

    expect(result.current.virtualItems.length).toBeGreaterThan(0);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it("triggers onLoadMore when near the end", () => {
    const onLoadMore = vi.fn();
    const items = Array.from({ length: 8 }, (_, index) => ({ id: index }));

    renderHook(() =>
      useInfiniteVirtualList({
        items,
        estimateSize: 40,
        hasMore: true,
        isLoadingMore: false,
        loadMoreThreshold: 5,
        onLoadMore
      })
    );

    expect(onLoadMore).toHaveBeenCalled();
  });

  it("does not trigger onLoadMore when hasMore is false", () => {
    const onLoadMore = vi.fn();
    const items = Array.from({ length: 8 }, (_, index) => ({ id: index }));

    renderHook(() =>
      useInfiniteVirtualList({
        items,
        estimateSize: 40,
        hasMore: false,
        isLoadingMore: false,
        onLoadMore
      })
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not trigger onLoadMore while already loading", () => {
    const onLoadMore = vi.fn();
    const items = Array.from({ length: 8 }, (_, index) => ({ id: index }));

    renderHook(() =>
      useInfiniteVirtualList({
        items,
        estimateSize: 40,
        hasMore: true,
        isLoadingMore: true,
        onLoadMore
      })
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });
});
