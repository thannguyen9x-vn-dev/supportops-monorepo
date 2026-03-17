import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  VisibilityState,
  RowSelectionState
} from "@tanstack/react-table";

export interface UseDataTableOptions<T> {
  // TanStack columns use mixed cell value types per table; `any` is required here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
  totalRows?: number;
  rowId?: keyof T | ((row: T) => string);
  serverSide?: boolean;
  pageIndex?: number;
  pageSize?: number;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableInlineEdit?: boolean;
  onStateChange?: (state: DataTableState) => void;

  /**
   * Columns to pin. TanStack handles offset calculation automatically.
   * Pinned columns will be sticky left/right in the DataTable.
   */
  pinnedColumns?: {
    left?: string[];
    right?: string[];
  };

  /**
   * Fallback size for columns that don't declare an explicit size.
   * Applied as TanStack's `defaultColumn` option.
   */
  defaultColumn?: {
    size?: number;
    minSize?: number;
    maxSize?: number;
  };

  /**
   * External sorting state (controlled mode).
   * If provided, this will be used instead of internal state.
   */
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;

  /**
   * External column visibility state (controlled mode).
   * If provided, this will be used instead of internal state.
   */
  columnVisibility?: VisibilityState;
}

export interface DataTableState {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
}

export interface InlineEditState<T> {
  editingCells: Record<string, boolean>;
  pendingEdits: Record<string, Partial<T>>;
  dirtyRowCount: number;
  startEditing: (rowId: string, columnId: string) => void;
  cancelEditing: (rowId: string, columnId: string) => void;
  updateCell: (rowId: string, columnId: string, value: unknown) => void;
  discardRow: (rowId: string) => void;
  discardAll: () => void;
  getAllChanges: () => Array<{ rowId: string; changes: Partial<T> }>;
  isEditing: (rowId: string, columnId: string) => boolean;
  getPendingValue: (rowId: string, columnId: string) => unknown | undefined;
}

export interface UseDataTableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
}
