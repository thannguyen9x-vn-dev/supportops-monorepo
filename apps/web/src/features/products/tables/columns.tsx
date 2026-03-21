"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { Product } from "@supportops/types";
import { Typography } from "@mui/material";

import { ActionsCell } from "./cells/ActionsCell";
import { CheckboxCell, CheckboxHeader } from "./cells/CheckboxCell";
import { EditableNumberCell } from "./cells/EditableNumberCell";
import { EditableSelectCell } from "./cells/EditableSelectCell";
import { EditableTextCell } from "./cells/EditableTextCell";

const columnHelper = createColumnHelper<Product>();

type Translate = (key: string, values?: Record<string, string | number>) => string;

interface ColumnOptions {
  t: Translate;
  editingCells: Record<string, boolean>;
  pendingEdits: Record<string, Partial<Product>>;
  savingRowIds: Record<string, boolean>;
  onStartEdit: (rowId: string, columnId: string) => void;
  onCancelEdit: (rowId: string, columnId: string) => void;
  onDiscardRow: (rowId: string) => void;
  onUpdateCell: (rowId: string, columnId: string, value: unknown) => void;
  onSaveRow: (rowId: string) => void;
  onEditRow: (product: Product) => void;
}

export function productColumns({
  t,
  editingCells,
  pendingEdits,
  savingRowIds,
  onStartEdit,
  onCancelEdit,
  onDiscardRow,
  onUpdateCell,
  onSaveRow,
  onEditRow
}: ColumnOptions) {
  return [
    columnHelper.display({
      id: "select",
      size: 48,
      header: ({ table }) => <CheckboxHeader table={table} />,
      cell: ({ row }) => <CheckboxCell row={row} />
    }),
    columnHelper.accessor("name", {
      header: t("columns.name"),
      size: 260,
      cell: ({ row, column }) => {
        const cellKey = `${row.id}:${column.id}`;
        const pendingValue = pendingEdits[row.id]?.name;

        return (
          <EditableTextCell
            isEditing={!!editingCells[cellKey]}
            onCancel={() => onCancelEdit(row.id, column.id)}
            onChange={(value) => onUpdateCell(row.id, column.id, value)}
            onStartEdit={() => onStartEdit(row.id, column.id)}
            subtitle={row.original.subtitle}
            value={pendingValue ?? row.original.name}
          />
        );
      }
    }),
    columnHelper.accessor("category", {
      header: t("columns.category"),
      size: 150,
      cell: ({ row, column }) => {
        const cellKey = `${row.id}:${column.id}`;
        const pendingValue = pendingEdits[row.id]?.category;

        return (
          <EditableSelectCell
            isEditing={!!editingCells[cellKey]}
            onCancel={() => onCancelEdit(row.id, column.id)}
            onChange={(value) => onUpdateCell(row.id, column.id, value)}
            onStartEdit={() => onStartEdit(row.id, column.id)}
            options={[
              { label: "Software", value: "Software" },
              { label: "Analytics", value: "Analytics" },
              { label: "Services", value: "Services" }
            ]}
            value={String(pendingValue ?? row.original.category)}
          />
        );
      }
    }),
    columnHelper.accessor("price", {
      header: t("columns.price"),
      size: 140,
      cell: ({ row, column }) => {
        const cellKey = `${row.id}:${column.id}`;
        const pendingValue = pendingEdits[row.id]?.price;

        return (
          <EditableNumberCell
            isEditing={!!editingCells[cellKey]}
            onCancel={() => onCancelEdit(row.id, column.id)}
            onChange={(value) => onUpdateCell(row.id, column.id, value)}
            onStartEdit={() => onStartEdit(row.id, column.id)}
            value={Number(pendingValue ?? row.original.price)}
          />
        );
      }
    }),
    columnHelper.accessor("brand", {
      header: t("columns.brand"),
      size: 160,
      cell: ({ row, column }) => {
        const cellKey = `${row.id}:${column.id}`;
        const pendingValue = pendingEdits[row.id]?.brand;

        return (
          <EditableTextCell
            isEditing={!!editingCells[cellKey]}
            onCancel={() => onCancelEdit(row.id, column.id)}
            onChange={(value) => onUpdateCell(row.id, column.id, value)}
            onStartEdit={() => onStartEdit(row.id, column.id)}
            value={String(pendingValue ?? row.original.brand)}
          />
        );
      }
    }),
    columnHelper.accessor("id", {
      header: t("columns.id"),
      size: 120,
      cell: ({ getValue }) => (
        <Typography color="text.secondary" sx={{ fontFamily: "monospace" }} variant="caption">
          {`${getValue().slice(0, 8)}...`}
        </Typography>
      )
    }),
    columnHelper.display({
      id: "actions",
      size: 160,
      header: "",
      cell: ({ row }) => (
        <ActionsCell
          hasChanges={Boolean(pendingEdits[row.id])}
          isSaving={Boolean(savingRowIds[row.id])}
          onDiscard={() => onDiscardRow(row.id)}
          onEdit={() => onEditRow(row.original)}
          onSave={() => onSaveRow(row.id)}
        />
      )
    })
  ];
}
