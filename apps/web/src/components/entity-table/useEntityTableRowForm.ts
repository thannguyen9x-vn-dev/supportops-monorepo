import { useCallback, useState } from "react";

type UseEntityTableRowFormOptions<TData extends object> = {
  onSaveRow?: (rowId: string, changes: Partial<TData>, original: TData) => Promise<void>;
};

export function useEntityTableRowForm<TData extends object>({
  onSaveRow,
}: UseEntityTableRowFormOptions<TData>) {
  // Set of rowIds currently in edit mode
  const [editingRowIds, setEditingRowIds] = useState<Set<string>>(new Set());

  // Map<rowId, pending field changes>
  // Using a plain object instead of Map so setState can detect reference changes.
  const [rowForms, setRowForms] = useState<Record<string, Partial<TData>>>({});

  // Set of rowIds currently being saved (showing loading indicator)
  const [savingRowIds, setSavingRowIds] = useState<Set<string>>(new Set());

  // ── Enter edit mode ───────────────────────────────────────────────────────

  const startEditRow = useCallback((rowId: string) => {
    setEditingRowIds((prev) => {
      if (prev.has(rowId)) return prev;
      const next = new Set(prev);
      next.add(rowId);
      return next;
    });
    // Initialize an empty form for this row (preserves any previously dirty values)
    setRowForms((prev) => {
      if (rowId in prev) return prev;
      return { ...prev, [rowId]: {} };
    });
  }, []);

  // ── Leave edit mode without saving ───────────────────────────────────────

  const cancelEditRow = useCallback((rowId: string) => {
    setEditingRowIds((prev) => {
      if (!prev.has(rowId)) return prev;
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    setRowForms((prev) => {
      if (!(rowId in prev)) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  }, []);

  // ── Update a single field value in the pending form ───────────────────────

  const setRowFieldValue = useCallback(
    (rowId: string, field: keyof TData, value: unknown) => {
      setRowForms((prev) => ({
        ...prev,
        [rowId]: {
          ...(prev[rowId] ?? {}),
          [field]: value as TData[keyof TData],
        },
      }));
    },
    [],
  );

  // ── Read a field value — pending overrides original ───────────────────────

  const getRowFieldValue = useCallback(
    (rowId: string, field: keyof TData, originalValue: unknown): unknown => {
      const pending = rowForms[rowId];
      if (pending && field in pending) return pending[field];
      return originalValue;
    },
    [rowForms],
  );

  // ── Save a row ────────────────────────────────────────────────────────────

  const saveRow = useCallback(
    async (rowId: string, original: TData) => {
      const changes = rowForms[rowId];
      if (!changes || Object.keys(changes).length === 0) {
        // Nothing changed — just exit edit mode silently
        cancelEditRow(rowId);
        return;
      }

      setSavingRowIds((prev) => {
        const next = new Set(prev);
        next.add(rowId);
        return next;
      });

      try {
        await onSaveRow?.(rowId, changes, original);
        // Success → exit edit mode and clear pending form
        cancelEditRow(rowId);
      } finally {
        setSavingRowIds((prev) => {
          const next = new Set(prev);
          next.delete(rowId);
          return next;
        });
      }
    },
    [rowForms, onSaveRow, cancelEditRow],
  );

  // ── Query helpers ─────────────────────────────────────────────────────────

  const isRowEditing = useCallback(
    (rowId: string) => editingRowIds.has(rowId),
    [editingRowIds],
  );

  const isRowSaving = useCallback(
    (rowId: string) => savingRowIds.has(rowId),
    [savingRowIds],
  );

  const isRowDirty = useCallback(
    (rowId: string) => {
      const form = rowForms[rowId];
      return !!form && Object.keys(form).length > 0;
    },
    [rowForms],
  );

  return {
    editingRowIds,
    rowForms,
    savingRowIds,
    startEditRow,
    cancelEditRow,
    setRowFieldValue,
    getRowFieldValue,
    saveRow,
    isRowEditing,
    isRowSaving,
    isRowDirty,
  };
}
