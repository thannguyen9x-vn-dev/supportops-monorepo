'use strict';

var react = require('react');
var reactTable = require('@tanstack/react-table');
var reactHookForm = require('react-hook-form');
var jsxRuntime = require('react/jsx-runtime');

// src/headless/use-data-table/useDataTable.ts
function useTableInlineEdit({ enabled }) {
  const [editingCells, setEditingCells] = react.useState({});
  const [pendingEdits, setPendingEdits] = react.useState({});
  const startEditing = react.useCallback(
    (rowId, columnId) => {
      if (!enabled) return;
      setEditingCells((prev) => ({ ...prev, [`${rowId}:${columnId}`]: true }));
    },
    [enabled]
  );
  const cancelEditing = react.useCallback((rowId, columnId) => {
    setEditingCells((prev) => {
      const next = { ...prev };
      delete next[`${rowId}:${columnId}`];
      return next;
    });
    setPendingEdits((prev) => {
      const rowEdits = prev[rowId];
      if (!rowEdits) return prev;
      const next = { ...prev };
      const nextRow = { ...rowEdits };
      delete nextRow[columnId];
      if (Object.keys(nextRow).length === 0) {
        delete next[rowId];
      } else {
        next[rowId] = nextRow;
      }
      return next;
    });
  }, []);
  const updateCell = react.useCallback(
    (rowId, columnId, value) => {
      if (!enabled) return;
      setPendingEdits((prev) => ({
        ...prev,
        [rowId]: {
          ...prev[rowId] ?? {},
          [columnId]: value
        }
      }));
    },
    [enabled]
  );
  const discardRow = react.useCallback((rowId) => {
    setEditingCells((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith(`${rowId}:`)) {
          next[key] = value;
        }
      });
      return next;
    });
    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  }, []);
  const discardAll = react.useCallback(() => {
    setEditingCells({});
    setPendingEdits({});
  }, []);
  const getAllChanges = react.useCallback(
    () => Object.entries(pendingEdits).map(([rowId, changes]) => ({ rowId, changes })),
    [pendingEdits]
  );
  const isEditing = react.useCallback(
    (rowId, columnId) => Boolean(editingCells[`${rowId}:${columnId}`]),
    [editingCells]
  );
  const getPendingValue = react.useCallback(
    (rowId, columnId) => pendingEdits[rowId]?.[columnId],
    [pendingEdits]
  );
  const dirtyRowCount = react.useMemo(() => Object.keys(pendingEdits).length, [pendingEdits]);
  return {
    editingCells,
    pendingEdits,
    dirtyRowCount,
    startEditing,
    cancelEditing,
    updateCell,
    discardRow,
    discardAll,
    getAllChanges,
    isEditing,
    getPendingValue
  };
}

// src/headless/use-data-table/useDataTable.ts
function useDataTable(options) {
  const {
    columns,
    data,
    totalRows,
    rowId = "id",
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
    columnVisibility: externalColumnVisibility
  } = options;
  const [internalSorting, setInternalSorting] = react.useState([]);
  const [columnFilters, setColumnFilters] = react.useState([]);
  const [globalFilter, setGlobalFilter] = react.useState("");
  const [internalColumnVisibility, setInternalColumnVisibility] = react.useState({});
  const [rowSelection, setRowSelection] = react.useState({});
  const [pagination, setPagination] = react.useState({
    pageIndex,
    pageSize
  });
  const [columnPinning, setColumnPinning] = react.useState({
    left: pinnedColumns?.left ?? [],
    right: pinnedColumns?.right ?? []
  });
  const sorting = externalSorting !== void 0 ? externalSorting : internalSorting;
  const setSorting = externalOnSortingChange !== void 0 ? externalOnSortingChange : setInternalSorting;
  const columnVisibility = externalColumnVisibility !== void 0 ? externalColumnVisibility : internalColumnVisibility;
  const setColumnVisibility = externalColumnVisibility !== void 0 ? () => {
  } : setInternalColumnVisibility;
  const inlineEdit = useTableInlineEdit({ enabled: enableInlineEdit });
  react.useEffect(() => {
    setPagination(
      (prev) => prev.pageIndex === pageIndex ? prev : { ...prev, pageIndex }
    );
  }, [pageIndex]);
  react.useEffect(() => {
    setPagination(
      (prev) => prev.pageSize === pageSize ? prev : { ...prev, pageSize }
    );
  }, [pageSize]);
  react.useEffect(() => {
    onStateChange?.({ pagination, sorting, columnFilters, globalFilter });
  }, [pagination, sorting, columnFilters, globalFilter, onStateChange]);
  const getRowId = react.useCallback(
    (row) => {
      if (typeof rowId === "function") return rowId(row);
      return String(row[rowId]);
    },
    [rowId]
  );
  const table = reactTable.useReactTable({
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
    getCoreRowModel: reactTable.getCoreRowModel(),
    getSortedRowModel: serverSide ? void 0 : reactTable.getSortedRowModel(),
    getFilteredRowModel: serverSide ? void 0 : reactTable.getFilteredRowModel(),
    getPaginationRowModel: serverSide ? void 0 : reactTable.getPaginationRowModel(),
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide && totalRows ? Math.ceil(totalRows / pagination.pageSize) : void 0,
    getRowId,
    enableRowSelection: enableSelection
  });
  const selectedRowIds = react.useMemo(() => Object.keys(rowSelection), [rowSelection]);
  const selectedRows = react.useMemo(() => table.getSelectedRowModel().rows.map((row) => row.original), [table, rowSelection]);
  const hasActiveFilters = columnFilters.length > 0 || globalFilter.length > 0;
  const clearAllFilters = react.useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
  }, []);
  const clearSelection = react.useCallback(() => setRowSelection({}), []);
  const goToPage = react.useCallback((page) => setPagination((prev) => ({ ...prev, pageIndex: page })), []);
  const setPageSize = react.useCallback((size) => setPagination({ pageIndex: 0, pageSize: size }), []);
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
    ...enableInlineEdit ? { inlineEdit } : {},
    totalRows: totalRows ?? data.length,
    pageCount: table.getPageCount(),
    currentPage: pagination.pageIndex,
    isFirstPage: !table.getCanPreviousPage(),
    isLastPage: !table.getCanNextPage()
  };
}
function useTablePagination(table) {
  const goToPage = react.useCallback(
    (pageIndex) => {
      table.setPageIndex(pageIndex);
    },
    [table]
  );
  const setPageSize = react.useCallback(
    (pageSize) => {
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
function useTableSelection(table) {
  const selectedRows = react.useMemo(
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
function useTableExport(table) {
  const exportCsv = react.useCallback(
    (options = {}) => {
      const {
        fileName = "table-export.csv",
        separator = ",",
        includeHeaders = true
      } = options;
      const rows = table.getRowModel().rows;
      const columns = table.getVisibleLeafColumns();
      const header = includeHeaders ? `${columns.map((col) => JSON.stringify(String(col.id))).join(separator)}
` : "";
      const body = rows.map(
        (row) => columns.map((column) => {
          const value = row.getValue(column.id);
          return JSON.stringify(value ?? "");
        }).join(separator)
      ).join("\n");
      const csvContent = `${header}${body}`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [table]
  );
  return { exportCsv };
}
function useTypedForm(options) {
  const { schema, defaultValues, onSubmit, onError } = options;
  const form = reactHookForm.useForm({
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange"
  });
  const handleSubmit = form.handleSubmit(
    async (data) => {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const fieldPath = issue.path.join(".");
          if (fieldPath) {
            form.setError(fieldPath, { type: issue.code, message: issue.message });
          }
        });
        return;
      }
      try {
        await onSubmit(parsed.data);
      } catch (error) {
        if (error && typeof error === "object" && "fieldErrors" in error && error.fieldErrors && typeof error.fieldErrors === "object") {
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            form.setError(field, { type: "server", message });
          });
        }
        throw error;
      }
    },
    onError
  );
  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    reset: form.reset
  };
}
function useFormField(name, form) {
  const id = react.useId();
  const resolvedForm = form ?? reactHookForm.useFormContext();
  const {
    field,
    fieldState: { error, isTouched, isDirty },
    formState: { isSubmitting, isValidating }
  } = reactHookForm.useController({
    name,
    control: resolvedForm.control
  });
  const errorId = `${id}-error`;
  return react.useMemo(
    () => ({
      name: field.name,
      value: field.value,
      error: error?.message,
      isValidating,
      isTouched,
      isDirty,
      isSubmitting,
      onChange: field.onChange,
      onBlur: field.onBlur,
      ref: field.ref,
      id,
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? errorId : void 0
    }),
    [field, error, isValidating, isTouched, isDirty, isSubmitting, id, errorId]
  );
}
function useFieldArray(props) {
  const { control } = reactHookForm.useFormContext();
  return reactHookForm.useFieldArray({ ...props, control });
}
var useFormContext2 = reactHookForm.useFormContext;
function resolveItemSize(estimateSize, index) {
  return typeof estimateSize === "function" ? estimateSize(index) : estimateSize;
}
function useVirtualList(options) {
  const { items, estimateSize, overscan = 5 } = options;
  const scrollRef = react.useRef(null);
  const [scrollOffset, setScrollOffset] = react.useState(0);
  const [viewportSize, setViewportSize] = react.useState(0);
  const [isScrolling, setIsScrolling] = react.useState(false);
  react.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    setViewportSize(element.clientHeight);
    let timeoutId = null;
    const handleScroll = () => {
      setScrollOffset(element.scrollTop);
      setIsScrolling(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolling(false), 120);
    };
    const handleResize = () => {
      setViewportSize(element.clientHeight);
    };
    element.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  const starts = react.useMemo(() => {
    const offsets = [];
    let current = 0;
    items.forEach((_, index) => {
      offsets.push(current);
      current += resolveItemSize(estimateSize, index);
    });
    return offsets;
  }, [items, estimateSize]);
  const totalSize = react.useMemo(() => {
    if (items.length === 0) return 0;
    const lastIndex = items.length - 1;
    const lastStart = starts[lastIndex] ?? 0;
    return lastStart + resolveItemSize(estimateSize, lastIndex);
  }, [estimateSize, items.length, starts]);
  const startIndex = react.useMemo(() => {
    const estimated = resolveItemSize(estimateSize, 0) || 1;
    return Math.max(0, Math.floor(scrollOffset / estimated) - overscan);
  }, [estimateSize, overscan, scrollOffset]);
  const endIndex = react.useMemo(() => {
    const estimated = resolveItemSize(estimateSize, 0) || 1;
    const visibleCount = Math.ceil(viewportSize / estimated);
    return Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
  }, [estimateSize, items.length, overscan, startIndex, viewportSize]);
  const virtualItems = react.useMemo(() => {
    if (items.length === 0) return [];
    const result = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
      const item = items[index];
      if (item === void 0) continue;
      result.push({
        index,
        data: item,
        start: starts[index] ?? 0,
        size: resolveItemSize(estimateSize, index),
        key: options.getItemKey ? options.getItemKey(index) : index
      });
    }
    return result;
  }, [endIndex, estimateSize, items, options, startIndex, starts]);
  const scrollToIndex = react.useCallback(
    (index, scrollOptions) => {
      const element = scrollRef.current;
      if (!element) return;
      const start = starts[index] ?? 0;
      const size = resolveItemSize(estimateSize, index);
      const align = scrollOptions?.align ?? "start";
      if (align === "center") {
        element.scrollTop = Math.max(0, start - element.clientHeight / 2 + size / 2);
      } else if (align === "end") {
        element.scrollTop = Math.max(0, start - element.clientHeight + size);
      } else {
        element.scrollTop = start;
      }
    },
    [estimateSize, starts]
  );
  return {
    scrollRef,
    virtualItems,
    totalSize,
    scrollToIndex,
    scrollOffset,
    isScrolling
  };
}
function useInfiniteVirtualList(options) {
  const {
    isLoadingMore,
    hasMore,
    onLoadMore,
    loadMoreThreshold = 5,
    ...virtualOptions
  } = options;
  const virtualState = useVirtualList(virtualOptions);
  const onLoadMoreRef = react.useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  react.useEffect(() => {
    const lastVirtualItem = virtualState.virtualItems[virtualState.virtualItems.length - 1];
    if (!lastVirtualItem) return;
    const isNearEnd = lastVirtualItem.index >= virtualOptions.items.length - loadMoreThreshold;
    if (isNearEnd && hasMore && !isLoadingMore) {
      onLoadMoreRef.current();
    }
  }, [virtualState.virtualItems, virtualOptions.items.length, hasMore, isLoadingMore, loadMoreThreshold]);
  return {
    ...virtualState,
    isLoadingMore
  };
}
function useCombobox(options) {
  const {
    options: allOptions,
    value,
    onChange,
    filterFn,
    allowCustomValue = false
  } = options;
  const [isOpen, setIsOpen] = react.useState(false);
  const [query, setQuery] = react.useState("");
  const [highlightedIndex, setHighlightedIndex] = react.useState(-1);
  const inputRef = react.useRef(null);
  const listRef = react.useRef(null);
  const filteredOptions = react.useMemo(() => {
    if (!query) return allOptions;
    const defaultFilter = (opt, q) => opt.label.toLowerCase().includes(q.toLowerCase());
    return allOptions.filter((opt) => (filterFn ?? defaultFilter)(opt, query));
  }, [allOptions, query, filterFn]);
  const groupedOptions = react.useMemo(() => {
    const groups = /* @__PURE__ */ new Map();
    filteredOptions.forEach((option) => {
      const group = option.group ?? "";
      const current = groups.get(group) ?? [];
      groups.set(group, [...current, option]);
    });
    return groups;
  }, [filteredOptions]);
  const selectedOption = react.useMemo(
    () => allOptions.find((option) => option.value === value),
    [allOptions, value]
  );
  const selectOption = react.useCallback(
    (option) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );
  const handleKeyDown = react.useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setIsOpen(true);
          setHighlightedIndex((prev) => prev < filteredOptions.length - 1 ? prev + 1 : 0);
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => prev > 0 ? prev - 1 : filteredOptions.length - 1);
          break;
        case "Enter": {
          event.preventDefault();
          const highlightedOption = filteredOptions[highlightedIndex];
          if (highlightedOption) {
            selectOption(highlightedOption);
          } else if (allowCustomValue && query && onChange) {
            onChange(query);
            setIsOpen(false);
          }
          break;
        }
        case "Escape":
          setIsOpen(false);
          setQuery("");
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [allowCustomValue, filteredOptions, highlightedIndex, onChange, query, selectOption]
  );
  react.useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (event) => {
      if (!inputRef.current?.contains(event.target) && !listRef.current?.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);
  return {
    isOpen,
    query,
    highlightedIndex,
    filteredOptions,
    groupedOptions,
    selectedOption,
    setQuery,
    setIsOpen,
    selectOption,
    inputProps: {
      ref: inputRef,
      value: isOpen ? query : selectedOption?.label ?? "",
      onChange: (event) => {
        setQuery(event.target.value);
        setIsOpen(true);
        setHighlightedIndex(-1);
      },
      onFocus: () => setIsOpen(true),
      onKeyDown: handleKeyDown,
      role: "combobox",
      "aria-expanded": isOpen,
      "aria-autocomplete": "list",
      "aria-controls": "combobox-listbox"
    },
    listProps: {
      ref: listRef,
      id: "combobox-listbox",
      role: "listbox"
    },
    getOptionProps: (option, index) => ({
      role: "option",
      "aria-selected": option.value === value,
      "aria-disabled": option.disabled,
      "data-highlighted": index === highlightedIndex,
      onClick: () => selectOption(option),
      onMouseEnter: () => setHighlightedIndex(index)
    })
  };
}
function useDialog(options = {}) {
  const {
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    onClose,
    disableEscapeKeyClose = false,
    disableBackdropClose = false
  } = options;
  const [internalOpen, setInternalOpen] = react.useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = react.useCallback(
    (nextValue) => {
      if (controlledOpen === void 0) {
        setInternalOpen(nextValue);
      }
      onOpenChange?.(nextValue);
    },
    [controlledOpen, onOpenChange]
  );
  const open = react.useCallback(() => setOpen(true), [setOpen]);
  const close = react.useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose, setOpen]);
  const toggle = react.useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);
  const handleDialogClose = react.useCallback(
    (_event, reason) => {
      if (reason === "escapeKeyDown" && disableEscapeKeyClose) return;
      if (reason === "backdropClick" && disableBackdropClose) return;
      close();
    },
    [close, disableBackdropClose, disableEscapeKeyClose]
  );
  const dialogProps = react.useMemo(
    () => ({
      open: isOpen,
      onClose: handleDialogClose,
      "aria-modal": true,
      role: "dialog"
    }),
    [handleDialogClose, isOpen]
  );
  const triggerProps = react.useMemo(
    () => ({
      onClick: open,
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen
    }),
    [isOpen, open]
  );
  return {
    isOpen,
    open,
    close,
    toggle,
    dialogProps,
    triggerProps
  };
}
function useSkeleton(options) {
  const { count, keyPrefix = "skeleton" } = options;
  const items = react.useMemo(
    () => Array.from({ length: count }, (_, index) => `${keyPrefix}-${index}`),
    [count, keyPrefix]
  );
  return {
    items,
    containerProps: {
      "aria-busy": true,
      "aria-label": "Loading content",
      role: "status"
    }
  };
}
function useClipboard(options = {}) {
  const { resetDelay = 2e3 } = options;
  const [copied, setCopied] = react.useState(false);
  const [error, setError] = react.useState(null);
  const timerRef = react.useRef(null);
  const clearTimer = react.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  const reset = react.useCallback(() => {
    clearTimer();
    setCopied(false);
    setError(null);
  }, [clearTimer]);
  const copy = react.useCallback(
    async (text) => {
      clearTimer();
      setError(null);
      try {
        if (!navigator?.clipboard?.writeText) {
          throw new Error("Clipboard API is not available");
        }
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (resetDelay > 0) {
          timerRef.current = setTimeout(() => {
            setCopied(false);
          }, resetDelay);
        }
        return true;
      } catch (unknownError) {
        const normalizedError = unknownError instanceof Error ? unknownError : new Error("Failed to copy");
        setError(normalizedError);
        setCopied(false);
        return false;
      }
    },
    [clearTimer, resetDelay]
  );
  const read = react.useCallback(async () => {
    try {
      if (!navigator?.clipboard?.readText) {
        throw new Error("Clipboard API is not available");
      }
      return await navigator.clipboard.readText();
    } catch (unknownError) {
      const normalizedError = unknownError instanceof Error ? unknownError : new Error("Failed to read clipboard");
      setError(normalizedError);
      return null;
    }
  }, []);
  react.useEffect(() => () => clearTimer(), [clearTimer]);
  return {
    copied,
    error,
    copy,
    read,
    reset
  };
}
function nextId(counter) {
  return `toast-${counter}-${Date.now()}`;
}
function useToast(options = {}) {
  const { maxToasts = 5, defaultDuration = 4e3 } = options;
  const [toasts, setToasts] = react.useState([]);
  const timersRef = react.useRef(/* @__PURE__ */ new Map());
  const counterRef = react.useRef(0);
  const clearTimer = react.useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);
  const dismiss = react.useCallback(
    (id) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((toast2) => toast2.id !== id));
    },
    [clearTimer]
  );
  const dismissAll = react.useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);
  const toast = react.useCallback(
    (input) => {
      counterRef.current += 1;
      const id = nextId(counterRef.current);
      const severity = input.severity ?? "info";
      const duration = input.duration ?? defaultDuration;
      const item = {
        id,
        title: input.title,
        message: input.message,
        severity,
        duration,
        createdAt: Date.now()
      };
      setToasts((prev) => {
        const next = [...prev, item];
        if (next.length <= maxToasts) return next;
        const overflow = next.length - maxToasts;
        const removed = next.slice(0, overflow);
        removed.forEach((toastItem) => clearTimer(toastItem.id));
        return next.slice(overflow);
      });
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [clearTimer, defaultDuration, dismiss, maxToasts]
  );
  const createHelper = react.useCallback(
    (severity) => (message, title, duration) => toast({ message, title, duration, severity }),
    [toast]
  );
  react.useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );
  return {
    toasts,
    toast,
    success: createHelper("success"),
    error: createHelper("error"),
    warning: createHelper("warning"),
    info: createHelper("info"),
    dismiss,
    dismissAll
  };
}

// src/utils/cn.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function getPageItems(pageIndex, pageCount) {
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
function DataTablePagination({
  table,
  totalRows,
  pageSizeOptions = [10, 20, 30, 50, 100],
  labels
}) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = totalRows ?? table.getRowCount();
  const pageCount = table.getPageCount();
  const pageItems = getPageItems(pageIndex, pageCount);
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);
  const showingCount = total === 0 ? 0 : to - from + 1;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      style: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "12px 0 0 0",
        boxSizing: "border-box"
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            style: {
              color: "var(--mui-palette-text-secondary)",
              fontSize: "14px",
              lineHeight: 1.4,
              minWidth: "200px"
            },
            children: labels?.showing ? labels.showing(from, to, total) : `Showing ${showingCount} ${labels?.outOf ?? "out of"} ${total}`
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "14px", justifyContent: "center", flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              "aria-label": labels?.previous ?? "Previous page",
              disabled: !table.getCanPreviousPage(),
              onClick: () => table.previousPage(),
              style: {
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: "var(--mui-palette-text-secondary)",
                opacity: table.getCanPreviousPage() ? 1 : 0.4,
                cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
                fontSize: "24px",
                lineHeight: 1
              },
              type: "button",
              children: "\u2039"
            }
          ),
          pageItems.map(
            (item, index) => item === "ellipsis" ? /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                style: { width: "24px", textAlign: "center", color: "var(--mui-palette-text-secondary)" },
                children: "..."
              },
              `ellipsis-${index}`
            ) : /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                "aria-label": `Page ${item}`,
                "aria-current": item === pageIndex + 1 ? "page" : void 0,
                onClick: () => table.setPageIndex(item - 1),
                style: {
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: item === pageIndex + 1 ? "1px solid rgba(var(--mui-palette-primary-mainChannel) / 0.28)" : "1px solid var(--mui-palette-divider)",
                  background: item === pageIndex + 1 ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)" : "transparent",
                  color: item === pageIndex + 1 ? "var(--mui-palette-primary-main)" : "var(--mui-palette-text-secondary)",
                  fontWeight: item === pageIndex + 1 ? 700 : 500,
                  fontSize: "14px",
                  cursor: "pointer"
                },
                type: "button",
                children: item
              },
              `page-${item}`
            )
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              "aria-label": labels?.next ?? "Next page",
              disabled: !table.getCanNextPage(),
              onClick: () => table.nextPage(),
              style: {
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: "var(--mui-palette-text-secondary)",
                opacity: table.getCanNextPage() ? 1 : 0.4,
                cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
                fontSize: "24px",
                lineHeight: 1
              },
              type: "button",
              children: "\u203A"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "label",
          {
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--mui-palette-text-secondary)",
              fontSize: "14px",
              marginLeft: "auto"
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: labels?.rows ?? "Rows per page" }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "span",
                {
                  style: {
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "select",
                      {
                        "aria-label": labels?.rows ?? "Rows per page",
                        onChange: (event) => table.setPageSize(Number(event.target.value)),
                        style: {
                          height: "40px",
                          minWidth: "76px",
                          borderRadius: "8px",
                          border: "1px solid var(--mui-palette-divider)",
                          background: "var(--mui-palette-background-paper)",
                          color: "var(--mui-palette-text-primary)",
                          padding: "0 36px 0 12px",
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none"
                        },
                        value: pageSize,
                        children: pageSizeOptions.map((size) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: size, children: size }, size))
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "span",
                      {
                        "aria-hidden": true,
                        style: {
                          position: "absolute",
                          right: "12px",
                          pointerEvents: "none",
                          color: "var(--mui-palette-text-secondary)",
                          display: "inline-flex",
                          alignItems: "center"
                        },
                        children: /* @__PURE__ */ jsxRuntime.jsx("svg", { fill: "none", height: "20", viewBox: "0 0 20 20", width: "20", children: /* @__PURE__ */ jsxRuntime.jsx(
                          "path",
                          {
                            d: "M6 8l4 4 4-4",
                            stroke: "currentColor",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: "1.8"
                          }
                        ) })
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function DataTableToolbar({
  selectedCount = 0,
  dirtyRowCount = 0,
  onBulkDelete,
  onSaveAll,
  onDiscardAll,
  onExport
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [
      selectedCount > 0 ? /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        selectedCount,
        " selected"
      ] }) : null,
      dirtyRowCount > 0 ? /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        dirtyRowCount,
        " unsaved"
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
      onExport ? /* @__PURE__ */ jsxRuntime.jsx("button", { className: "rounded border px-3 py-1 text-sm", onClick: onExport, type: "button", children: "Export" }) : null,
      onBulkDelete ? /* @__PURE__ */ jsxRuntime.jsx("button", { className: "rounded border px-3 py-1 text-sm text-red-600", onClick: onBulkDelete, type: "button", children: "Delete selected" }) : null,
      onDiscardAll ? /* @__PURE__ */ jsxRuntime.jsx("button", { className: "rounded border px-3 py-1 text-sm", onClick: onDiscardAll, type: "button", children: "Discard all" }) : null,
      onSaveAll ? /* @__PURE__ */ jsxRuntime.jsx("button", { className: "rounded bg-blue-600 px-3 py-1 text-sm text-white", onClick: onSaveAll, type: "button", children: "Save all" }) : null
    ] })
  ] });
}
var ROW_HEIGHT = {
  comfortable: 56,
  compact: 44
};
var HEADER_HEIGHT = 48;
function getStickyStyle(pinned, offsetLeft, offsetRight, background, zIndex) {
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? offsetLeft : void 0,
    right: pinned === "right" ? offsetRight : void 0,
    zIndex,
    background,
    // Shadow separates the sticky cell from scrolling content.
    // box-shadow avoids the double-border issue that border causes.
    boxShadow: pinned === "left" ? "2px 0 4px -2px rgba(0,0,0,0.10)" : "-2px 0 4px -2px rgba(0,0,0,0.10)"
  };
}
function DataTable({
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
  bodyMaxHeight
}) {
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const rowHeight = ROW_HEIGHT[rowDensity];
  const tableMinWidth = visibleColumns.reduce((sum, col) => sum + col.getSize(), 0);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%"
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          DataTableToolbar,
          {
            dirtyRowCount,
            onBulkDelete,
            onDiscardAll,
            onExport,
            onSaveAll,
            selectedCount,
            table
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            style: {
              borderRadius: 8,
              border: "1px solid var(--mui-palette-divider)",
              overflow: "hidden",
              opacity: isLoading ? 0.6 : 1,
              pointerEvents: isLoading ? "none" : "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flex: 1
            },
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                style: {
                  overflowX: "auto",
                  overflowY: "auto",
                  height: bodyHeight,
                  maxHeight: bodyMaxHeight,
                  flex: bodyHeight ? void 0 : 1,
                  minHeight: 0
                },
                children: /* @__PURE__ */ jsxRuntime.jsxs(
                  "table",
                  {
                    style: {
                      tableLayout: "fixed",
                      width: "100%",
                      minWidth: tableMinWidth,
                      borderCollapse: "collapse",
                      fontSize: 14,
                      fontWeight: 400
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx("colgroup", { children: visibleColumns.map((col) => /* @__PURE__ */ jsxRuntime.jsx("col", { style: { width: col.getSize() } }, col.id)) }),
                      /* @__PURE__ */ jsxRuntime.jsx(
                        "thead",
                        {
                          style: {
                            borderBottom: "1px solid var(--mui-palette-divider)",
                            background: "var(--mui-palette-grey-50)"
                          },
                          children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntime.jsx("tr", { children: headerGroup.headers.map((header, headerIndex) => {
                            const pinned = header.column.getIsPinned();
                            const isLastColumn = headerIndex === headerGroup.headers.length - 1;
                            return /* @__PURE__ */ jsxRuntime.jsx(
                              "th",
                              {
                                className: "text-left font-medium text-gray-500",
                                style: {
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
                                    3
                                  )
                                },
                                children: header.isPlaceholder ? null : reactTable.flexRender(header.column.columnDef.header, header.getContext())
                              },
                              header.id
                            );
                          }) }, headerGroup.id))
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: rows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsx(
                        "td",
                        {
                          colSpan: visibleColumns.length,
                          style: { padding: "64px 0", textAlign: "center", color: "var(--mui-palette-text-secondary)" },
                          children: emptyState ?? "No data found"
                        }
                      ) }) : rows.map((row) => {
                        const isDirty = highlightDirtyRows && dirtyRowIds?.has(row.id);
                        const isSelected = row.getIsSelected();
                        const rowBg = isSelected ? "var(--mui-palette-action-selected)" : isDirty ? "rgba(234, 179, 8, 0.05)" : "var(--mui-palette-background-paper)";
                        return /* @__PURE__ */ jsxRuntime.jsx(
                          "tr",
                          {
                            className: cn(
                              "transition-colors hover:bg-gray-50/60",
                              isSelected ? "bg-blue-50/50" : "",
                              isDirty ? "border-l-4 border-l-yellow-400 bg-yellow-50/50" : "",
                              onRowClick ? "cursor-pointer" : "",
                              rowClassName?.(row.original)
                            ),
                            onClick: () => onRowClick?.(row.original),
                            children: row.getVisibleCells().map((cell, cellIndex) => {
                              const pinned = cell.column.getIsPinned();
                              const isLastColumn = cellIndex === row.getVisibleCells().length - 1;
                              return /* @__PURE__ */ jsxRuntime.jsx(
                                "td",
                                {
                                  style: {
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
                                      1
                                    )
                                  },
                                  children: /* @__PURE__ */ jsxRuntime.jsx(
                                    "div",
                                    {
                                      style: {
                                        overflow: isLastColumn ? "visible" : "hidden",
                                        textOverflow: isLastColumn ? "clip" : "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: "100%",
                                        display: isLastColumn ? "flex" : "block",
                                        justifyContent: isLastColumn ? "flex-end" : "flex-start"
                                      },
                                      children: reactTable.flexRender(cell.column.columnDef.cell, cell.getContext())
                                    }
                                  )
                                },
                                cell.id
                              );
                            })
                          },
                          row.id
                        );
                      }) })
                    ]
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { style: { marginTop: "auto" }, children: /* @__PURE__ */ jsxRuntime.jsx(DataTablePagination, { labels: paginationLabels, table, totalRows }) })
      ]
    }
  );
}
function DataTableColumnHeader({ column, title }) {
  if (!column.getCanSort()) {
    return /* @__PURE__ */ jsxRuntime.jsx("span", { children: title });
  }
  const sorted = column.getIsSorted();
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      className: cn(
        "-ml-2 flex items-center gap-1 rounded px-2 py-1 transition-colors hover:text-gray-900",
        sorted ? "font-semibold text-gray-900" : ""
      ),
      onClick: column.getToggleSortingHandler(),
      type: "button",
      children: [
        title,
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs", children: sorted === "asc" ? "\u2191" : sorted === "desc" ? "\u2193" : "\u2195" })
      ]
    }
  );
}
function resolveState(props) {
  if ("dialog" in props) {
    return {
      open: props.dialog.isOpen,
      onClose: props.dialog.close
    };
  }
  return {
    open: props.open,
    onClose: props.onClose
  };
}
function Dialog(props) {
  const {
    title,
    subtitle,
    titleElement,
    children,
    maxWidthClassName = "max-w-2xl",
    showCloseButton = false,
    dividers = false,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy
  } = props;
  const footer = props.actions ?? props.footer;
  const { open, onClose } = resolveState(props);
  react.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      "aria-modal": "true",
      className: "fixed inset-0 z-[1400] flex items-center justify-center p-4",
      onClick: onClose,
      role: "dialog",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 bg-black/50" }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn("relative z-[1401] w-full overflow-hidden rounded-xl bg-white shadow-2xl", maxWidthClassName),
            onClick: (event) => event.stopPropagation(),
            children: [
              title || titleElement ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative border-b px-6 py-4", children: [
                titleElement ? titleElement : /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-lg font-semibold", children: title }),
                  subtitle ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-0.5 text-sm text-gray-500", children: subtitle }) : null
                ] }),
                showCloseButton ? /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    "aria-label": "Close dialog",
                    className: "absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100",
                    onClick: onClose,
                    type: "button",
                    children: "x"
                  }
                ) : null
              ] }) : null,
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("px-6 py-5", dividers ? "border-b border-t" : ""), children }),
              footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end gap-2 border-t px-6 py-4", children: footer }) : null
            ]
          }
        )
      ]
    }
  );
}
function resolveColor(props) {
  if ("dialog" in props) {
    return props.severity === "error" ? "error" : "default";
  }
  return props.confirmColor ?? "default";
}
function ConfirmDialog(props) {
  const [loading, setLoading] = react.useState(false);
  const confirmColor = resolveColor(props);
  const isHook = "dialog" in props;
  const externalProcessing = isHook ? false : props.isProcessing ?? false;
  const isProcessing = externalProcessing || loading;
  const onClose = isHook ? props.dialog.close : props.onClose;
  const open = isHook ? props.dialog.isOpen : props.open;
  const cancelLabel = isHook ? props.cancelLabel ?? "Cancel" : props.cancelLabel;
  const confirmLabel = isHook ? props.confirmLabel ?? "Confirm" : props.confirmLabel;
  const processingLabel = isHook ? props.processingLabel ?? "Processing..." : props.processingLabel;
  const description = isHook ? props.message : props.description;
  const confirmDisabled = isHook ? props.confirmDisabled ?? false : false;
  const handleCancel = react.useCallback(() => {
    if (isProcessing) return;
    if (isHook) {
      props.onCancel?.();
    }
    onClose();
  }, [isHook, isProcessing, onClose, props]);
  const handleConfirm = react.useCallback(async () => {
    if (isProcessing || confirmDisabled) return;
    if (!isHook && props.isProcessing !== void 0) {
      await props.onConfirm();
      return;
    }
    try {
      setLoading(true);
      await props.onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }, [confirmDisabled, isHook, isProcessing, onClose, props]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    Dialog,
    {
      onClose,
      open,
      title: props.title,
      footer: /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("button", { className: "rounded border px-3 py-1.5 text-sm", onClick: handleCancel, type: "button", children: cancelLabel }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            className: cn(
              "rounded px-3 py-1.5 text-sm text-white disabled:opacity-60",
              confirmColor === "error" ? "bg-red-600" : "bg-blue-600"
            ),
            disabled: isProcessing || confirmDisabled,
            onClick: () => {
              void handleConfirm();
            },
            type: "button",
            children: isProcessing ? processingLabel ?? confirmLabel : confirmLabel
          }
        )
      ] }),
      children: description ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm text-gray-600", children: description }) : null
    }
  );
}
function severityAccent(severity) {
  switch (severity) {
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
}
function AlertDialog(props) {
  const isHook = "dialog" in props;
  const open = isHook ? props.dialog.isOpen : props.open;
  const onClose = isHook ? props.dialog.close : props.onClose;
  const closeLabel = isHook ? props.closeLabel ?? "OK" : props.closeLabel;
  const description = isHook ? props.message : props.description;
  const severity = isHook ? props.severity ?? "info" : "info";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Dialog,
    {
      onClose,
      open,
      titleElement: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: `inline-block h-3 w-3 rounded-full ${severityAccent(severity)}` }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-lg font-semibold", children: props.title })
      ] }),
      footer: /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          className: "rounded bg-blue-600 px-3 py-1.5 text-sm text-white",
          onClick: onClose,
          type: "button",
          children: closeLabel
        }
      ),
      children: description ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm text-gray-600", children: description }) : null
    }
  );
}
function FormDialog({
  dialog,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitDisabled = false,
  maxWidthClassName = "max-w-2xl",
  dividers = true
}) {
  const [loading, setLoading] = react.useState(false);
  const handleSubmit = react.useCallback(async () => {
    if (loading || submitDisabled) return;
    try {
      setLoading(true);
      await onSubmit();
      dialog.close();
    } finally {
      setLoading(false);
    }
  }, [dialog, loading, onSubmit, submitDisabled]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    Dialog,
    {
      actions: /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            className: "rounded border px-3 py-1.5 text-sm",
            disabled: loading,
            onClick: dialog.close,
            type: "button",
            children: cancelLabel
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            className: "rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-60",
            disabled: loading || submitDisabled,
            onClick: () => {
              void handleSubmit();
            },
            type: "button",
            children: loading ? "Saving..." : submitLabel
          }
        )
      ] }),
      dialog,
      dividers,
      maxWidthClassName,
      showCloseButton: true,
      subtitle,
      title,
      children
    }
  );
}
function Form({ form, onSubmit, children, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(reactHookForm.FormProvider, { ...form, children: /* @__PURE__ */ jsxRuntime.jsx("form", { noValidate: true, onSubmit, ...props, children }) });
}
function FormField({
  name,
  form,
  label,
  description,
  required,
  className,
  children
}) {
  const field = useFormField(name, form);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("space-y-2", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "label",
      {
        className: cn("text-sm font-medium leading-none", field.error ? "text-red-600" : ""),
        htmlFor: field.id,
        children: [
          label,
          required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ml-1 text-red-500", children: "*" }) : null
        ]
      }
    ),
    description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-gray-500", children: description }) : null,
    children(field),
    field.error ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-red-600", id: `${field.id}-error`, role: "alert", children: field.error }) : null
  ] });
}
function TextField({
  name,
  form,
  label,
  placeholder,
  description,
  required,
  type = "text",
  autoComplete,
  className,
  inputClassName,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      "aria-describedby": field["aria-describedby"],
      "aria-invalid": field["aria-invalid"],
      autoComplete,
      className: cn(
        "w-full rounded-md border px-3 py-2 text-sm",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:bg-gray-50 disabled:text-gray-500",
        field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300",
        inputClassName
      ),
      disabled: disabled || field.isSubmitting,
      id: field.id,
      onBlur: field.onBlur,
      onChange: (event) => field.onChange(event.target.value),
      placeholder,
      ref: field.ref,
      type,
      value: String(field.value ?? "")
    }
  ) });
}
function SelectField({
  name,
  form,
  label,
  options,
  placeholder,
  description,
  required,
  className,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => /* @__PURE__ */ jsxRuntime.jsxs(
    "select",
    {
      "aria-describedby": field["aria-describedby"],
      "aria-invalid": field["aria-invalid"],
      className: cn(
        "w-full rounded-md border px-3 py-2 text-sm",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:bg-gray-50 disabled:text-gray-500",
        field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
      ),
      disabled: disabled || field.isSubmitting,
      id: field.id,
      onBlur: field.onBlur,
      onChange: (event) => field.onChange(event.target.value),
      ref: field.ref,
      value: String(field.value ?? ""),
      children: [
        placeholder ? /* @__PURE__ */ jsxRuntime.jsx("option", { disabled: true, value: "", children: placeholder }) : null,
        options.map((option) => /* @__PURE__ */ jsxRuntime.jsx("option", { disabled: option.disabled, value: option.value, children: option.label }, option.value))
      ]
    }
  ) });
}
function NumberField({
  name,
  form,
  label,
  placeholder,
  description,
  required,
  min,
  max,
  step,
  prefix,
  suffix,
  className,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
    prefix ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400", children: prefix }) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        "aria-describedby": field["aria-describedby"],
        "aria-invalid": field["aria-invalid"],
        className: cn(
          "w-full rounded-md border px-3 py-2 text-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
          field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300",
          prefix ? "pl-8" : "",
          suffix ? "pr-12" : ""
        ),
        disabled: disabled || field.isSubmitting,
        id: field.id,
        max,
        min,
        onBlur: field.onBlur,
        onChange: (event) => {
          const rawValue = event.target.value;
          field.onChange(rawValue === "" ? void 0 : Number(rawValue));
        },
        placeholder,
        ref: field.ref,
        step,
        type: "number",
        value: field.value === void 0 || field.value === null ? "" : String(field.value)
      }
    ),
    suffix ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400", children: suffix }) : null
  ] }) });
}
function Combobox({
  options,
  value,
  onChange,
  filterFn,
  allowCustomValue,
  disabled,
  error,
  placeholder,
  inputId,
  onBlur
}) {
  const combobox = useCombobox({
    options,
    value,
    onChange,
    filterFn,
    allowCustomValue
  });
  const handleInputKeyDown = (event) => {
    combobox.inputProps.onKeyDown(event);
    if (event.key === "Tab") {
      onBlur?.();
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        ...combobox.inputProps,
        className: cn(
          "w-full rounded-md border px-3 py-2 text-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled ? "cursor-not-allowed bg-gray-50 text-gray-500" : "",
          error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
        ),
        disabled,
        id: inputId,
        onBlur: () => onBlur?.(),
        onChange: combobox.inputProps.onChange,
        onFocus: combobox.inputProps.onFocus,
        onKeyDown: handleInputKeyDown,
        placeholder
      }
    ),
    combobox.isOpen && combobox.filteredOptions.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx(
      "ul",
      {
        ...combobox.listProps,
        className: "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg",
        children: combobox.filteredOptions.map((option, index) => {
          const optionProps = combobox.getOptionProps(option, index);
          return /* @__PURE__ */ react.createElement(
            "li",
            {
              ...optionProps,
              className: cn(
                "cursor-pointer px-3 py-2 text-sm",
                option.disabled ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-100",
                combobox.highlightedIndex === index ? "bg-blue-50 text-blue-700" : ""
              ),
              key: `${String(option.value)}-${index}`
            },
            /* @__PURE__ */ jsxRuntime.jsx("div", { children: option.label }),
            option.description ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs text-gray-500", children: option.description }) : null
          );
        })
      }
    ) : null
  ] });
}
function ComboboxField({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  options,
  placeholder,
  allowCustomValue,
  filterFn
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => /* @__PURE__ */ jsxRuntime.jsx(
    Combobox,
    {
      allowCustomValue,
      disabled: disabled || field.isSubmitting,
      error: field.error,
      filterFn,
      inputId: field.id,
      onBlur: field.onBlur,
      onChange: (value) => field.onChange(value),
      options,
      placeholder,
      value: field.value
    }
  ) });
}
function DateField({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  type = "date",
  min,
  max
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      "aria-describedby": field["aria-describedby"],
      "aria-invalid": field["aria-invalid"],
      className: cn(
        "w-full rounded-md border px-3 py-2 text-sm",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:bg-gray-50 disabled:text-gray-500",
        field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
      ),
      disabled: disabled || field.isSubmitting,
      id: field.id,
      max,
      min,
      onBlur: field.onBlur,
      onChange: (event) => field.onChange(event.target.value),
      ref: field.ref,
      type,
      value: String(field.value ?? "")
    }
  ) });
}
function SwitchField({
  name,
  form,
  label,
  description,
  className,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, children: (field) => /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      "aria-describedby": field["aria-describedby"],
      "aria-invalid": field["aria-invalid"],
      "aria-pressed": Boolean(field.value),
      className: [
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        disabled || field.isSubmitting ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        field.value ? "bg-blue-600" : "bg-gray-300"
      ].join(" "),
      disabled: disabled || field.isSubmitting,
      id: field.id,
      onBlur: field.onBlur,
      onClick: () => field.onChange(!field.value),
      type: "button",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: [
              "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
              field.value ? "translate-x-5" : "translate-x-1"
            ].join(" ")
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: label })
      ]
    }
  ) });
}
function CheckboxField({
  name,
  form,
  label,
  description,
  className,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, children: (field) => /* @__PURE__ */ jsxRuntime.jsx("label", { className: "inline-flex items-center gap-2", children: /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      "aria-describedby": field["aria-describedby"],
      "aria-invalid": field["aria-invalid"],
      checked: Boolean(field.value),
      className: cn(
        "h-4 w-4 rounded border-gray-300 text-blue-600",
        "focus:ring-2 focus:ring-blue-500"
      ),
      disabled: disabled || field.isSubmitting,
      id: field.id,
      onBlur: field.onBlur,
      onChange: (event) => field.onChange(event.target.checked),
      ref: field.ref,
      type: "checkbox"
    }
  ) }) });
}
function TextareaField({
  name,
  form,
  label,
  placeholder,
  description,
  required,
  className,
  disabled,
  rows = 4,
  minLength,
  maxLength,
  showCount = false
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => {
    const value = String(field.value ?? "");
    const countText = showCount && maxLength ? `${value.length}/${maxLength}` : null;
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "textarea",
        {
          "aria-describedby": field["aria-describedby"],
          "aria-invalid": field["aria-invalid"],
          className: cn(
            "w-full rounded-md border px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          ),
          disabled: disabled || field.isSubmitting,
          id: field.id,
          maxLength,
          minLength,
          onBlur: field.onBlur,
          onChange: (event) => field.onChange(event.target.value),
          placeholder,
          ref: field.ref,
          rows,
          value
        }
      ),
      countText ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-right text-xs text-gray-500", children: countText }) : null
    ] });
  } });
}
function normalizeFiles(value) {
  if (!value) return [];
  if (value instanceof File) return [value];
  if (Array.isArray(value)) return value.filter((item) => item instanceof File);
  return [];
}
function FileField({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  accept,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  dropzoneText = "Drop files here or click to upload"
}) {
  const inputRef = react.useRef(null);
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => {
    const files = normalizeFiles(field.value);
    const hasLimit = maxSize > 0;
    const handleFiles = (fileList) => {
      if (!fileList) return;
      const incoming = Array.from(fileList).filter((file) => !hasLimit ? true : file.size <= maxSize);
      if (multiple) {
        const next = [...files, ...incoming].slice(0, maxFiles);
        field.onChange(next);
        return;
      }
      field.onChange(incoming[0] ?? null);
    };
    const handleInputChange = (event) => {
      handleFiles(event.target.files);
      event.target.value = "";
    };
    const handleDrop = (event) => {
      event.preventDefault();
      if (disabled || field.isSubmitting) return;
      handleFiles(event.dataTransfer.files);
    };
    const removeFile = (index) => {
      if (!multiple) {
        field.onChange(null);
        return;
      }
      const next = files.filter((_, fileIndex) => fileIndex !== index);
      field.onChange(next);
    };
    const helper = files.map((file, index) => ({
      key: `${file.name}-${index}`,
      label: `${file.name} (${Math.round(file.size / 1024)}KB)`,
      index
    }));
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          "aria-describedby": field["aria-describedby"],
          "aria-invalid": field["aria-invalid"],
          className: cn(
            "w-full rounded-md border-2 border-dashed px-4 py-6 text-sm text-gray-600",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            field.error ? "border-red-300" : "border-gray-300",
            disabled || field.isSubmitting ? "cursor-not-allowed bg-gray-50 opacity-70" : "hover:border-blue-400 hover:bg-blue-50/30"
          ),
          disabled: disabled || field.isSubmitting,
          id: field.id,
          onBlur: field.onBlur,
          onClick: () => inputRef.current?.click(),
          onDragOver: (event) => event.preventDefault(),
          onDrop: handleDrop,
          type: "button",
          children: dropzoneText
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          accept,
          className: "hidden",
          disabled: disabled || field.isSubmitting,
          multiple,
          onChange: handleInputChange,
          ref: inputRef,
          type: "file"
        }
      ),
      helper.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "space-y-1", children: helper.map((file) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-xs text-gray-600", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: file.label }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            className: "text-red-600 hover:text-red-700",
            disabled: disabled || field.isSubmitting,
            onClick: () => removeFile(file.index),
            type: "button",
            children: "Remove"
          }
        )
      ] }, file.key)) }) : null
    ] });
  } });
}
function RadioGroupField({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  options,
  row = false
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(FormField, { className, description, form, label, name, required, children: (field) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: row ? "flex flex-wrap gap-4" : "space-y-2", children: options.map((option) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-gray-700", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        "aria-describedby": field["aria-describedby"],
        "aria-invalid": field["aria-invalid"],
        checked: String(field.value ?? "") === option.value,
        disabled: disabled || field.isSubmitting || option.disabled,
        name: String(field.name),
        onBlur: field.onBlur,
        onChange: () => field.onChange(option.value),
        ref: field.ref,
        type: "radio",
        value: option.value
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("span", { children: option.label })
  ] }, option.value)) }) });
}
function VirtualList({
  height,
  width = "100%",
  className,
  loading,
  loadingSkeleton,
  emptyState,
  renderItem,
  ...options
}) {
  const { scrollRef, virtualItems, totalSize } = useVirtualList(options);
  if (loading && loadingSkeleton) {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: loadingSkeleton });
  }
  if (options.items.length === 0 && emptyState) {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: emptyState });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className,
      ref: scrollRef,
      style: {
        height,
        width,
        overflow: "auto",
        position: "relative"
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          style: {
            height: totalSize,
            position: "relative",
            width: "100%"
          },
          children: virtualItems.map((virtualItem) => /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              style: {
                height: virtualItem.size,
                left: 0,
                position: "absolute",
                top: 0,
                transform: `translateY(${virtualItem.start}px)`,
                width: "100%"
              },
              children: renderItem(virtualItem.data, virtualItem.index)
            },
            virtualItem.key
          ))
        }
      )
    }
  );
}
function InfiniteVirtualList({
  height,
  width = "100%",
  className,
  emptyState,
  loadingMoreText = "Loading more...",
  renderItem,
  ...options
}) {
  const { scrollRef, virtualItems, totalSize, isLoadingMore } = useInfiniteVirtualList(options);
  if (options.items.length === 0 && emptyState) {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: emptyState });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className,
      ref: scrollRef,
      style: {
        height,
        width,
        overflow: "auto",
        position: "relative"
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            style: {
              height: totalSize,
              position: "relative",
              width: "100%"
            },
            children: virtualItems.map((virtualItem) => /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                style: {
                  height: virtualItem.size,
                  left: 0,
                  position: "absolute",
                  top: 0,
                  transform: `translateY(${virtualItem.start}px)`,
                  width: "100%"
                },
                children: renderItem(virtualItem.data, virtualItem.index)
              },
              virtualItem.key
            ))
          }
        ),
        isLoadingMore ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "py-2 text-center text-sm text-gray-500", children: loadingMoreText }) : null
      ]
    }
  );
}
function VirtualGrid({
  items,
  height,
  width = "100%",
  columns,
  rowHeight,
  gap = 0,
  overscan = 5,
  emptyState,
  getItemKey,
  renderItem
}) {
  const rows = react.useMemo(() => {
    const chunked = [];
    for (let index = 0; index < items.length; index += columns) {
      chunked.push(items.slice(index, index + columns));
    }
    return chunked;
  }, [items, columns]);
  const { scrollRef, virtualItems, totalSize } = useVirtualList({
    items: rows,
    estimateSize: rowHeight + gap,
    gap,
    overscan,
    getItemKey
  });
  if (items.length === 0 && emptyState) {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: emptyState });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: scrollRef,
      style: {
        height,
        width,
        overflow: "auto",
        position: "relative"
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          style: {
            height: totalSize,
            position: "relative",
            width: "100%"
          },
          children: virtualItems.map((virtualRow) => /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              style: {
                display: "grid",
                gap,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                left: 0,
                position: "absolute",
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                width: "100%"
              },
              children: virtualRow.data.map((item, colIndex) => {
                const itemIndex = virtualRow.index * columns + colIndex;
                return /* @__PURE__ */ jsxRuntime.jsx("div", { children: renderItem(item, itemIndex) }, itemIndex);
              })
            },
            virtualRow.key
          ))
        }
      )
    }
  );
}
function MultiCombobox({
  options,
  value,
  onChange,
  disabled,
  error,
  placeholder
}) {
  const selected = options.filter((option) => value.some((current) => current === option.value));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      Combobox,
      {
        disabled,
        error,
        onChange: (selectedValue) => {
          if (value.some((current) => current === selectedValue)) return;
          onChange([...value, selectedValue]);
        },
        options,
        placeholder
      }
    ),
    selected.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-1", children: selected.map((item, index) => /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        className: cn(
          "inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700",
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-gray-300"
        ),
        disabled,
        onClick: () => onChange(value.filter((current) => current !== item.value)),
        type: "button",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: item.label }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": "true", children: "x" })
        ]
      },
      `${String(item.value)}-${index}`
    )) }) : null
  ] });
}
function variantClassName(variant) {
  switch (variant) {
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}
function Toast({
  id,
  title,
  description,
  variant = "info",
  onClose
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "w-full rounded-md border p-3 shadow-sm",
        "flex items-start justify-between gap-3",
        variantClassName(variant)
      ),
      role: "status",
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm font-semibold", children: title }),
          description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-xs opacity-90", children: description }) : null
        ] }),
        onClose ? /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            "aria-label": "Close notification",
            className: "rounded px-1 text-xs opacity-80 hover:opacity-100",
            onClick: () => onClose(id),
            type: "button",
            children: "x"
          }
        ) : null
      ]
    }
  );
}
function positionClassName(position) {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    default:
      return "top-4 right-4";
  }
}
function Toaster({
  toasts,
  onRemove,
  position = "top-right"
}) {
  react.useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.filter((toast) => (toast.durationMs ?? 4e3) > 0).map(
      (toast) => window.setTimeout(() => {
        onRemove(toast.id);
      }, toast.durationMs ?? 4e3)
    );
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [toasts, onRemove]);
  if (toasts.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "aria-live": "polite",
      className: `pointer-events-none fixed z-[1600] w-full max-w-sm space-y-2 ${positionClassName(position)}`,
      children: toasts.map((toast) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pointer-events-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
        Toast,
        {
          description: toast.description,
          id: toast.id,
          onClose: onRemove,
          title: toast.title,
          variant: toast.variant
        }
      ) }, toast.id))
    }
  );
}
function TableSkeleton({
  rows = 8,
  columns = 5,
  showToolbar = true,
  showPagination = true,
  showCheckbox = false,
  columnWidths,
  rowHeight = 53,
  dense = false,
  className
}) {
  const rowSkeleton = useSkeleton({ count: rows, keyPrefix: "tbl-row" });
  const colSkeleton = useSkeleton({ count: columns, keyPrefix: "tbl-col" });
  const totalColumns = showCheckbox ? columns + 1 : columns;
  const rowPadding = dense ? "py-2" : "py-3";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `space-y-2 ${className ?? ""}`, ...rowSkeleton.containerProps, children: [
    showToolbar ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex animate-pulse items-center justify-between gap-2 pb-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-10 w-72 rounded bg-gray-200" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-9 w-24 rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-9 w-24 rounded bg-gray-200" })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "overflow-hidden rounded-md border", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "animate-pulse border-b bg-gray-50 px-4 py-3", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-1/4 rounded bg-gray-200" }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "animate-pulse p-2", children: rowSkeleton.items.map((rowKey) => /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: `grid gap-2 border-b px-2 ${rowPadding} last:border-b-0`,
          style: {
            gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
            minHeight: rowHeight
          },
          children: [
            showCheckbox ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-4 rounded bg-gray-200" }) : null,
            colSkeleton.items.map((colKey, colIndex) => /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                className: "h-4 rounded bg-gray-200",
                style: {
                  width: colIndex === 0 ? columnWidths?.[colIndex] ?? "90%" : columnWidths?.[colIndex] ?? `${60 + colIndex * 13 % 30}%`
                }
              },
              `${rowKey}-${colKey}`
            ))
          ]
        },
        rowKey
      )) })
    ] }),
    showPagination ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex animate-pulse items-center justify-between px-1 pt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-28 rounded bg-gray-200" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-8 w-8 rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-16 rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-8 w-8 rounded bg-gray-200" })
      ] })
    ] }) : null
  ] });
}
function CardSkeleton({
  count = 3,
  variant = "standard",
  columns = 3,
  spacing = 3,
  showHeader = true,
  showActions = false,
  mediaHeight = 180,
  bodyLines = 3,
  className
}) {
  const skeleton = useSkeleton({ count, keyPrefix: "card" });
  const renderCard = (key) => {
    if (variant === "horizontal") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex overflow-hidden rounded-lg border", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-[120px] w-[160px] shrink-0 animate-pulse bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 space-y-2 p-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-5 w-2/3 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-full animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-1/2 animate-pulse rounded bg-gray-200" })
        ] })
      ] }, key);
    }
    if (variant === "compact") {
      return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border p-3", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-8 w-8 animate-pulse rounded-full bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-2/3 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-1/2 animate-pulse rounded bg-gray-200" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-6 w-14 animate-pulse rounded bg-gray-200" })
      ] }) }, key);
    }
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "overflow-hidden rounded-lg border", children: [
      variant === "media" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full animate-pulse bg-gray-200", style: { height: mediaHeight } }) : null,
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4", children: [
        showHeader ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-10 w-10 animate-pulse rounded-full bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-2/3 animate-pulse rounded bg-gray-200" }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-1/2 animate-pulse rounded bg-gray-200" })
          ] })
        ] }) : null,
        Array.from({ length: bodyLines }).map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "h-4 animate-pulse rounded bg-gray-200",
            style: { width: index === bodyLines - 1 ? "70%" : "100%" }
          },
          `${key}-${index}`
        )),
        showActions ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-8 w-20 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-8 w-20 animate-pulse rounded bg-gray-200" })
        ] }) : null
      ] })
    ] }, key);
  };
  if (variant === "compact" || variant === "horizontal") {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: className ?? "",
        ...skeleton.containerProps,
        style: { display: "flex", flexDirection: "column", gap: spacing * 4 },
        children: skeleton.items.map((key) => renderCard(key))
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: className ?? "",
      ...skeleton.containerProps,
      style: {
        display: "grid",
        gap: spacing * 4,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      },
      children: skeleton.items.map((key) => renderCard(key))
    }
  );
}
function FormSkeleton({
  fields = 4,
  columns = 1,
  showTitle = true,
  showActions = true,
  paper = true,
  showDividers = false,
  spacing = 2.5,
  className
}) {
  const fieldConfigs = typeof fields === "number" ? Array.from({ length: fields }, () => ({ type: "text" })) : fields;
  const skeleton = useSkeleton({
    count: fieldConfigs.length,
    keyPrefix: "form-field"
  });
  const renderField = (config, key) => {
    if (config.type === "textarea") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-24 animate-pulse rounded bg-gray-200" })
      ] }, key);
    }
    if (config.type === "switch") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 py-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-6 w-11 animate-pulse rounded-full bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-32 animate-pulse rounded bg-gray-200" })
      ] }, key);
    }
    if (config.type === "checkbox") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 py-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-4 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-36 animate-pulse rounded bg-gray-200" })
      ] }, key);
    }
    if (config.type === "radio") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-20 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-4 animate-pulse rounded-full bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-24 animate-pulse rounded bg-gray-200" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-4 animate-pulse rounded-full bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-28 animate-pulse rounded bg-gray-200" })
        ] })
      ] }, key);
    }
    if (config.type === "file") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 h-4 w-20 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-28 animate-pulse rounded bg-gray-200" })
      ] }, key);
    }
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 h-4 w-20 animate-pulse rounded bg-gray-200" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-12 animate-pulse rounded bg-gray-200" })
    ] }, key);
  };
  const content = /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: paper ? "rounded border p-4" : "",
      ...skeleton.containerProps,
      style: { display: "flex", flexDirection: "column", gap: spacing * 4 },
      children: [
        showTitle ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-7 w-52 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-72 animate-pulse rounded bg-gray-200" })
        ] }) : null,
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            style: {
              display: "grid",
              gap: spacing * 4,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
            },
            children: fieldConfigs.map((config, index) => {
              const key = skeleton.items[index] ?? `field-${index}`;
              const span = config.span ?? (config.type === "textarea" || config.type === "file" ? columns : 1);
              return /* @__PURE__ */ jsxRuntime.jsxs(
                "div",
                {
                  style: {
                    gridColumn: span > 1 ? `span ${Math.min(span, columns)}` : void 0
                  },
                  children: [
                    renderField(config, key),
                    showDividers && index < fieldConfigs.length - 1 && columns === 1 ? /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "mt-4 border-gray-200" }) : null
                  ]
                },
                key
              );
            })
          }
        ),
        showActions ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-10 w-24 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-10 w-32 animate-pulse rounded bg-gray-200" })
        ] }) : null
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: content });
}
function ListSkeleton({
  count = 5,
  showAvatar = true,
  avatarVariant = "circular",
  avatarSize = 40,
  showSecondaryText = true,
  showAction = false,
  showDividers = true,
  paper = true,
  secondaryLines = 1,
  dense = false,
  className
}) {
  const skeleton = useSkeleton({ count, keyPrefix: "list" });
  const avatarClassName = avatarVariant === "circular" ? "rounded-full" : avatarVariant === "rounded" ? "rounded-md" : "rounded-none";
  const list = /* @__PURE__ */ jsxRuntime.jsx("ul", { className: `divide-y ${showDividers ? "divide-gray-200" : "divide-transparent"}`, ...skeleton.containerProps, children: skeleton.items.map((key, index) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: `flex items-center gap-3 px-3 ${dense ? "py-2" : "py-3"}`, children: [
    showAvatar ? /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `shrink-0 animate-pulse bg-gray-200 ${avatarClassName}`,
        style: { height: avatarSize, width: avatarSize }
      }
    ) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 animate-pulse rounded bg-gray-200", style: { width: `${45 + index * 13 % 35}%` } }),
      showSecondaryText ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-1 space-y-1", children: Array.from({ length: secondaryLines }).map((_, secondaryIndex) => /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: "h-3 animate-pulse rounded bg-gray-200",
          style: { width: secondaryIndex === secondaryLines - 1 ? "40%" : "75%" }
        },
        `${key}-${secondaryIndex}`
      )) }) : null
    ] }),
    showAction ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-7 w-16 animate-pulse rounded bg-gray-200" }) : null
  ] }, key)) });
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: paper ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-hidden rounded border", children: list }) : list });
}
function DetailSkeleton({
  fields = 6,
  columns = 2,
  showHeader = true,
  showHeaderActions = true,
  showTabs = false,
  tabCount = 4,
  paper = true,
  className
}) {
  const fieldSkeleton = useSkeleton({ count: fields, keyPrefix: "detail-field" });
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className, ...fieldSkeleton.containerProps, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: paper ? "rounded border p-4" : "", children: [
    showHeader ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-14 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-2 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-20 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-2 animate-pulse rounded bg-gray-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-3 w-28 animate-pulse rounded bg-gray-200" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-12 w-12 animate-pulse rounded-full bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-6 w-56 animate-pulse rounded bg-gray-200" }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-40 animate-pulse rounded bg-gray-200" })
          ] })
        ] }),
        showHeaderActions ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-9 w-24 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-9 w-24 animate-pulse rounded bg-gray-200" })
        ] }) : null
      ] })
    ] }) : null,
    showTabs ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-4 flex items-center gap-4 border-b pb-2", children: Array.from({ length: tabCount }).map((_, index) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-5 animate-pulse rounded bg-gray-200", style: { width: 70 + index * 10 } }, index)) }) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        style: {
          display: "grid",
          gap: 16,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        },
        children: fieldSkeleton.items.map((key) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 h-3 w-24 animate-pulse rounded bg-gray-200" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-5 w-2/3 animate-pulse rounded bg-gray-200" })
        ] }, key))
      }
    )
  ] }) });
}

// src/utils/format.ts
function formatNumber(value, options, locale = "en-US") {
  return new Intl.NumberFormat(locale, options).format(value);
}
function formatCurrency(value, currency = "USD", locale = "en-US") {
  return formatNumber(value, { style: "currency", currency }, locale);
}
function formatDate(value, options, locale = "en-US") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, options).format(date);
}
function formatRelativeTime(value) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1e3);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date, { month: "short", day: "numeric" });
}

// src/utils/accessibility.ts
function getAriaProps(overrides = {}) {
  return Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== void 0)
  );
}
function getFocusTrapProps(containerId) {
  return {
    role: "dialog",
    "aria-modal": true,
    tabIndex: -1,
    id: containerId
  };
}
function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

exports.AlertDialog = AlertDialog;
exports.CardSkeleton = CardSkeleton;
exports.CheckboxField = CheckboxField;
exports.Combobox = Combobox;
exports.ComboboxField = ComboboxField;
exports.ConfirmDialog = ConfirmDialog;
exports.DataTable = DataTable;
exports.DataTableColumnHeader = DataTableColumnHeader;
exports.DataTablePagination = DataTablePagination;
exports.DataTableToolbar = DataTableToolbar;
exports.DateField = DateField;
exports.DetailSkeleton = DetailSkeleton;
exports.Dialog = Dialog;
exports.FileField = FileField;
exports.Form = Form;
exports.FormDialog = FormDialog;
exports.FormField = FormField;
exports.FormSkeleton = FormSkeleton;
exports.InfiniteVirtualList = InfiniteVirtualList;
exports.ListSkeleton = ListSkeleton;
exports.MultiCombobox = MultiCombobox;
exports.NumberField = NumberField;
exports.RadioGroupField = RadioGroupField;
exports.SelectField = SelectField;
exports.SwitchField = SwitchField;
exports.TableSkeleton = TableSkeleton;
exports.TextField = TextField;
exports.TextareaField = TextareaField;
exports.Toast = Toast;
exports.Toaster = Toaster;
exports.VirtualGrid = VirtualGrid;
exports.VirtualList = VirtualList;
exports.cn = cn;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatNumber = formatNumber;
exports.formatRelativeTime = formatRelativeTime;
exports.generateId = generateId;
exports.getAriaProps = getAriaProps;
exports.getFocusTrapProps = getFocusTrapProps;
exports.useClipboard = useClipboard;
exports.useCombobox = useCombobox;
exports.useDataTable = useDataTable;
exports.useDialog = useDialog;
exports.useFieldArray = useFieldArray;
exports.useFormContext = useFormContext2;
exports.useFormField = useFormField;
exports.useInfiniteVirtualList = useInfiniteVirtualList;
exports.useSkeleton = useSkeleton;
exports.useTableExport = useTableExport;
exports.useTableInlineEdit = useTableInlineEdit;
exports.useTablePagination = useTablePagination;
exports.useTableSelection = useTableSelection;
exports.useToast = useToast;
exports.useTypedForm = useTypedForm;
exports.useVirtualList = useVirtualList;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map