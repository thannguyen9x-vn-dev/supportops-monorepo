import * as _tanstack_react_table from '@tanstack/react-table';
import { PaginationState, SortingState, ColumnFiltersState, ColumnDef, VisibilityState, ColumnOrderState, ColumnSizingState, RowSelectionState, Table, Column } from '@tanstack/react-table';
import * as react from 'react';
import { Ref, BaseSyntheticEvent, RefObject, ChangeEvent, KeyboardEvent, ReactNode, FormHTMLAttributes, FormEvent, CSSProperties } from 'react';
import * as react_hook_form from 'react-hook-form';
import { FieldValues, Path, PathValue, FieldErrors, UseFormReturn, FieldArrayPath, UseFieldArrayProps } from 'react-hook-form';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface UseDataTableOptions<T> {
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
    /**
     * External column order state (controlled mode).
     * Pass an empty array to use TanStack's default order.
     */
    columnOrder?: ColumnOrderState;
    onColumnOrderChange?: (order: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => void;
    /**
     * External column sizing state (controlled mode).
     */
    columnSizing?: ColumnSizingState;
    onColumnSizingChange?: (sizing: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => void;
    /**
     * Enable column resizing. Renders a drag handle on each resizable column header.
     */
    enableColumnResizing?: boolean;
}
interface DataTableState {
    pagination: PaginationState;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
}
interface InlineEditState<T> {
    editingCells: Record<string, boolean>;
    pendingEdits: Record<string, Partial<T>>;
    dirtyRowCount: number;
    startEditing: (rowId: string, columnId: string) => void;
    cancelEditing: (rowId: string, columnId: string) => void;
    updateCell: (rowId: string, columnId: string, value: unknown) => void;
    discardRow: (rowId: string) => void;
    discardAll: () => void;
    getAllChanges: () => Array<{
        rowId: string;
        changes: Partial<T>;
    }>;
    isEditing: (rowId: string, columnId: string) => boolean;
    getPendingValue: (rowId: string, columnId: string) => unknown | undefined;
}
interface UseDataTableState {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
    columnVisibility: VisibilityState;
    rowSelection: RowSelectionState;
    pagination: PaginationState;
}

declare function useDataTable<T>(options: UseDataTableOptions<T>): {
    totalRows: number;
    pageCount: number;
    currentPage: number;
    isFirstPage: boolean;
    isLastPage: boolean;
    inlineEdit?: InlineEditState<T> | undefined;
    table: _tanstack_react_table.Table<T>;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
    columnVisibility: VisibilityState;
    pagination: PaginationState;
    setGlobalFilter: react.Dispatch<react.SetStateAction<string>>;
    goToPage: (page: number) => void;
    setPageSize: (size: number) => void;
    selectedRowIds: string[];
    selectedRows: T[];
    clearSelection: () => void;
    hasActiveFilters: boolean;
    clearAllFilters: () => void;
};
type UseDataTableReturn<T> = ReturnType<typeof useDataTable<T>>;

interface UseTableInlineEditOptions {
    enabled: boolean;
}
declare function useTableInlineEdit<T>({ enabled }: UseTableInlineEditOptions): InlineEditState<T>;

declare function useTablePagination<T>(table: Table<T>): {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
    goToPage: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
};

declare function useTableSelection<T>(table: Table<T>): {
    selectedRows: T[];
    selectedRowIds: string[];
    selectedCount: number;
    clearSelection: () => void;
    toggleAllRowsSelected: (value?: boolean) => void;
};

interface ExportOptions {
    fileName?: string;
    separator?: "," | ";" | "\t";
    includeHeaders?: boolean;
}
declare function useTableExport<T>(table: Table<T>): {
    exportCsv: (options?: ExportOptions) => void;
};

interface UseTypedFormOptions<T extends FieldValues> {
    schema: {
        safeParse: (data: unknown) => {
            success: true;
            data: T;
        } | {
            success: false;
            error: {
                issues: Array<{
                    path: Array<string | number>;
                    code: string;
                    message: string;
                }>;
            };
        };
    };
    defaultValues?: Partial<T>;
    onSubmit: (data: T) => void | Promise<void>;
    onError?: (errors: FieldErrors<T>) => void;
}
interface HeadlessFieldProps<T extends FieldValues = FieldValues, TName extends Path<T> = Path<T>> {
    name: TName;
    value: PathValue<T, TName>;
    error?: string;
    isValidating: boolean;
    isTouched: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
    onChange: (value: PathValue<T, TName>) => void;
    onBlur: () => void;
    ref: Ref<HTMLElement>;
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
}
interface FieldConfig {
    label: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}
interface UseTypedFormResult<T extends FieldValues> {
    form: UseFormReturn<T>;
    handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
    errors: FieldErrors<T>;
    reset: UseFormReturn<T>["reset"];
}

declare function useTypedForm<T extends FieldValues>(options: UseTypedFormOptions<T>): UseTypedFormResult<T>;
declare function useFormField<T extends FieldValues = FieldValues, TName extends Path<T> = Path<T>>(name: TName, form?: UseFormReturn<T>): HeadlessFieldProps<T, TName>;

declare function useFieldArray<TFieldValues extends FieldValues = FieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>>(props: Omit<UseFieldArrayProps<TFieldValues, TFieldArrayName>, "control">): react_hook_form.UseFieldArrayReturn<TFieldValues, TFieldArrayName, "id">;

declare const useFormContext: <TFieldValues extends react_hook_form.FieldValues, TContext = any, TTransformedValues = TFieldValues>() => react_hook_form.UseFormReturn<TFieldValues, TContext, TTransformedValues>;

interface UseVirtualListOptions<T> {
    items: T[];
    estimateSize: number | ((index: number) => number);
    overscan?: number;
    horizontal?: boolean;
    getItemKey?: (index: number) => string | number;
    gap?: number;
}
interface VirtualItem<T> {
    index: number;
    data: T;
    start: number;
    size: number;
    key: string | number;
}
interface UseVirtualListReturn<T> {
    scrollRef: RefObject<HTMLDivElement | null>;
    virtualItems: VirtualItem<T>[];
    totalSize: number;
    scrollToIndex: (index: number, options?: {
        align?: "start" | "center" | "end";
    }) => void;
    scrollOffset: number;
    isScrolling: boolean;
}
interface UseInfiniteVirtualListOptions<T> extends UseVirtualListOptions<T> {
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadMoreThreshold?: number;
}

declare function useVirtualList<T>(options: UseVirtualListOptions<T>): UseVirtualListReturn<T>;

declare function useInfiniteVirtualList<T>(options: UseInfiniteVirtualListOptions<T>): {
    isLoadingMore: boolean;
    scrollRef: react.RefObject<HTMLDivElement | null>;
    virtualItems: VirtualItem<T>[];
    totalSize: number;
    scrollToIndex: (index: number, options?: {
        align?: "start" | "center" | "end";
    }) => void;
    scrollOffset: number;
    isScrolling: boolean;
};

interface ComboboxOption<TValue = string> {
    label: string;
    value: TValue;
    description?: string;
    disabled?: boolean;
    group?: string;
}
interface UseComboboxOptions<TValue = string> {
    options: ComboboxOption<TValue>[];
    value?: TValue;
    onChange?: (value: TValue) => void;
    filterFn?: (option: ComboboxOption<TValue>, query: string) => boolean;
    allowCustomValue?: boolean;
}

declare function useCombobox<TValue = string>(options: UseComboboxOptions<TValue>): {
    isOpen: boolean;
    query: string;
    highlightedIndex: number;
    filteredOptions: ComboboxOption<TValue>[];
    groupedOptions: Map<string, ComboboxOption<TValue>[]>;
    selectedOption: ComboboxOption<TValue> | undefined;
    setQuery: react.Dispatch<react.SetStateAction<string>>;
    setIsOpen: react.Dispatch<react.SetStateAction<boolean>>;
    selectOption: (option: ComboboxOption<TValue>) => void;
    inputProps: {
        ref: react.RefObject<HTMLInputElement | null>;
        value: string;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
        onFocus: () => void;
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
        role: "combobox";
        "aria-expanded": boolean;
        "aria-autocomplete": "list";
        "aria-controls": string;
    };
    listProps: {
        ref: react.RefObject<HTMLUListElement | null>;
        id: string;
        role: "listbox";
    };
    getOptionProps: (option: ComboboxOption<TValue>, index: number) => {
        role: "option";
        "aria-selected": boolean;
        "aria-disabled": boolean | undefined;
        "data-highlighted": boolean;
        onClick: () => void;
        onMouseEnter: () => void;
    };
};

interface UseDialogOptions {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
    disableEscapeKeyClose?: boolean;
    disableBackdropClose?: boolean;
}
interface DialogCloseMeta {
    reason: "backdropClick" | "escapeKeyDown";
}
interface UseDialogReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    dialogProps: {
        open: boolean;
        onClose: (_event: unknown, reason: "backdropClick" | "escapeKeyDown") => void;
        "aria-modal": true;
        role: "dialog";
    };
    triggerProps: {
        onClick: () => void;
        "aria-haspopup": "dialog";
        "aria-expanded": boolean;
    };
}

declare function useDialog(options?: UseDialogOptions): UseDialogReturn;

interface SkeletonRepeatOptions {
    count: number;
    keyPrefix?: string;
}
interface UseSkeletonReturn {
    items: string[];
    containerProps: {
        "aria-busy": true;
        "aria-label": string;
        role: "status";
    };
}

declare function useSkeleton(options: SkeletonRepeatOptions): UseSkeletonReturn;

interface UseClipboardOptions {
    resetDelay?: number;
}
interface UseClipboardReturn {
    copied: boolean;
    error: Error | null;
    copy: (text: string) => Promise<boolean>;
    read: () => Promise<string | null>;
    reset: () => void;
}

declare function useClipboard(options?: UseClipboardOptions): UseClipboardReturn;

type ToastSeverity = "info" | "success" | "warning" | "error";
interface ToastInput {
    title?: string;
    message: string;
    severity?: ToastSeverity;
    duration?: number;
}
interface ToastItem extends ToastInput {
    id: string;
    severity: ToastSeverity;
    createdAt: number;
}
interface UseToastOptions {
    maxToasts?: number;
    defaultDuration?: number;
}
interface UseToastReturn {
    toasts: ToastItem[];
    toast: (input: ToastInput) => string;
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

declare function useToast(options?: UseToastOptions): UseToastReturn;

interface DataTablePaginationLabels {
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
declare function DataTablePagination<T>({ table, totalRows, pageSizeOptions, labels }: DataTablePaginationProps<T>): react_jsx_runtime.JSX.Element;

interface DataTableProps<T> {
    table: Table<T>;
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
declare function DataTable<T>({ table, totalRows, isLoading, selectedCount, dirtyRowCount, onBulkDelete, onSaveAll, onDiscardAll, onExport, onRowClick, highlightDirtyRows, dirtyRowIds, emptyState, rowClassName, paginationLabels, rowDensity, bodyHeight, bodyMaxHeight, enableColumnReorder, enableColumnResizing, }: DataTableProps<T>): react_jsx_runtime.JSX.Element;

interface DataTableColumnHeaderProps<T, TValue> {
    column: Column<T, TValue>;
    title: string;
}
declare function DataTableColumnHeader<T, TValue>({ column, title }: DataTableColumnHeaderProps<T, TValue>): react_jsx_runtime.JSX.Element;

interface DataTableToolbarProps<T> {
    table: Table<T>;
    selectedCount?: number;
    dirtyRowCount?: number;
    onBulkDelete?: () => void;
    onSaveAll?: () => void;
    onDiscardAll?: () => void;
    onExport?: () => void;
}
declare function DataTableToolbar<T>({ selectedCount, dirtyRowCount, onBulkDelete, onSaveAll, onDiscardAll, onExport }: DataTableToolbarProps<T>): react_jsx_runtime.JSX.Element;

type DialogLegacyProps = {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    subtitle?: ReactNode;
    titleElement?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    actions?: ReactNode;
    maxWidthClassName?: string;
    showCloseButton?: boolean;
    dividers?: boolean;
    scrollable?: boolean;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
};
type DialogHookProps = {
    dialog: UseDialogReturn;
    title?: ReactNode;
    subtitle?: ReactNode;
    titleElement?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    actions?: ReactNode;
    maxWidthClassName?: string;
    showCloseButton?: boolean;
    dividers?: boolean;
    scrollable?: boolean;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
};
type DialogProps = DialogLegacyProps | DialogHookProps;
declare function Dialog(props: DialogProps): react_jsx_runtime.JSX.Element | null;

type ConfirmDialogLegacyProps = {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    cancelLabel: string;
    confirmLabel: string;
    processingLabel?: string;
    confirmColor?: "default" | "error";
    isProcessing?: boolean;
    onConfirm: () => void | Promise<void>;
};
type ConfirmDialogHookProps = {
    dialog: UseDialogReturn;
    title: ReactNode;
    message: ReactNode;
    severity?: "info" | "warning" | "error" | "success";
    confirmLabel?: string;
    cancelLabel?: string;
    processingLabel?: string;
    confirmDisabled?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
};
type ConfirmDialogProps = ConfirmDialogLegacyProps | ConfirmDialogHookProps;
declare function ConfirmDialog(props: ConfirmDialogProps): react_jsx_runtime.JSX.Element;

type AlertDialogLegacyProps = {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    closeLabel: string;
};
type AlertDialogHookProps = {
    dialog: UseDialogReturn;
    title: ReactNode;
    message: ReactNode;
    severity?: "info" | "warning" | "error" | "success";
    closeLabel?: string;
};
type AlertDialogProps = AlertDialogLegacyProps | AlertDialogHookProps;
declare function AlertDialog(props: AlertDialogProps): react_jsx_runtime.JSX.Element;

interface FormDialogProps {
    dialog: UseDialogReturn;
    title: ReactNode;
    subtitle?: ReactNode;
    children: ReactNode;
    onSubmit?: () => void | Promise<void>;
    formId?: string;
    submitLabel?: string;
    cancelLabel?: string;
    submitDisabled?: boolean;
    maxWidthClassName?: string;
    dividers?: boolean;
}
declare function FormDialog({ dialog, title, subtitle, children, onSubmit, formId, submitLabel, cancelLabel, submitDisabled, maxWidthClassName, dividers }: FormDialogProps): react_jsx_runtime.JSX.Element;

interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
    form: UseFormReturn<T>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    children: ReactNode;
}
declare function Form<T extends FieldValues>({ form, onSubmit, children, ...props }: FormProps<T>): react_jsx_runtime.JSX.Element;

interface FormFieldProps<T extends FieldValues, TName extends Path<T>> {
    name: TName;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    required?: boolean;
    className?: string;
    children: (field: HeadlessFieldProps<T, TName>) => ReactNode;
}
declare function FormField<T extends FieldValues, TName extends Path<T>>({ name, form, label, description, required, className, children }: FormFieldProps<T, TName>): react_jsx_runtime.JSX.Element;

interface TextFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    type?: "text" | "email" | "password" | "url" | "tel";
    autoComplete?: string;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
}
declare function TextField<T extends FieldValues>({ name, form, label, placeholder, description, required, type, autoComplete, className, inputClassName, disabled }: TextFieldProps<T>): react_jsx_runtime.JSX.Element;

interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}
interface SelectFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    options: SelectOption[];
    placeholder?: string;
    description?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}
declare function SelectField<T extends FieldValues>({ name, form, label, options, placeholder, description, required, className, disabled }: SelectFieldProps<T>): react_jsx_runtime.JSX.Element;

interface NumberFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    disabled?: boolean;
}
declare function NumberField<T extends FieldValues>({ name, form, label, placeholder, description, required, min, max, step, prefix, suffix, className, disabled }: NumberFieldProps<T>): react_jsx_runtime.JSX.Element;

interface ComboboxFieldProps<T extends FieldValues, TValue = string> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    options: ComboboxOption<TValue>[];
    placeholder?: string;
    allowCustomValue?: boolean;
    filterFn?: (option: ComboboxOption<TValue>, query: string) => boolean;
}
declare function ComboboxField<T extends FieldValues, TValue = string>({ name, form, label, description, required, className, disabled, options, placeholder, allowCustomValue, filterFn }: ComboboxFieldProps<T, TValue>): react_jsx_runtime.JSX.Element;

interface DateFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    type?: "date" | "datetime-local" | "time";
    min?: string;
    max?: string;
}
declare function DateField<T extends FieldValues>({ name, form, label, description, required, className, disabled, type, min, max }: DateFieldProps<T>): react_jsx_runtime.JSX.Element;

interface SwitchFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}
declare function SwitchField<T extends FieldValues>({ name, form, label, description, className, disabled }: SwitchFieldProps<T>): react_jsx_runtime.JSX.Element;

interface CheckboxFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}
declare function CheckboxField<T extends FieldValues>({ name, form, label, description, className, disabled }: CheckboxFieldProps<T>): react_jsx_runtime.JSX.Element;

interface TextareaFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    rows?: number;
    minLength?: number;
    maxLength?: number;
    showCount?: boolean;
}
declare function TextareaField<T extends FieldValues>({ name, form, label, placeholder, description, required, className, disabled, rows, minLength, maxLength, showCount }: TextareaFieldProps<T>): react_jsx_runtime.JSX.Element;

interface FileFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    dropzoneText?: string;
}
declare function FileField<T extends FieldValues>({ name, form, label, description, required, className, disabled, accept, multiple, maxFiles, maxSize, dropzoneText }: FileFieldProps<T>): react_jsx_runtime.JSX.Element;

interface RadioOption {
    label: string;
    value: string;
    disabled?: boolean;
}
interface RadioGroupFieldProps<T extends FieldValues> {
    name: Path<T>;
    form?: UseFormReturn<T>;
    label: string;
    description?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    options: RadioOption[];
    row?: boolean;
}
declare function RadioGroupField<T extends FieldValues>({ name, form, label, description, required, className, disabled, options, row }: RadioGroupFieldProps<T>): react_jsx_runtime.JSX.Element;

interface VirtualListProps<T> extends UseVirtualListOptions<T> {
    height: number | string;
    width?: number | string;
    className?: string;
    loading?: boolean;
    loadingSkeleton?: ReactNode;
    emptyState?: ReactNode;
    renderItem: (item: T, index: number) => ReactNode;
}
declare function VirtualList<T>({ height, width, className, loading, loadingSkeleton, emptyState, renderItem, ...options }: VirtualListProps<T>): react_jsx_runtime.JSX.Element;

interface InfiniteVirtualListProps<T> extends UseInfiniteVirtualListOptions<T> {
    height: number | string;
    width?: number | string;
    className?: string;
    emptyState?: ReactNode;
    loadingMoreText?: string;
    renderItem: (item: T, index: number) => ReactNode;
}
declare function InfiniteVirtualList<T>({ height, width, className, emptyState, loadingMoreText, renderItem, ...options }: InfiniteVirtualListProps<T>): react_jsx_runtime.JSX.Element;

interface VirtualGridProps<T> {
    items: T[];
    height: number | string;
    width?: number | string;
    columns: number;
    rowHeight: number;
    gap?: number;
    overscan?: number;
    emptyState?: ReactNode;
    getItemKey?: (index: number) => string | number;
    renderItem: (item: T, index: number) => ReactNode;
}
declare function VirtualGrid<T>({ items, height, width, columns, rowHeight, gap, overscan, emptyState, getItemKey, renderItem }: VirtualGridProps<T>): react_jsx_runtime.JSX.Element;

interface ComboboxProps<TValue = string> extends UseComboboxOptions<TValue> {
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    inputId?: string;
    onBlur?: () => void;
}
declare function Combobox<TValue = string>({ options, value, onChange, filterFn, allowCustomValue, disabled, error, placeholder, inputId, onBlur }: ComboboxProps<TValue>): react_jsx_runtime.JSX.Element;

interface MultiComboboxProps<TValue = string> {
    options: ComboboxOption<TValue>[];
    value: TValue[];
    onChange: (values: TValue[]) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}
declare function MultiCombobox<TValue = string>({ options, value, onChange, disabled, error, placeholder }: MultiComboboxProps<TValue>): react_jsx_runtime.JSX.Element;

type ToastVariant = "info" | "success" | "warning" | "error";
interface ToastProps {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
    onClose?: (id: string) => void;
}
declare function Toast({ id, title, description, variant, onClose }: ToastProps): react_jsx_runtime.JSX.Element;

interface ToasterItem extends Omit<ToastProps, "onClose"> {
    durationMs?: number;
}
interface ToasterProps {
    toasts: ToasterItem[];
    onRemove: (id: string) => void;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}
declare function Toaster({ toasts, onRemove, position }: ToasterProps): react_jsx_runtime.JSX.Element | null;

interface TruncatedTextProps {
    children: ReactNode;
    /** Show full text as native tooltip on hover */
    title?: string;
    className?: string;
    style?: CSSProperties;
}
declare function TruncatedText({ children, title, className, style }: TruncatedTextProps): react_jsx_runtime.JSX.Element;

interface TableSkeletonProps {
    showToolbar?: boolean;
    showPagination?: boolean;
    showCheckbox?: boolean;
    columnWidths?: Array<number | string>;
    rowHeight?: number;
    dense?: boolean;
    rows?: number;
    columns?: number;
    className?: string;
}
declare function TableSkeleton({ rows, columns, showToolbar, showPagination, showCheckbox, columnWidths, rowHeight, dense, className }: TableSkeletonProps): react_jsx_runtime.JSX.Element;

interface CardSkeletonProps {
    count?: number;
    variant?: "standard" | "media" | "horizontal" | "compact";
    columns?: number;
    spacing?: number;
    showHeader?: boolean;
    showActions?: boolean;
    mediaHeight?: number;
    bodyLines?: number;
    className?: string;
}
declare function CardSkeleton({ count, variant, columns, spacing, showHeader, showActions, mediaHeight, bodyLines, className }: CardSkeletonProps): react_jsx_runtime.JSX.Element;

interface FormFieldConfig {
    type: "text" | "textarea" | "select" | "switch" | "checkbox" | "radio" | "file" | "date";
    span?: number;
}
interface FormSkeletonProps {
    fields?: FormFieldConfig[] | number;
    columns?: 1 | 2 | 3;
    showTitle?: boolean;
    showActions?: boolean;
    paper?: boolean;
    showDividers?: boolean;
    spacing?: number;
    className?: string;
}
declare function FormSkeleton({ fields, columns, showTitle, showActions, paper, showDividers, spacing, className }: FormSkeletonProps): react_jsx_runtime.JSX.Element;

interface ListSkeletonProps {
    count?: number;
    showAvatar?: boolean;
    avatarVariant?: "circular" | "rounded" | "square";
    avatarSize?: number;
    showSecondaryText?: boolean;
    showAction?: boolean;
    showDividers?: boolean;
    paper?: boolean;
    secondaryLines?: number;
    dense?: boolean;
    className?: string;
}
declare function ListSkeleton({ count, showAvatar, avatarVariant, avatarSize, showSecondaryText, showAction, showDividers, paper, secondaryLines, dense, className }: ListSkeletonProps): react_jsx_runtime.JSX.Element;

interface DetailSkeletonProps {
    fields?: number;
    columns?: 1 | 2 | 3;
    showHeader?: boolean;
    showHeaderActions?: boolean;
    showTabs?: boolean;
    tabCount?: number;
    paper?: boolean;
    className?: string;
}
declare function DetailSkeleton({ fields, columns, showHeader, showHeaderActions, showTabs, tabCount, paper, className }: DetailSkeletonProps): react_jsx_runtime.JSX.Element;

declare function cn(...classes: Array<string | false | null | undefined>): string;

declare function formatNumber(value: number, options?: Intl.NumberFormatOptions, locale?: string): string;
declare function formatCurrency(value: number, currency?: string, locale?: string): string;
declare function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions, locale?: string): string;
declare function formatRelativeTime(value: string | Date): string;

interface AriaProps {
    role?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-expanded"?: boolean;
    "aria-haspopup"?: boolean | "dialog" | "menu" | "listbox";
    "aria-controls"?: string;
    "aria-selected"?: boolean;
    "aria-disabled"?: boolean;
    "aria-invalid"?: boolean;
    tabIndex?: number;
}
declare function getAriaProps(overrides?: Partial<AriaProps>): AriaProps;
declare function getFocusTrapProps(containerId: string): {
    role: "dialog";
    "aria-modal": boolean;
    tabIndex: number;
    id: string;
};
declare function generateId(prefix: string): string;

export { AlertDialog, type AlertDialogProps, type AriaProps, CardSkeleton, CheckboxField, Combobox, ComboboxField, type ComboboxOption, ConfirmDialog, type ConfirmDialogProps, DataTable, DataTableColumnHeader, DataTablePagination, type DataTablePaginationLabels, type DataTableProps, type DataTableState, DataTableToolbar, DateField, DetailSkeleton, Dialog, type DialogCloseMeta, type DialogProps, type FieldConfig, FileField, Form, FormDialog, FormField, type FormFieldConfig, FormSkeleton, type HeadlessFieldProps, InfiniteVirtualList, type InlineEditState, ListSkeleton, MultiCombobox, NumberField, RadioGroupField, type RadioOption, SelectField, type SkeletonRepeatOptions, SwitchField, TableSkeleton, TextField, TextareaField, Toast, type ToastInput, type ToastItem, type ToastProps, type ToastSeverity, type ToastVariant, Toaster, type ToasterItem, TruncatedText, type UseClipboardOptions, type UseClipboardReturn, type UseComboboxOptions, type UseDataTableOptions, type UseDataTableReturn, type UseDataTableState, type UseDialogOptions, type UseDialogReturn, type UseInfiniteVirtualListOptions, type UseSkeletonReturn, type UseToastOptions, type UseToastReturn, type UseTypedFormOptions, type UseTypedFormResult, type UseVirtualListOptions, type UseVirtualListReturn, VirtualGrid, type VirtualItem, VirtualList, cn, formatCurrency, formatDate, formatNumber, formatRelativeTime, generateId, getAriaProps, getFocusTrapProps, useClipboard, useCombobox, useDataTable, useDialog, useFieldArray, useFormContext, useFormField, useInfiniteVirtualList, useSkeleton, useTableExport, useTableInlineEdit, useTablePagination, useTableSelection, useToast, useTypedForm, useVirtualList };
