import { useCallback, useState } from "react";

type ColumnEditState =
  | { active: false }
  | { active: true; columnId: string; bulkValue: unknown; isSaving: boolean };

type UseEntityTableColumnEditOptions = {
  onSaveBulkColumn?: (columnId: string, value: unknown, rowIds: string[]) => Promise<void>;
};

export function useEntityTableColumnEdit({ onSaveBulkColumn }: UseEntityTableColumnEditOptions) {
  const [state, setState] = useState<ColumnEditState>({ active: false });

  const startEditColumn = useCallback((columnId: string) => {
    setState({ active: true, columnId, bulkValue: undefined, isSaving: false });
  }, []);

  const cancelEditColumn = useCallback(() => {
    setState({ active: false });
  }, []);

  const setBulkColumnValue = useCallback((value: unknown) => {
    setState((prev) => {
      if (!prev.active) return prev;
      return { ...prev, bulkValue: value };
    });
  }, []);

  const saveBulkColumn = useCallback(
    async (selectedRowIds: string[]) => {
      if (!state.active) return;

      const { columnId, bulkValue } = state;

      setState((prev) => (prev.active ? { ...prev, isSaving: true } : prev));

      try {
        await onSaveBulkColumn?.(columnId, bulkValue, selectedRowIds);
        setState({ active: false });
      } finally {
        setState((prev) => (prev.active ? { ...prev, isSaving: false } : prev));
      }
    },
    [state, onSaveBulkColumn],
  );

  const isColumnEditing = useCallback(
    (columnId: string) => state.active && state.columnId === columnId,
    [state],
  );

  return {
    columnEditState: state,
    startEditColumn,
    cancelEditColumn,
    setBulkColumnValue,
    saveBulkColumn,
    isColumnEditing,
    activeBulkValue: state.active ? state.bulkValue : undefined,
    isColumnSaving: state.active ? state.isSaving : false,
  };
}
