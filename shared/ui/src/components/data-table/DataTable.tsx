"use client";

import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { cn } from "../../utils/cn";
import { DataTablePagination, type DataTablePaginationLabels } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROW_HEIGHT: Record<"comfortable" | "compact", number> = {
  comfortable: 56,
  compact: 44,
};

const HEADER_HEIGHT = 48;

// ---------------------------------------------------------------------------
// Sticky helpers
// ---------------------------------------------------------------------------

function getStickyStyle(
  pinned: "left" | "right" | false,
  offsetLeft: number,
  offsetRight: number,
  background: string,
  zIndex: number,
): React.CSSProperties {
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? offsetLeft : undefined,
    right: pinned === "right" ? offsetRight : undefined,
    zIndex,
    background,
    // Shadow separates the sticky cell from scrolling content.
    // box-shadow avoids the double-border issue that border causes.
    boxShadow:
      pinned === "left"
        ? "2px 0 4px -2px rgba(0,0,0,0.10)"
        : "-2px 0 4px -2px rgba(0,0,0,0.10)",
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DataTableProps<T> {
  table: TanStackTable<T>;
  totalRows?: number;
  isLoading?: boolean;
  selectedCount?: number;
  dirtyRowCount?: number;
  onBulkDelete?: () => void;
  onSaveAll?: () => void;
  onDiscardAll?: () => void;
  onExport?: () => void;
  onRowClick?: (row: T) => void;
  highlightDirtyRows?: boolean;
  dirtyRowIds?: Set<string>;
  emptyState?: ReactNode;
  rowClassName?: (row: T) => string;
  paginationLabels?: DataTablePaginationLabels;
  /** "comfortable" = 56px rows (default) | "compact" = 44px rows */
  rowDensity?: "comfortable" | "compact";
  /** Fixed height for the scrollable table viewport. Keeps pagination position stable. */
  bodyHeight?: number | string;
  /** Max height for the scrollable table area; pagination stays visible below. */
  bodyMaxHeight?: number | string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<T>({
  table,
  totalRows,
  isLoading,
  selectedCount = 0,
  dirtyRowCount = 0,
  onBulkDelete,
  onSaveAll,
  onDiscardAll,
  onExport,
  onRowClick,
  highlightDirtyRows,
  dirtyRowIds,
  emptyState,
  rowClassName,
  paginationLabels,
  rowDensity = "comfortable",
  bodyHeight,
  bodyMaxHeight,
}: DataTableProps<T>) {
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const rowHeight = ROW_HEIGHT[rowDensity];

  // Compute table min-width from column sizes so horizontal scroll kicks in
  // only when the viewport is genuinely too narrow, not due to content shrink.
  const tableMinWidth = visibleColumns.reduce((sum, col) => sum + col.getSize(), 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
      }}
    >
      <DataTableToolbar
        dirtyRowCount={dirtyRowCount}
        onBulkDelete={onBulkDelete}
        onDiscardAll={onDiscardAll}
        onExport={onExport}
        onSaveAll={onSaveAll}
        selectedCount={selectedCount}
        table={table}
      />

      {/*
        Two-layer wrapper:
        ① Outer  — border + border-radius + overflow:hidden (clips radius visually)
        ② Inner  — overflow-x:auto (enables horizontal scroll)
        Separating them is required because overflow:hidden on the scroll container
        would break position:sticky on pinned columns.
      */}
      <div
        style={{
          borderRadius: 8,
          border: "1px solid var(--mui-palette-divider)",
          overflow: "hidden",
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? "none" : "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            overflowX: "auto",
            overflowY: "auto",
            height: bodyHeight,
            maxHeight: bodyMaxHeight,
            flex: bodyHeight ? undefined : 1,
            minHeight: 0,
          }}
        >
          <table
            style={{
              tableLayout: "fixed",
              width: "100%",
              minWidth: tableMinWidth,
              borderCollapse: "collapse",
              fontSize: 14,
              fontWeight: 400,
            }}
          >
            {/* colgroup gives table-layout:fixed the authoritative widths */}
            <colgroup>
              {visibleColumns.map((col) => (
                <col key={col.id} style={{ width: col.getSize() }} />
              ))}
            </colgroup>

            <thead
              style={{
                borderBottom: "1px solid var(--mui-palette-divider)",
                background: "var(--mui-palette-grey-50)",
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, headerIndex) => {
                    const pinned = header.column.getIsPinned();
                    const isLastColumn = headerIndex === headerGroup.headers.length - 1;
                    return (
                      <th
                        key={header.id}
                        className="text-left font-medium text-gray-500"
                        style={{
                          height: HEADER_HEIGHT,
                          padding: "0 16px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: 13,
                          fontWeight: 600,
                          textAlign: isLastColumn ? "right" : "left",
                          borderRight: isLastColumn ? "none" : "1px solid var(--mui-palette-divider)",
                          borderBottom: "1px solid var(--mui-palette-divider)",
                          ...getStickyStyle(
                            pinned,
                            header.column.getStart("left"),
                            header.column.getAfter("right"),
                            "var(--mui-palette-grey-50)",
                            // Pinned header sits above pinned body cells
                            3,
                          ),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    style={{ padding: "64px 0", textAlign: "center", color: "var(--mui-palette-text-secondary)" }}
                  >
                    {emptyState ?? "No data found"}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isDirty = highlightDirtyRows && dirtyRowIds?.has(row.id);
                  const isSelected = row.getIsSelected();

                  // Determine the effective row background so sticky cells can
                  // match — they need an explicit (non-transparent) background
                  // to cover content scrolling beneath them.
                  const rowBg = isSelected
                    ? "var(--mui-palette-action-selected)"
                    : isDirty
                      ? "rgba(234, 179, 8, 0.05)"
                      : "var(--mui-palette-background-paper)";

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors hover:bg-gray-50/60",
                        isSelected ? "bg-blue-50/50" : "",
                        isDirty ? "border-l-4 border-l-yellow-400 bg-yellow-50/50" : "",
                        onRowClick ? "cursor-pointer" : "",
                        rowClassName?.(row.original),
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => {
                        const pinned = cell.column.getIsPinned();
                        const isLastColumn = cellIndex === row.getVisibleCells().length - 1;
                        return (
                          <td
                            key={cell.id}
                            style={{
                              height: rowHeight,
                              padding: isLastColumn ? "0 8px 0 16px" : "0 16px",
                              verticalAlign: "middle",
                              fontSize: 14,
                              fontWeight: 400,
                              textAlign: isLastColumn ? "right" : "left",
                              borderRight: isLastColumn ? "none" : "1px solid var(--mui-palette-divider)",
                              borderBottom: "1px solid var(--mui-palette-divider)",
                              ...getStickyStyle(
                                pinned,
                                cell.column.getStart("left"),
                                cell.column.getAfter("right"),
                                rowBg,
                                1,
                              ),
                            }}
                          >
                            {/*
                              Truncation wrapper — clips overflowing text with
                              ellipsis. Block-level children (chips, badges)
                              are not affected beyond simple overflow clipping.
                            */}
                            <div
                              style={{
                                overflow: isLastColumn ? "visible" : "hidden",
                                textOverflow: isLastColumn ? "clip" : "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                                display: isLastColumn ? "flex" : "block",
                                justifyContent: isLastColumn ? "flex-end" : "flex-start",
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <DataTablePagination labels={paginationLabels} table={table} totalRows={totalRows} />
      </div>
    </div>
  );
}
