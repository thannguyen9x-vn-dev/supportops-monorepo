import { useCallback, useEffect, useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import type { Asset } from "@supportops/types";

export const INITIAL_ASSET_FILTERS = {
  search: "",
  status: "",
  assetTypeId: "",
  locationId: "",
};

export type AssetListFilters = typeof INITIAL_ASSET_FILTERS;

function getSortableValue(asset: Asset, columnId: string): number | string {
  switch (columnId) {
    case "assetCode":
      return asset.assetCode;
    case "name":
      return asset.name;
    case "assetType":
      return asset.assetType?.name ?? "";
    case "locationId":
      return asset.locationId;
    case "status":
      return asset.status;
    case "updatedAt":
      return new Date(asset.updatedAt).getTime();
    default:
      return "";
  }
}

export function useAssetFilters() {
  const [draftFilters, setDraftFilters] = useState<AssetListFilters>(INITIAL_ASSET_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AssetListFilters>(INITIAL_ASSET_FILTERS);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(appliedFilters.search);
      setPageIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [appliedFilters.search]);

  const hasPendingFilterChanges = useMemo(
    () =>
      draftFilters.status !== appliedFilters.status ||
      draftFilters.assetTypeId !== appliedFilters.assetTypeId ||
      draftFilters.locationId !== appliedFilters.locationId,
    [appliedFilters, draftFilters],
  );

  const hasActiveFilters = useMemo(
    () => Boolean(appliedFilters.search || appliedFilters.status || appliedFilters.assetTypeId || appliedFilters.locationId),
    [appliedFilters],
  );

  const sortAssets = useCallback((assets: Asset[], sorting: SortingState) => {
    const sortingState = sorting[0];
    if (!sortingState) return assets;

    return [...assets].sort((left, right) => {
      const leftValue = getSortableValue(left, sortingState.id);
      const rightValue = getSortableValue(right, sortingState.id);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortingState.desc ? rightValue - leftValue : leftValue - rightValue;
      }

      const compare = String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: "base" });
      return sortingState.desc ? -compare : compare;
    });
  }, []);

  const setDraftFilter = <TKey extends keyof AssetListFilters>(key: TKey, value: AssetListFilters[TKey]) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPageIndex(0);
    setAppliedFilters((prev) => ({ ...draftFilters, search: prev.search }));
  };

  const cancelDraftFilters = () => {
    setDraftFilters((prev) => ({ ...appliedFilters, search: prev.search }));
    setIsFilterPanelOpen(false);
  };

  const clearFilters = () => {
    setPageIndex(0);
    setDraftFilters(INITIAL_ASSET_FILTERS);
    setAppliedFilters(INITIAL_ASSET_FILTERS);
  };

  const setSearch = (value: string) => {
    setPageIndex(0);
    setDraftFilters((prev) => ({ ...prev, search: value }));
    setAppliedFilters((prev) => ({ ...prev, search: value }));
  };

  return {
    draftFilters,
    appliedFilters,
    debouncedSearch,
    isFilterPanelOpen,
    pageIndex,
    pageSize,
    hasPendingFilterChanges,
    hasActiveFilters,
    sortAssets,
    setDraftFilters,
    setAppliedFilters,
    setDraftFilter,
    setIsFilterPanelOpen,
    setPageIndex,
    setPageSize,
    applyFilters,
    cancelDraftFilters,
    clearFilters,
    setSearch,
  };
}
