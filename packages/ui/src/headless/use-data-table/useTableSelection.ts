import { useMemo } from "react";
import type { Table } from "@tanstack/react-table";

export function useTableSelection<T>(table: Table<T>) {
  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    [table, table.getState().rowSelection]
  );

  return {
    selectedRows,
    selectedRowIds: Object.keys(table.getState().rowSelection),
    selectedCount: selectedRows.length,
    clearSelection: () => table.resetRowSelection(),
    toggleAllRowsSelected: table.toggleAllRowsSelected
  };
}
