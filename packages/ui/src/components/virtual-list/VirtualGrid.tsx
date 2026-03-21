"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";

import { useVirtualList } from "../../headless/use-virtual-list";

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

export function VirtualGrid<T>({
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
}: VirtualGridProps<T>) {
  const rows = useMemo(() => {
    const chunked: T[][] = [];
    for (let index = 0; index < items.length; index += columns) {
      chunked.push(items.slice(index, index + columns));
    }
    return chunked;
  }, [items, columns]);

  const { scrollRef, virtualItems, totalSize } = useVirtualList<T[]>({
    items: rows,
    estimateSize: rowHeight + gap,
    gap,
    overscan,
    getItemKey
  });

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      ref={scrollRef}
      style={{
        height,
        width,
        overflow: "auto",
        position: "relative"
      }}
    >
      <div
        style={{
          height: totalSize,
          position: "relative",
          width: "100%"
        }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              display: "grid",
              gap,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              left: 0,
              position: "absolute",
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: "100%"
            }}
          >
            {virtualRow.data.map((item, colIndex) => {
              const itemIndex = virtualRow.index * columns + colIndex;
              return <div key={itemIndex}>{renderItem(item, itemIndex)}</div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
