import { useCallback, useMemo, useState } from "react";

import type { InlineEditState } from "./types";

interface UseTableInlineEditOptions {
  enabled: boolean;
}

export function useTableInlineEdit<T>({ enabled }: UseTableInlineEditOptions): InlineEditState<T> {
  const [editingCells, setEditingCells] = useState<Record<string, boolean>>({});
  const [pendingEdits, setPendingEdits] = useState<Record<string, Partial<T>>>({});

  const startEditing = useCallback(
    (rowId: string, columnId: string) => {
      if (!enabled) return;
      setEditingCells((prev) => ({ ...prev, [`${rowId}:${columnId}`]: true }));
    },
    [enabled]
  );

  const cancelEditing = useCallback((rowId: string, columnId: string) => {
    setEditingCells((prev) => {
      const next = { ...prev };
      delete next[`${rowId}:${columnId}`];
      return next;
    });

    setPendingEdits((prev) => {
      const rowEdits = prev[rowId];
      if (!rowEdits) return prev;

      const next = { ...prev };
      const nextRow = { ...rowEdits };
      delete nextRow[columnId as keyof T];

      if (Object.keys(nextRow).length === 0) {
        delete next[rowId];
      } else {
        next[rowId] = nextRow;
      }

      return next;
    });
  }, []);

  const updateCell = useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      if (!enabled) return;
      setPendingEdits((prev) => ({
        ...prev,
        [rowId]: {
          ...(prev[rowId] ?? {}),
          [columnId]: value as T[keyof T]
        }
      }));
    },
    [enabled]
  );

  const discardRow = useCallback((rowId: string) => {
    setEditingCells((prev) => {
      const next: Record<string, boolean> = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith(`${rowId}:`)) {
          next[key] = value;
        }
      });
      return next;
    });

    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  }, []);

  const discardAll = useCallback(() => {
    setEditingCells({});
    setPendingEdits({});
  }, []);

  const getAllChanges = useCallback(
    () => Object.entries(pendingEdits).map(([rowId, changes]) => ({ rowId, changes })),
    [pendingEdits]
  );

  const isEditing = useCallback(
    (rowId: string, columnId: string) => Boolean(editingCells[`${rowId}:${columnId}`]),
    [editingCells]
  );

  const getPendingValue = useCallback(
    (rowId: string, columnId: string) => pendingEdits[rowId]?.[columnId as keyof T],
    [pendingEdits]
  );

  const dirtyRowCount = useMemo(() => Object.keys(pendingEdits).length, [pendingEdits]);

  return {
    editingCells,
    pendingEdits,
    dirtyRowCount,
    startEditing,
    cancelEditing,
    updateCell,
    discardRow,
    discardAll,
    getAllChanges,
    isEditing,
    getPendingValue
  };
}
