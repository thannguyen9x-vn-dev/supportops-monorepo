"use client";

import { useMemo, type ReactNode } from "react";
import { flexRender } from "@tanstack/react-table";
import type { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Box, Stack } from "@mui/material";

import { DataTable, useDataTable } from "@supportops/ui";
import type { DataTablePaginationLabels } from "@supportops/ui";

import { EntityListFilters } from "@/features/layout/components/EntityListFilters/EntityListFilters";

import { EntityTableProvider } from "./EntityTableContext";
import styles from "./entity-table.module.css";
import type { EntityColumnDef, EntityTableInstance, FilterSlotProps } from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type EntityTableProps<TData extends object, TFilters extends object> = {
  entityTable: EntityTableInstance<TData, TFilters>;

  // ── Filter slots ──────────────────────────────────────────────────────────
  renderSearch?: (props: FilterSlotProps<TFilters>) => ReactNode;
  renderFilterControls?: (props: FilterSlotProps<TFilters>) => ReactNode;
  renderFilterOptions?: (props: FilterSlotProps<TFilters>) => ReactNode;
  showFilterOptions?: boolean;

  // ── Other slots ───────────────────────────────────────────────────────────
  tabs?: ReactNode;
  emptyState?: ReactNode;
  paginationLabels?: DataTablePaginationLabels;
  onRowClick?: (row: TData) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EntityTable<TData extends object, TFilters extends object>({
  entityTable,
  renderSearch,
  renderFilterControls,
  renderFilterOptions,
  showFilterOptions = false,
  tabs,
  emptyState,
  paginationLabels,
  onRowClick,
}: EntityTableProps<TData, TFilters>) {
  const {
    _tableConfig,
    draftFilters,
    appliedFilters,
    setDraftFilter,
    hasActiveFilters,
    sorting,
    setSorting,
    columnVisibility,
  } = entityTable;

  // ── Build TanStack columns — inject editCell / editHeader ─────────────────
  // Each EntityColumnDef is wrapped so the cell renderer checks edit state
  // and delegates to editCell when the row is in edit mode.

  const tanstackColumns = useMemo<ColumnDef<TData, unknown>[]>(
    () =>
      _tableConfig.columns.map((col: EntityColumnDef<TData>) => ({
        ...col,
        enableSorting: col.sortable ?? false,

        cell: col.editCell
          ? (cellCtx: CellContext<TData, unknown>) => {
              const rowId =
                typeof _tableConfig.rowId === "function"
                  ? _tableConfig.rowId(cellCtx.row.original)
                  : String(cellCtx.row.original[_tableConfig.rowId]);

              const isEditing = entityTable.isRowEditing(rowId);

              if (!isEditing) {
                return col.cell ? flexRender(col.cell, cellCtx) : cellCtx.getValue();
              }

              // accessorKey only exists on AccessorKeyColumnDef — guard before access
              const field =
                "accessorKey" in col
                  ? (col.accessorKey as keyof TData)
                  : undefined;
              const originalValue = cellCtx.getValue();
              const pendingValue = field
                ? entityTable.getRowFieldValue(rowId, field, originalValue)
                : originalValue;

              return col.editCell!({
                row: cellCtx.row.original,
                rowId,
                value: pendingValue,
                onChange: (newValue) => {
                  if (field) entityTable.setRowFieldValue(rowId, field, newValue);
                },
                isDirty: field ? entityTable.isRowDirty(rowId) : false,
              });
            }
          : col.cell,

        header:
          col.editHeader && col.enableColumnEdit
            ? (headerCtx: HeaderContext<TData, unknown>) => {
                const colId = headerCtx.column.id;
                const isEditing = entityTable.isColumnEditing(colId);

                if (!isEditing) {
                  const headerContent =
                    typeof col.header === "function"
                      ? flexRender(col.header, headerCtx)
                      : col.header;

                  // Wrap header with sort icons if sortable
                  if (col.sortable) {
                    const sortDirection = headerCtx.column.getIsSorted();
                    return (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{ cursor: "pointer", userSelect: "none" }}
                        onClick={headerCtx.column.getToggleSortingHandler()}
                      >
                        <Box>{headerContent}</Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            opacity: sortDirection ? 1 : 0.3,
                          }}
                        >
                          {sortDirection === "asc" ? (
                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                          ) : sortDirection === "desc" ? (
                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <ArrowUpwardIcon sx={{ fontSize: 16, opacity: 0.3 }} />
                          )}
                        </Box>
                      </Stack>
                    );
                  }

                  return headerContent;
                }

                const editState = entityTable.editState;
                const bulkValue =
                  editState.mode === "column" ? editState.bulkValue : undefined;

                return col.editHeader!({
                  columnId: colId,
                  bulkValue,
                  onBulkChange: entityTable.setBulkColumnValue,
                  selectedRows: [],
                });
              }
            : col.sortable
              ? (headerCtx: HeaderContext<TData, unknown>) => {
                  const headerContent =
                    typeof col.header === "function"
                      ? flexRender(col.header, headerCtx)
                      : col.header;

                  const sortDirection = headerCtx.column.getIsSorted();
                  return (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ cursor: "pointer", userSelect: "none" }}
                      onClick={headerCtx.column.getToggleSortingHandler()}
                    >
                      <Box>{headerContent}</Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          opacity: sortDirection ? 1 : 0.3,
                        }}
                      >
                        {sortDirection === "asc" ? (
                          <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                        ) : sortDirection === "desc" ? (
                          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <ArrowUpwardIcon sx={{ fontSize: 16, opacity: 0.3 }} />
                        )}
                      </Box>
                    </Stack>
                  );
                }
              : col.header,
        // TanStack ColumnDef is a discriminated union (AccessorKey | AccessorFn | Display).
        // TypeScript cannot statically verify a spread+override object satisfies one
        // specific variant, so we cast. Runtime shape is always valid.
      } as unknown as ColumnDef<TData, unknown>)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_tableConfig.columns, _tableConfig.rowId, entityTable.editState, sorting],
  );

  // ── TanStack table instance ───────────────────────────────────────────────

  const { table } = useDataTable<TData>({
    data: _tableConfig.data,
    columns: tanstackColumns,
    rowId: _tableConfig.rowId,
    pageIndex: _tableConfig.pageIndex,
    pageSize: _tableConfig.pageSize,
    serverSide: _tableConfig.serverSide,
    totalRows: _tableConfig.totalRows,
    enableSelection: true,
    pinnedColumns: _tableConfig.pinnedColumns,
    defaultColumn: _tableConfig.defaultColumn,
    // Pass sorting and visibility from entityTable instance
    sorting,
    onSortingChange: setSorting,
    columnVisibility,
  });

  // ── Filter slot props ─────────────────────────────────────────────────────

  const filterSlotProps: FilterSlotProps<TFilters> = {
    draftFilters,
    appliedFilters,
    setDraftFilter,
    hasActiveFilters,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <EntityTableProvider instance={entityTable}>
      <div className={styles.root}>
        {tabs}

        <EntityListFilters
          controls={renderFilterControls ? renderFilterControls(filterSlotProps) : null}
          filterOptions={
            renderFilterOptions ? renderFilterOptions(filterSlotProps) : undefined
          }
          search={renderSearch ? renderSearch(filterSlotProps) : null}
          showFilterOptions={showFilterOptions}
        />

        <DataTable
          rowDensity={_tableConfig.rowDensity}
          dirtyRowIds={
            entityTable.editState.mode === "row"
              ? new Set(
                  [...entityTable.editState.editingRowIds].filter((id) =>
                    entityTable.isRowDirty(id),
                  ),
                )
              : undefined
          }
          emptyState={emptyState}
          highlightDirtyRows
          onRowClick={onRowClick}
          paginationLabels={paginationLabels}
          table={table}
          totalRows={_tableConfig.totalRows}
        />
      </div>
    </EntityTableProvider>
  );
}
