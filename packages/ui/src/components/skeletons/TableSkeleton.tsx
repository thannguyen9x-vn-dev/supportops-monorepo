"use client";

import { useSkeleton } from "../../headless/use-skeleton";

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

export function TableSkeleton({
  rows = 8,
  columns = 5,
  showToolbar = true,
  showPagination = true,
  showCheckbox = false,
  columnWidths,
  rowHeight = 53,
  dense = false,
  className
}: TableSkeletonProps) {
  const rowSkeleton = useSkeleton({ count: rows, keyPrefix: "tbl-row" });
  const colSkeleton = useSkeleton({ count: columns, keyPrefix: "tbl-col" });
  const totalColumns = showCheckbox ? columns + 1 : columns;
  const rowPadding = dense ? "py-2" : "py-3";

  return (
    <div className={`space-y-2 ${className ?? ""}`} {...rowSkeleton.containerProps}>
      {showToolbar ? (
        <div className="flex animate-pulse items-center justify-between gap-2 pb-1">
          <div className="h-10 w-72 rounded bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded bg-gray-200" />
            <div className="h-9 w-24 rounded bg-gray-200" />
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border">
        <div className="animate-pulse border-b bg-gray-50 px-4 py-3">
          <div className="h-4 w-1/4 rounded bg-gray-200" />
        </div>

        <div className="animate-pulse p-2">
          {rowSkeleton.items.map((rowKey) => (
            <div
              className={`grid gap-2 border-b px-2 ${rowPadding} last:border-b-0`}
              key={rowKey}
              style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
                minHeight: rowHeight
              }}
            >
              {showCheckbox ? <div className="h-4 w-4 rounded bg-gray-200" /> : null}
              {colSkeleton.items.map((colKey, colIndex) => (
                <div
                  className="h-4 rounded bg-gray-200"
                  key={`${rowKey}-${colKey}`}
                  style={{
                    width:
                      colIndex === 0
                        ? columnWidths?.[colIndex] ?? "90%"
                        : columnWidths?.[colIndex] ?? `${60 + ((colIndex * 13) % 30)}%`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {showPagination ? (
        <div className="flex animate-pulse items-center justify-between px-1 pt-1">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-8 w-8 rounded bg-gray-200" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
