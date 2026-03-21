import { useEffect, useState } from "react";
import type { ColumnSizingState } from "@tanstack/react-table";

type UseColumnSizingOptions = {
  storageKey?: string;
};

export function useColumnSizing({ storageKey }: UseColumnSizingOptions) {
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    if (!storageKey || typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored) as ColumnSizingState;
    } catch {
      // ignore parse errors
    }

    return {};
  });

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(columnSizing));
    } catch {
      // ignore quota errors
    }
  }, [columnSizing, storageKey]);

  return { columnSizing, setColumnSizing };
}
