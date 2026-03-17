import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnPinningState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState
} from "@tanstack/react-table";

import type { UseDataTableOptions } from "./types";
import { useTableInlineEdit } from "./useTableInlineEdit";

export function useDataTable<T>(options: UseDataTableOptions<T>) {
  const {
    columns,
    data,
    totalRows,
    rowId = "id" as keyof T,
    serverSide = false,
    pageIndex = 0,
    pageSize = 20,
    enableSelection = false,
    enableInlineEdit = false,
    onStateChange,
    pinnedColumns,
    defaultColumn,
    sorting: externalSorting,
    onSortingChange: externalOnSortingChange,
    columnVisibility: externalColumnVisibility,
  } = options;

  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex,
    pageSize
  });
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: pinnedColumns?.left ?? [],
    right: pinnedColumns?.right ?? []
  });

  // Use external state if provided, otherwise use internal state
  const sorting = externalSorting !== undefined ? externalSorting : internalSorting;
  const setSorting = externalOnSortingChange !== undefined ? externalOnSortingChange : setInternalSorting;
  const columnVisibility = externalColumnVisibility !== undefined ? externalColumnVisibility : internalColumnVisibility;
  const setColumnVisibility = externalColumnVisibility !== undefined ? () => {} : setInternalColumnVisibility;

  const inlineEdit = useTableInlineEdit<T>({ enabled: enableInlineEdit });

  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === pageIndex ? prev : { ...prev, pageIndex }
    );
  }, [pageIndex]);

  useEffect(() => {
    setPagination((prev) =>
      prev.pageSize === pageSize ? prev : { ...prev, pageSize }
    );
  }, [pageSize]);

  useEffect(() => {
    onStateChange?.({ pagination, sorting, columnFilters, globalFilter });
  }, [pagination, sorting, columnFilters, globalFilter, onStateChange]);

  const getRowId = useCallback(
    (row: T): string => {
      if (typeof rowId === "function") return rowId(row);
      return String(row[rowId]);
    },
    [rowId]
  );

  const table = useReactTable({
    data,
    columns,
    defaultColumn: defaultColumn ?? { size: 180, minSize: 120, maxSize: 400 },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination,
      columnPinning
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide && totalRows ? Math.ceil(totalRows / pagination.pageSize) : undefined,
    getRowId,
    enableRowSelection: enableSelection
  });

  const selectedRowIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);
  const selectedRows = useMemo(() => table.getSelectedRowModel().rows.map((row) => row.original), [table, rowSelection]);
  const hasActiveFilters = columnFilters.length > 0 || globalFilter.length > 0;

  const clearAllFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
  }, []);

  const clearSelection = useCallback(() => setRowSelection({}), []);
  const goToPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, pageIndex: page })), []);
  const setPageSize = useCallback((size: number) => setPagination({ pageIndex: 0, pageSize: size }), []);

  return {
    table,
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    pagination,
    setGlobalFilter,
    goToPage,
    setPageSize,
    selectedRowIds,
    selectedRows,
    clearSelection,
    hasActiveFilters,
    clearAllFilters,
    ...(enableInlineEdit ? { inlineEdit } : {}),
    totalRows: totalRows ?? data.length,
    pageCount: table.getPageCount(),
    currentPage: pagination.pageIndex,
    isFirstPage: !table.getCanPreviousPage(),
    isLastPage: !table.getCanNextPage()
  };
}

export type UseDataTableReturn<T> = ReturnType<typeof useDataTable<T>>;
