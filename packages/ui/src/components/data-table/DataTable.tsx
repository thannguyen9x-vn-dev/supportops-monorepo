"use client";

import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import { useRef, useState, type ReactNode } from "react";

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
  /** True when this is the last left-pinned or first right-pinned column — the freeze-pane boundary. */
  isBoundary = false,
): React.CSSProperties {
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? offsetLeft : undefined,
    right: pinned === "right" ? offsetRight : undefined,
    zIndex,
    // Use an opaque base + transparent overlay so scrolled content doesn't
    // bleed through the semi-transparent hover/selected palette colours.
    backgroundColor: "var(--mui-palette-background-paper)",
    backgroundImage: `linear-gradient(${background}, ${background})`,
    boxShadow: isBoundary
      ? pinned === "left"
        ? "6px 0 10px -2px rgba(0,0,0,0.14)"
        : "-6px 0 10px -2px rgba(0,0,0,0.14)"
      : pinned === "left"
        ? "2px 0 4px -2px rgba(0,0,0,0.08)"
        : "-2px 0 4px -2px rgba(0,0,0,0.08)",
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
  /** Enable drag-to-reorder columns. Pinned columns are excluded. */
  enableColumnReorder?: boolean;
  /** Enable column resize handles on headers. */
  enableColumnResizing?: boolean;
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
  enableColumnReorder = false,
  enableColumnResizing = false,
}: DataTableProps<T>) {
  const rows = table.getRowModel().rows;
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // ── Freeze-pane boundary detection ───────────────────────────────────────
  // The last left-pinned column and the first right-pinned column are the
  // "freeze-pane boundaries". They need a stronger shadow so scrolling content
  // doesn't appear clipped right at the sticky column edge.
  const leftPinnedIds = table.getState().columnPinning.left ?? [];
  const rightPinnedIds = table.getState().columnPinning.right ?? [];
  const lastLeftPinnedId = leftPinnedIds[leftPinnedIds.length - 1] ?? null;
  const firstRightPinnedId = rightPinnedIds[0] ?? null;

  // ── Column drag-and-drop state ──────────────────────────────────────────
  const dragColumnId = useRef<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const visibleColumns = table.getVisibleLeafColumns();
  const rowHeight = ROW_HEIGHT[rowDensity];
  const headerBg = "var(--mui-palette-background-paper)";

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
                background: headerBg,
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, headerIndex) => {
                    const pinned = header.column.getIsPinned();
                    const isLastColumn = headerIndex === headerGroup.headers.length - 1;
                    // Pinned columns are excluded from reorder
                    const canReorder = enableColumnReorder && !pinned;
                    const isDragOver = dragOverColumnId === header.column.id;
                    // Use inner flex wrapper whenever either feature is enabled
                    const useInnerWrapper = enableColumnResizing || enableColumnReorder;
                    const isBoundary =
                      header.column.id === lastLeftPinnedId ||
                      header.column.id === firstRightPinnedId;

                    return (
                      <th
                        key={header.id}
                        className="text-left font-medium text-gray-500"
                        // ⚠️ draggable must NOT be on <th> — it causes native browser drag
                        // to override the mousedown-based resize handler on child elements.
                        // Instead, only the dedicated grip icon div is draggable.
                        // onDragOver / onDrop stay here so the whole cell is a valid drop target.
                        onDragOver={canReorder ? (e) => { e.preventDefault(); setDragOverColumnId(header.column.id); } : undefined}
                        onDragLeave={canReorder ? () => setDragOverColumnId(null) : undefined}
                        onDrop={canReorder ? (e) => {
                          e.preventDefault();
                          setDragOverColumnId(null);
                          const fromId = dragColumnId.current;
                          const toId = header.column.id;
                          dragColumnId.current = null;
                          if (!fromId || fromId === toId) return;
                          const currentOrder = table.getState().columnOrder.length > 0
                            ? table.getState().columnOrder
                            : table.getAllLeafColumns().map((c) => c.id);
                          const newOrder = [...currentOrder];
                          const fromIdx = newOrder.indexOf(fromId);
                          const toIdx = newOrder.indexOf(toId);
                          if (fromIdx === -1 || toIdx === -1) return;
                          newOrder.splice(fromIdx, 1);
                          newOrder.splice(toIdx, 0, fromId);
                          table.setColumnOrder(newOrder);
                        } : undefined}
                        style={{
                          height: HEADER_HEIGHT,
                          // Padding moves into the inner wrapper when it's used
                          padding: useInnerWrapper ? 0 : "0 16px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          fontSize: 13,
                          fontWeight: 600,
                          textAlign: isLastColumn ? "right" : "left",
                          borderRight: isLastColumn ? "none" : "1px solid var(--mui-palette-divider)",
                          borderBottom: "1px solid var(--mui-palette-divider)",
                          boxShadow: isDragOver ? "inset 2px 0 0 var(--mui-palette-primary-main)" : undefined,
                          ...getStickyStyle(
                            pinned,
                            header.column.getStart("left"),
                            header.column.getAfter("right"),
                            headerBg,
                            3,
                            isBoundary,
                          ),
                        }}
                      >
                        {useInnerWrapper ? (
                          // Inner div owns flex layout — <th> stays as table-cell (never set display:flex on <th>)
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: "100%",
                              padding: canReorder
                                ? (isLastColumn ? "0 8px 0 4px" : "0 0 0 4px")
                                : (isLastColumn ? "0 8px 0 16px" : "0 0 0 16px"),
                            }}
                          >

                            {/* Grip icon — the ONLY draggable element for column reorder */}
                            {canReorder && (
                              <div
                                draggable
                                onDragStart={() => { dragColumnId.current = header.column.id; }}
                                title="Drag to reorder"
                                style={{
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 6px",
                                  cursor: "grab",
                                  color: "var(--mui-palette-action-active)",
                                  opacity: 0.35,
                                  userSelect: "none",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.35"; }}
                              >
                                {/* 6-dot grip icon */}
                                <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
                                  <circle cx="3" cy="4.5" r="1.2" />
                                  <circle cx="7" cy="4.5" r="1.2" />
                                  <circle cx="3" cy="8" r="1.2" />
                                  <circle cx="7" cy="8" r="1.2" />
                                  <circle cx="3" cy="11.5" r="1.2" />
                                  <circle cx="7" cy="11.5" r="1.2" />
                                </svg>
                              </div>
                            )}

                            {/* Header text / sort icon */}
                            <div
                              style={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                minWidth: 0,
                                paddingRight: enableColumnResizing && header.column.getCanResize() ? 12 : 0,
                              }}
                            >
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </div>

                            {/* Resize handle — NOT draggable, uses mousedown to avoid conflict */}
                            {enableColumnResizing && header.column.getCanResize() && (
                              <div
                                draggable={false}
                                onMouseDown={(e) => {
                                  // Prevent the grip icon's drag from interfering
                                  e.stopPropagation();
                                  header.getResizeHandler()(e);
                                }}
                                onTouchStart={header.getResizeHandler()}
                                style={{
                                  width: 4,
                                  alignSelf: "stretch",
                                  flexShrink: 0,
                                  cursor: "col-resize",
                                  background: header.column.getIsResizing()
                                    ? "var(--mui-palette-primary-main)"
                                    : "var(--mui-palette-divider)",
                                  opacity: header.column.getIsResizing() ? 1 : 0,
                                  userSelect: "none",
                                  touchAction: "none",
                                  transition: "opacity 0.15s",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                                onMouseLeave={(e) => { if (!header.column.getIsResizing()) (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                              />
                            )}
                          </div>
                        ) : (
                          header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
                        )}
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
                  const isHovered = hoveredRowId === row.id;

                  // Determine the effective row background so sticky cells can
                  // match — they need an explicit (non-transparent) background
                  // to cover content scrolling beneath them.
                  // Priority: selected > hovered (clickable) > dirty > default
                  const rowBg = isSelected
                    ? "var(--mui-palette-action-selected)"
                    : isHovered
                      ? "var(--mui-palette-action-hover)"
                      : isDirty
                        ? "rgba(234, 179, 8, 0.05)"
                        : "var(--mui-palette-background-paper)";

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        isDirty ? "border-l-4 border-l-yellow-400" : "",
                        rowClassName?.(row.original),
                      )}
                      style={{
                        backgroundColor: rowBg,
                        cursor: onRowClick ? "pointer" : undefined,
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => {
                        const pinned = cell.column.getIsPinned();
                        const isLastColumn = cellIndex === row.getVisibleCells().length - 1;
                        const isBoundary =
                          cell.column.id === lastLeftPinnedId ||
                          cell.column.id === firstRightPinnedId;
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
                              backgroundColor: rowBg,
                              ...getStickyStyle(
                                pinned,
                                cell.column.getStart("left"),
                                cell.column.getAfter("right"),
                                rowBg,
                                1,
                                isBoundary,
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
