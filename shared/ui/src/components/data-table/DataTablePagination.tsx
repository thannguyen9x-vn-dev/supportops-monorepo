"use client";

import type { Table } from "@tanstack/react-table";

export interface DataTablePaginationLabels {
  showing?: (from: number, to: number, total: number) => string;
  rows?: string;
  page?: string;
  of?: string;
  outOf?: string;
  previous?: string;
  next?: string;
}

interface DataTablePaginationProps<T> {
  table: Table<T>;
  totalRows?: number;
  pageSizeOptions?: number[];
  labels?: DataTablePaginationLabels;
}

function getPageItems(pageIndex: number, pageCount: number): Array<number | "ellipsis"> {
  const currentPage = pageIndex + 1;

  if (pageCount <= 8) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", pageCount];
  }

  if (currentPage >= pageCount - 3) {
    return [1, "ellipsis", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pageCount];
}

export function DataTablePagination<T>({
  table,
  totalRows,
  pageSizeOptions = [10, 20, 30, 50, 100],
  labels
}: DataTablePaginationProps<T>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = totalRows ?? table.getRowCount();
  const pageCount = table.getPageCount();
  const pageItems = getPageItems(pageIndex, pageCount);

  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);
  const showingCount = total === 0 ? 0 : to - from + 1;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "12px 0 0 0",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          color: "var(--mui-palette-text-secondary)",
          fontSize: "14px",
          lineHeight: 1.4,
          minWidth: "200px",
        }}
      >
        {labels?.showing
          ? labels.showing(from, to, total)
          : `Showing ${showingCount} ${labels?.outOf ?? "out of"} ${total}`}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "center", flex: 1 }}>
        <button
          aria-label={labels?.previous ?? "Previous page"}
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            color: "var(--mui-palette-text-secondary)",
            opacity: table.getCanPreviousPage() ? 1 : 0.4,
            cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
            fontSize: "24px",
            lineHeight: 1,
          }}
          type="button"
        >
          {"‹"}
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              style={{ width: "24px", textAlign: "center", color: "var(--mui-palette-text-secondary)" }}
            >
              ...
            </span>
          ) : (
            <button
              aria-label={`Page ${item}`}
              aria-current={item === pageIndex + 1 ? "page" : undefined}
              key={`page-${item}`}
              onClick={() => table.setPageIndex(item - 1)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border:
                  item === pageIndex + 1
                    ? "1px solid rgba(var(--mui-palette-primary-mainChannel) / 0.28)"
                    : "1px solid var(--mui-palette-divider)",
                background:
                  item === pageIndex + 1
                    ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)"
                    : "transparent",
                color:
                  item === pageIndex + 1
                    ? "var(--mui-palette-primary-main)"
                    : "var(--mui-palette-text-secondary)",
                fontWeight: item === pageIndex + 1 ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
              type="button"
            >
              {item}
            </button>
          ),
        )}

        <button
          aria-label={labels?.next ?? "Next page"}
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            color: "var(--mui-palette-text-secondary)",
            opacity: table.getCanNextPage() ? 1 : 0.4,
            cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
            fontSize: "24px",
            lineHeight: 1,
          }}
          type="button"
        >
          {"›"}
        </button>
      </div>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          color: "var(--mui-palette-text-secondary)",
          fontSize: "14px",
          marginLeft: "auto",
        }}
      >
        <span>{labels?.rows ?? "Rows per page"}</span>
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <select
            aria-label={labels?.rows ?? "Rows per page"}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            style={{
              height: "40px",
              minWidth: "76px",
              borderRadius: "8px",
              border: "1px solid var(--mui-palette-divider)",
              background: "var(--mui-palette-background-paper)",
              color: "var(--mui-palette-text-primary)",
              padding: "0 36px 0 12px",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
            value={pageSize}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: "12px",
              pointerEvents: "none",
              color: "var(--mui-palette-text-secondary)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
        </span>
      </label>
    </div>
  );
}
