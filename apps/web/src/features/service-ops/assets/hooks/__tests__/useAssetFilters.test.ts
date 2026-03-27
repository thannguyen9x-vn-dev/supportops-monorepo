import { act, renderHook } from "@testing-library/react";

import { useAssetFilters } from "../useAssetFilters";

describe("useAssetFilters", () => {
  it("applies search and updates debounced value", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useAssetFilters());

    act(() => {
      result.current.setSearch("router");
    });

    expect(result.current.appliedFilters.search).toBe("router");
    expect(result.current.debouncedSearch).toBe("");

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearch).toBe("router");
    jest.useRealTimers();
  });

  it("tracks pending and active filters", () => {
    const { result } = renderHook(() => useAssetFilters());

    act(() => {
      result.current.setDraftFilter("status", "IN_USE");
    });

    expect(result.current.hasPendingFilterChanges).toBe(true);

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.hasPendingFilterChanges).toBe(false);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("sorts assets by updatedAt descending", () => {
    const { result } = renderHook(() => useAssetFilters());

    const sorted = result.current.sortAssets(
      [
        { id: "a", assetCode: "A", name: "A", locationId: "L1", status: "IN_USE", updatedAt: "2026-03-01T00:00:00.000Z" } as never,
        { id: "b", assetCode: "B", name: "B", locationId: "L2", status: "AVAILABLE", updatedAt: "2026-03-02T00:00:00.000Z" } as never,
      ],
      [{ id: "updatedAt", desc: true }],
    );

    expect(sorted[0]?.id).toBe("b");
  });
});
