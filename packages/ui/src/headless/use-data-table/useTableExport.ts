import { useCallback } from "react";
import type { Table } from "@tanstack/react-table";

interface ExportOptions {
  fileName?: string;
  separator?: "," | ";" | "\t";
  includeHeaders?: boolean;
}

export function useTableExport<T>(table: Table<T>) {
  const exportCsv = useCallback(
    (options: ExportOptions = {}) => {
      const {
        fileName = "table-export.csv",
        separator = ",",
        includeHeaders = true
      } = options;

      const rows = table.getRowModel().rows;
      const columns = table.getVisibleLeafColumns();

      const header = includeHeaders
        ? `${columns.map((col) => JSON.stringify(String(col.id))).join(separator)}\n`
        : "";

      const body = rows
        .map((row) =>
          columns
            .map((column) => {
              const value = row.getValue(column.id);
              return JSON.stringify(value ?? "");
            })
            .join(separator)
        )
        .join("\n");

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
