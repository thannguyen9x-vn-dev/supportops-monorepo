import { useEffect, useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";

import type { EntityColumnDef } from "./types";

type UseColumnVisibilityOptions<TData> = {
  columns: EntityColumnDef<TData>[];
  storageKey: string;
};

export function useColumnVisibility<TData>({
  columns,
  storageKey,
}: UseColumnVisibilityOptions<TData>) {
  // Initialize visibility state from localStorage or default to all visible
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as VisibilityState;
      }
    } catch (error) {
      console.error("Failed to parse column visibility from localStorage:", error);
    }

    // Default: all columns visible
    return {};
  });

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error("Failed to save column visibility to localStorage:", error);
    }
  }, [columnVisibility, storageKey]);

  // Get hideable columns (columns with hideable: true)
  const hideableColumns = columns.filter((col) => col.hideable);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false ? true : false,
    }));
  };

  // Show all columns
  const showAllColumns = () => {
    setColumnVisibility({});
  };

  // Check if a column is visible
  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId] !== false;
  };

  return {
    columnVisibility,
    setColumnVisibility,
    hideableColumns,
    toggleColumn,
    showAllColumns,
    isColumnVisible,
  };
}
