"use client";

import type { ReactNode } from "react";

import { useVirtualList, type UseVirtualListOptions } from "../../headless/use-virtual-list";

interface VirtualListProps<T> extends UseVirtualListOptions<T> {
  height: number | string;
  width?: number | string;
  className?: string;
  loading?: boolean;
  loadingSkeleton?: ReactNode;
  emptyState?: ReactNode;
  renderItem: (item: T, index: number) => ReactNode;
}

export function VirtualList<T>({
  height,
  width = "100%",
  className,
  loading,
  loadingSkeleton,
  emptyState,
  renderItem,
  ...options
}: VirtualListProps<T>) {
  const { scrollRef, virtualItems, totalSize } = useVirtualList(options);

  if (loading && loadingSkeleton) {
    return <>{loadingSkeleton}</>;
  }

  if (options.items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={className}
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
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              height: virtualItem.size,
              left: 0,
              position: "absolute",
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: "100%"
            }}
          >
            {renderItem(virtualItem.data, virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
