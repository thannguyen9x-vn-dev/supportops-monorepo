"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PageMeta, Product } from "@supportops/types";
import {
  Box,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import { useTranslations } from "next-intl";
import { DataTable, useDataTable } from "@supportops/ui";

import { productColumns } from "./columns";

interface ProductDataTableProps {
  data: Product[];
  meta: PageMeta;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onSaveRow: (rowId: string, changes: Partial<Product>) => Promise<void>;
  onSaveAll?: (changesByRow: Record<string, Partial<Product>>) => Promise<{ failedRowIds?: string[] } | void>;
  onBulkDelete?: (ids: string[]) => void;
}

export function ProductDataTable({
  data,
  meta,
  isLoading = false,
  onPageChange,
  onEdit,
  onSaveRow,
  onSaveAll,
  onBulkDelete
}: ProductDataTableProps) {
  const t = useTranslations("pages.projects.table");

  const [editingCells, setEditingCells] = useState<Record<string, boolean>>({});
  const [pendingEdits, setPendingEdits] = useState<Record<string, Partial<Product>>>({});
  const [savingRowIds, setSavingRowIds] = useState<Record<string, boolean>>({});
  const lastPageIndexRef = useRef(Math.max(0, meta.page - 1));

  const startEditing = useCallback((rowId: string, columnId: string) => {
    setEditingCells((prev) => ({ ...prev, [`${rowId}:${columnId}`]: true }));
  }, []);

  const cancelEditing = useCallback((rowId: string, columnId: string) => {
    setEditingCells((prev) => {
      const next = { ...prev };
      delete next[`${rowId}:${columnId}`];
      return next;
    });

    setPendingEdits((prev) => {
      const current = prev[rowId];
      if (!current) {
        return prev;
      }

      const next = { ...prev };
      const nextRow = { ...current };
      delete nextRow[columnId as keyof Product];

      if (Object.keys(nextRow).length === 0) {
        delete next[rowId];
      } else {
        next[rowId] = nextRow;
      }

      return next;
    });
  }, []);

  const updateCellValue = useCallback((rowId: string, columnId: string, value: unknown) => {
    setPendingEdits((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [columnId]: value
      }
    }));
  }, []);

  const discardRow = useCallback((rowId: string) => {
    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });

    setEditingCells((prev) => {
      const next: Record<string, boolean> = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith(`${rowId}:`)) {
          next[key] = value;
        }
      });
      return next;
    });
  }, []);

  const persistRow = useCallback(
    async (rowId: string): Promise<boolean> => {
      const changes = pendingEdits[rowId];
      if (!changes || Object.keys(changes).length === 0) {
        return true;
      }

      setSavingRowIds((prev) => ({ ...prev, [rowId]: true }));
      try {
        await onSaveRow(rowId, changes);
        discardRow(rowId);
        return true;
      } catch {
        return false;
      } finally {
        setSavingRowIds((prev) => {
          const next = { ...prev };
          delete next[rowId];
          return next;
        });
      }
    },
    [discardRow, onSaveRow, pendingEdits]
  );

  const persistAll = useCallback(async () => {
    if (Object.keys(pendingEdits).length === 0) {
      return;
    }

    if (onSaveAll) {
      const result = await onSaveAll(pendingEdits);
      const failedRowIds = new Set(result?.failedRowIds ?? []);
      Object.keys(pendingEdits)
        .filter((rowId) => !failedRowIds.has(rowId))
        .forEach((rowId) => discardRow(rowId));
      return;
    }

    const rowIds = Object.keys(pendingEdits);
    for (const rowId of rowIds) {
      await persistRow(rowId);
    }
  }, [discardRow, onSaveAll, pendingEdits, persistRow]);

  const columns = useMemo(
    () =>
      productColumns({
        t,
        editingCells,
        pendingEdits,
        savingRowIds,
        onStartEdit: startEditing,
        onCancelEdit: cancelEditing,
        onDiscardRow: discardRow,
        onUpdateCell: updateCellValue,
        onSaveRow: (rowId) => {
          void persistRow(rowId);
        },
        onEditRow: onEdit
      }),
    [t, editingCells, pendingEdits, savingRowIds, startEditing, cancelEditing, discardRow, updateCellValue, persistRow, onEdit]
  );

  useEffect(() => {
    lastPageIndexRef.current = Math.max(0, meta.page - 1);
  }, [meta.page]);

  const { table, selectedRowIds } = useDataTable({
    data,
    columns,
    totalRows: meta.total,
    rowId: (row) => row.id,
    serverSide: true,
    pageIndex: Math.max(0, meta.page - 1),
    pageSize: meta.size,
    enableSelection: true,
    onStateChange: (state) => {
      if (state.pagination.pageIndex !== lastPageIndexRef.current) {
        lastPageIndexRef.current = state.pagination.pageIndex;
        onPageChange(state.pagination.pageIndex + 1);
      }
    }
  });

  const selectedIds = selectedRowIds;

  return (
    <Stack spacing={2}>
      <DataTable
        dirtyRowCount={Object.keys(pendingEdits).length}
        dirtyRowIds={new Set(Object.keys(pendingEdits))}
        emptyState={t("state.empty")}
        highlightDirtyRows
        isLoading={isLoading}
        onBulkDelete={onBulkDelete ? () => onBulkDelete(selectedIds) : undefined}
        onDiscardAll={() => {
          setPendingEdits({});
          setEditingCells({});
        }}
        onSaveAll={() => {
          void persistAll();
        }}
        selectedCount={selectedIds.length}
        table={table}
        totalRows={meta.total}
      />

      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Typography color="text.secondary" variant="body2">
          {`${(meta.page - 1) * meta.size + 1} - ${Math.min(meta.page * meta.size, meta.total)} / ${meta.total}`}
        </Typography>
      </Box>

      {isLoading ? (
        <Box alignItems="center" display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      ) : null}
    </Stack>
  );
}
