import { useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";

import { useEntityTableColumnEdit } from "./useEntityTableColumnEdit";
import { useEntityTableFilter } from "./useEntityTableFilter";
import { useEntityTableRowForm } from "./useEntityTableRowForm";
import { useColumnVisibility } from "./useColumnVisibility";
import type { EntityTableConfig, EntityTableInstance, TableEditState } from "./types";

export function useEntityTable<TData extends object, TFilters extends object>(
  config: EntityTableConfig<TData, TFilters>,
): EntityTableInstance<TData, TFilters> {
  const {
    data,
    columns,
    rowId,
    initialFilters,
    onApplyFilters,
    pageIndex = 0,
    pageSize = 20,
    totalRows,
    serverSide = false,
    rowSaveTrigger = "onManualSave",
    rowDensity = "comfortable",
    pinnedColumns,
    defaultColumn,
    columnVisibilityStorageKey,
    onSaveRow,
    onSaveBulkColumn,
  } = config;

  // ── Sub-hooks ─────────────────────────────────────────────────────────────

  const filter = useEntityTableFilter({ initialFilters, onApplyFilters });

  const rowForm = useEntityTableRowForm<TData>({ onSaveRow });

  const columnEdit = useEntityTableColumnEdit({ onSaveBulkColumn });

  // ── Sorting state ─────────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>([]);

  // ── Column visibility ─────────────────────────────────────────────────────
  const columnVisibilityHook = useColumnVisibility({
    columns,
    storageKey: columnVisibilityStorageKey || "table-columns-visibility-default",
  });

  // ── Exclusive mode guard ───────────────────────────────────────────────────
  // When switching between row-mode and column-mode, the callers
  // (startEditRow / startEditColumn) are responsible for confirming with the
  // user before calling. The hooks themselves don't show dialogs — that's UI
  // concern. The guard here just prevents silent state corruption:
  // - startEditRow is a no-op when column-edit is active
  // - startEditColumn is a no-op when any row is in edit mode

  const startEditRow = (rowId_: string) => {
    if (columnEdit.columnEditState.active) return; // caller should confirm first
    rowForm.startEditRow(rowId_);
  };

  const startEditColumn = (columnId: string) => {
    if (rowForm.editingRowIds.size > 0) return; // caller should confirm first
    columnEdit.startEditColumn(columnId);
  };

  // ── Compose editState for consumers ──────────────────────────────────────

  const editState = useMemo((): TableEditState<TData> => {
    if (columnEdit.columnEditState.active) {
      return {
        mode: "column",
        columnId: columnEdit.columnEditState.columnId,
        bulkValue: columnEdit.columnEditState.bulkValue,
        isSaving: columnEdit.columnEditState.isSaving,
      };
    }

    if (rowForm.editingRowIds.size > 0) {
      return {
        mode: "row",
        editingRowIds: rowForm.editingRowIds,
        rowForms: new Map(Object.entries(rowForm.rowForms)) as Map<string, Partial<TData>>,
        savingRowIds: rowForm.savingRowIds,
      };
    }

    return { mode: "view" };
  }, [columnEdit.columnEditState, rowForm.editingRowIds, rowForm.rowForms, rowForm.savingRowIds]);

  // ── Assemble the instance ─────────────────────────────────────────────────

  return {
    _tableConfig: {
      data,
      columns,
      rowId,
      pageIndex,
      pageSize,
      totalRows: totalRows ?? data.length,
      serverSide,
      rowSaveTrigger,
      rowDensity,
      pinnedColumns,
      defaultColumn,
      columnVisibilityStorageKey,
      onSaveRow,
      onSaveBulkColumn,
    },

    // Filter
    draftFilters: filter.draftFilters,
    appliedFilters: filter.appliedFilters,
    setDraftFilter: filter.setDraftFilter,
    applyFilters: filter.applyFilters,
    clearFilters: filter.clearFilters,
    hasActiveFilters: filter.hasActiveFilters,

    // Sorting & Visibility
    sorting,
    setSorting,
    columnVisibility: columnVisibilityHook.columnVisibility,
    setColumnVisibility: columnVisibilityHook.setColumnVisibility,
    toggleColumn: columnVisibilityHook.toggleColumn,
    showAllColumns: columnVisibilityHook.showAllColumns,
    isColumnVisible: columnVisibilityHook.isColumnVisible,

    // Edit state machine
    editState,

    // Row form
    startEditRow,
    cancelEditRow: rowForm.cancelEditRow,
    setRowFieldValue: rowForm.setRowFieldValue,
    getRowFieldValue: rowForm.getRowFieldValue,
    saveRow: rowForm.saveRow,
    isRowEditing: rowForm.isRowEditing,
    isRowSaving: rowForm.isRowSaving,
    isRowDirty: rowForm.isRowDirty,

    // Column bulk-edit
    startEditColumn,
    cancelEditColumn: columnEdit.cancelEditColumn,
    setBulkColumnValue: columnEdit.setBulkColumnValue,
    saveBulkColumn: columnEdit.saveBulkColumn,
    isColumnEditing: columnEdit.isColumnEditing,
  };
}
