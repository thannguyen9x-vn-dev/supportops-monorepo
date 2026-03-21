import { useCallback } from "react";
import type { Table } from "@tanstack/react-table";

export function useTablePagination<T>(table: Table<T>) {
  const goToPage = useCallback(
    (pageIndex: number) => {
      table.setPageIndex(pageIndex);
    },
    [table]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      table.setPageSize(pageSize);
      table.setPageIndex(0);
    },
    [table]
  );

  return {
    pageIndex: table.getState().pagination.pageIndex,
    pageSize: table.getState().pagination.pageSize,
    pageCount: table.getPageCount(),
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
    goToPage,
    setPageSize,
    nextPage: table.nextPage,
    previousPage: table.previousPage,
    firstPage: table.firstPage,
    lastPage: table.lastPage
  };
}
