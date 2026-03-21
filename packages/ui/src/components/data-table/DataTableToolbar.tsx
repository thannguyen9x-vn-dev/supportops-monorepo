"use client";

import type { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<T> {
  table: Table<T>;
  selectedCount?: number;
  dirtyRowCount?: number;
  onBulkDelete?: () => void;
  onSaveAll?: () => void;
  onDiscardAll?: () => void;
  onExport?: () => void;
}

export function DataTableToolbar<T>({
  selectedCount = 0,
  dirtyRowCount = 0,
  onBulkDelete,
  onSaveAll,
  onDiscardAll,
  onExport
}: DataTableToolbarProps<T>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {selectedCount > 0 ? <span>{selectedCount} selected</span> : null}
        {dirtyRowCount > 0 ? <span>{dirtyRowCount} unsaved</span> : null}
      </div>

      <div className="flex items-center gap-2">
        {onExport ? (
          <button className="rounded border px-3 py-1 text-sm" onClick={onExport} type="button">
            Export
          </button>
        ) : null}

        {onBulkDelete ? (
          <button className="rounded border px-3 py-1 text-sm text-red-600" onClick={onBulkDelete} type="button">
            Delete selected
          </button>
        ) : null}

        {onDiscardAll ? (
          <button className="rounded border px-3 py-1 text-sm" onClick={onDiscardAll} type="button">
            Discard all
          </button>
        ) : null}

        {onSaveAll ? (
          <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={onSaveAll} type="button">
            Save all
          </button>
        ) : null}
      </div>
    </div>
  );
}
