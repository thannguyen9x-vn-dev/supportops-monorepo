import { useEffect, useMemo, useState } from "react";
import type { ColumnOrderState } from "@tanstack/react-table";

type UseColumnOrderOptions = {
  /** All current column IDs in definition order — used to initialise and merge stored order. */
  allColumnIds: string[];
  storageKey?: string;
};

export function useColumnOrder({ allColumnIds, storageKey }: UseColumnOrderOptions) {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    if (!storageKey || typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Keep only IDs that still exist; append new ones at the end
        const valid = parsed.filter((id) => allColumnIds.includes(id));
        const added = allColumnIds.filter((id) => !valid.includes(id));
        return [...valid, ...added];
      }
    } catch {
      // ignore parse errors
    }

    return [];
  });

  // Persist whenever order changes
  useEffect(() => {
    if (!storageKey || typeof window === "undefined" || columnOrder.length === 0) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(columnOrder));
    } catch {
      // ignore quota errors
    }
  }, [columnOrder, storageKey]);

  // Re-sync when columns are added/removed between renders (e.g. feature flags)
  const sortedAllIds = useMemo(() => [...allColumnIds].sort().join(","), [allColumnIds]);
  useEffect(() => {
    if (columnOrder.length === 0) return;

    const valid = columnOrder.filter((id) => allColumnIds.includes(id));
    const added = allColumnIds.filter((id) => !valid.includes(id));
    if (added.length > 0 || valid.length !== columnOrder.length) {
      setColumnOrder([...valid, ...added]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAllIds]);

  return { columnOrder, setColumnOrder };
}
