import { useCallback, useMemo, useState } from "react";

type UseEntityTableFilterOptions<TFilters extends object> = {
  initialFilters: TFilters;
  onApplyFilters?: (filters: TFilters) => void;
};

export function useEntityTableFilter<TFilters extends object>({
  initialFilters,
  onApplyFilters,
}: UseEntityTableFilterOptions<TFilters>) {
  const [draftFilters, setDraftFilters] = useState<TFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<TFilters>(initialFilters);

  const setDraftFilter = useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
      setDraftFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const applyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    onApplyFilters?.(draftFilters);
  }, [draftFilters, onApplyFilters]);

  const clearFilters = useCallback(() => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    onApplyFilters?.(initialFilters);
  }, [initialFilters, onApplyFilters]);

  // A filter is "active" if any key differs from the initial value.
  const hasActiveFilters = useMemo(() => {
    return (Object.keys(appliedFilters) as (keyof TFilters)[]).some(
      (key) => appliedFilters[key] !== initialFilters[key],
    );
  }, [appliedFilters, initialFilters]);

  return {
    draftFilters,
    appliedFilters,
    setDraftFilter,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  };
}
