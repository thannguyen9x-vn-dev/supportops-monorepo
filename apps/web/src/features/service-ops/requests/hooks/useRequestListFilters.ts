import { useEffect, useMemo, useState } from "react";

import type { RequestFilters, RequestTabKey } from "../components/list/request-list.types";
import { INITIAL_FILTERS } from "../components/list/request-list.types";

export function useRequestListFilters(initialTab: RequestTabKey) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<RequestFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RequestFilters>(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [activeTabForQuery, setActiveTabForQuery] = useState<RequestTabKey>(initialTab);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(appliedFilters.search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [appliedFilters.search]);

  const hasActiveFilters = Boolean(
    appliedFilters.status ||
      appliedFilters.serviceType ||
      appliedFilters.assignee ||
      appliedFilters.location ||
      appliedFilters.slaHealth ||
      appliedFilters.updatedToday,
  );

  const hasPendingFilterChanges = useMemo(() => {
    const nonSearchKeys: (keyof RequestFilters)[] = [
      "status",
      "serviceType",
      "assignee",
      "location",
      "slaHealth",
      "updatedToday",
    ];

    return nonSearchKeys.some((key) => draftFilters[key] !== appliedFilters[key]);
  }, [draftFilters, appliedFilters]);

  return {
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    draftFilters,
    setDraftFilters,
    appliedFilters,
    setAppliedFilters,
    debouncedSearch,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    activeTabForQuery,
    setActiveTabForQuery,
    hasActiveFilters,
    hasPendingFilterChanges,
  };
}
