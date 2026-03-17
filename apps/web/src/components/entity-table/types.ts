import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Edit state machine — exclusive: only one mode active at a time
// ---------------------------------------------------------------------------

export type TableEditState<TData> =
  | { mode: "view" }
  | {
      mode: "row";
      editingRowIds: Set<string>;
      // Map<rowId, { fieldKey -> pending value }>
      rowForms: Map<string, Partial<TData>>;
      savingRowIds: Set<string>;
    }
  | {
      mode: "column";
      columnId: string;
      bulkValue: unknown;
      isSaving: boolean;
    };

// ---------------------------------------------------------------------------
// Save trigger — per table, not per column
// ---------------------------------------------------------------------------

export type RowSaveTrigger = "onBlur" | "onManualSave";

// ---------------------------------------------------------------------------
// Extended column definition
// ---------------------------------------------------------------------------

// TanStack cell renderers only receive { row, getValue, ... } from the table
// engine. editCell / editHeader receive form-aware props injected by EntityTable
// via EntityTableContext — no prop drilling needed.

export type RowEditCellProps<TData> = {
  row: TData;
  rowId: string;
  /** Current pending value (falls back to original cell value if not dirty) */
  value: unknown;
  onChange: (newValue: unknown) => void;
  isDirty: boolean;
};

export type ColumnEditHeaderProps<TData> = {
  columnId: string;
  /** Current bulk value being composed */
  bulkValue: unknown;
  onBulkChange: (value: unknown) => void;
  /** Rows currently selected in the table */
  selectedRows: TData[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntityColumnDef<TData> = ColumnDef<TData, any> & {
  /**
   * Render an editable cell when a row is in edit mode.
   * Falls back to the normal `cell` renderer when not editing.
   */
  editCell?: (props: RowEditCellProps<TData>) => ReactNode;

  /**
   * Render an interactive column header when column bulk-edit mode is active
   * for this column. Falls back to normal `header` when not in column mode.
   */
  editHeader?: (props: ColumnEditHeaderProps<TData>) => ReactNode;

  /** Whether this column participates in bulk-edit (column mode). Default false. */
  enableColumnEdit?: boolean;

  /** Whether this column can be sorted. Default false. */
  sortable?: boolean;

  /** Whether this column can be hidden via column visibility control. Default false. */
  hideable?: boolean;
};

// ---------------------------------------------------------------------------
// Filter slot props — passed to renderSearch / renderFilterOptions slots
// ---------------------------------------------------------------------------

export type FilterSlotProps<TFilters> = {
  draftFilters: TFilters;
  appliedFilters: TFilters;
  setDraftFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  hasActiveFilters: boolean;
};

// ---------------------------------------------------------------------------
// useEntityTable config
// ---------------------------------------------------------------------------

export type EntityTableConfig<TData extends object, TFilters extends object> = {
  // ── Data ─────────────────────────────────────────────────────────────────
  data: TData[];
  columns: EntityColumnDef<TData>[];
  rowId: keyof TData | ((row: TData) => string);

  // ── Table layout ──────────────────────────────────────────────────────────
  /** Row height preset. "comfortable" = 56px (default), "compact" = 44px. */
  rowDensity?: "comfortable" | "compact";

  /**
   * Columns to pin sticky. Uses TanStack's columnPinning API internally.
   * Pass column `accessorKey` or `id` values.
   */
  pinnedColumns?: {
    left?: string[];
    right?: string[];
  };

  /**
   * Fallback size for columns without an explicit size in the column def.
   * Defaults: size 180, minSize 120, maxSize 400.
   */
  defaultColumn?: {
    size?: number;
    minSize?: number;
    maxSize?: number;
  };

  // ── Sorting & Visibility ──────────────────────────────────────────────────
  /**
   * Storage key for persisting column visibility to localStorage.
   * If not provided, column visibility will not be persisted.
   */
  columnVisibilityStorageKey?: string;

  // ── Filters ───────────────────────────────────────────────────────────────
  initialFilters: TFilters;
  /**
   * Called when user presses "Apply".
   * For server-side: trigger API refetch here.
   * For client-side: just update parent state.
   */
  onApplyFilters?: (filters: TFilters) => void;

  // ── Pagination ────────────────────────────────────────────────────────────
  pageIndex?: number;
  pageSize?: number;
  totalRows?: number;
  serverSide?: boolean;

  // ── Row form ─────────────────────────────────────────────────────────────
  /**
   * When to persist a dirty row.
   * "onBlur"       — save automatically when focus leaves the row.
   * "onManualSave" — save only when user presses the Save action button.
   * Default: "onManualSave".
   */
  rowSaveTrigger?: RowSaveTrigger;

  /**
   * Called with the row id and only the changed fields.
   * Returning void (or throwing) keeps the row in edit mode.
   */
  onSaveRow?: (rowId: string, changes: Partial<TData>, original: TData) => Promise<void>;

  // ── Column bulk-edit ──────────────────────────────────────────────────────
  /**
   * Called when user confirms a bulk column value.
   * `rowIds` — the currently selected row ids (or all rows if none selected).
   */
  onSaveBulkColumn?: (columnId: string, value: unknown, rowIds: string[]) => Promise<void>;
};

// ---------------------------------------------------------------------------
// The object returned by useEntityTable — passed to <EntityTable />
// ---------------------------------------------------------------------------

export type EntityTableInstance<TData extends object, TFilters extends object> = {
  /** Internal state consumed by <EntityTable>. Treat as opaque outside. */
  _tableConfig: {
    data: TData[];
    columns: EntityColumnDef<TData>[];
    rowId: keyof TData | ((row: TData) => string);
    pageIndex: number;
    pageSize: number;
    totalRows: number;
    serverSide: boolean;
    rowSaveTrigger: RowSaveTrigger;
    rowDensity: "comfortable" | "compact";
    pinnedColumns?: { left?: string[]; right?: string[] };
    defaultColumn?: { size?: number; minSize?: number; maxSize?: number };
    columnVisibilityStorageKey?: string;
    onSaveRow?: EntityTableConfig<TData, TFilters>["onSaveRow"];
    onSaveBulkColumn?: EntityTableConfig<TData, TFilters>["onSaveBulkColumn"];
  };

  // ── Filter API ────────────────────────────────────────────────────────────
  draftFilters: TFilters;
  appliedFilters: TFilters;
  setDraftFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;

  // ── Sorting & Visibility API ──────────────────────────────────────────────
  sorting: SortingState;
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  toggleColumn: (columnId: string) => void;
  showAllColumns: () => void;
  isColumnVisible: (columnId: string) => boolean;

  // ── Edit state ────────────────────────────────────────────────────────────
  editState: TableEditState<TData>;

  // ── Row form API ──────────────────────────────────────────────────────────
  startEditRow: (rowId: string) => void;
  cancelEditRow: (rowId: string) => void;
  setRowFieldValue: (rowId: string, field: keyof TData, value: unknown) => void;
  getRowFieldValue: (rowId: string, field: keyof TData, originalValue: unknown) => unknown;
  saveRow: (rowId: string, originalRow: TData) => Promise<void>;
  isRowEditing: (rowId: string) => boolean;
  isRowSaving: (rowId: string) => boolean;
  isRowDirty: (rowId: string) => boolean;

  // ── Column bulk-edit API ──────────────────────────────────────────────────
  startEditColumn: (columnId: string) => void;
  cancelEditColumn: () => void;
  setBulkColumnValue: (value: unknown) => void;
  saveBulkColumn: (selectedRowIds: string[]) => Promise<void>;
  isColumnEditing: (columnId: string) => boolean;
};
