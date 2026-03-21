"use client";

import type { Column } from "@tanstack/react-table";

import { cn } from "../../utils/cn";

interface DataTableColumnHeaderProps<T, TValue> {
  column: Column<T, TValue>;
  title: string;
}

export function DataTableColumnHeader<T, TValue>({ column, title }: DataTableColumnHeaderProps<T, TValue>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      className={cn(
        "-ml-2 flex items-center gap-1 rounded px-2 py-1 transition-colors hover:text-gray-900",
        sorted ? "font-semibold text-gray-900" : ""
      )}
      onClick={column.getToggleSortingHandler()}
      type="button"
    >
      {title}
      <span className="text-xs">{sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}</span>
    </button>
  );
}
