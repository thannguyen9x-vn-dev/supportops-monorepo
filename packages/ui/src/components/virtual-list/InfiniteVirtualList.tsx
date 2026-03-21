"use client";

import type { ReactNode } from "react";

import { useInfiniteVirtualList, type UseInfiniteVirtualListOptions } from "../../headless/use-virtual-list";

interface InfiniteVirtualListProps<T> extends UseInfiniteVirtualListOptions<T> {
  height: number | string;
  width?: number | string;
  className?: string;
  emptyState?: ReactNode;
  loadingMoreText?: string;
  renderItem: (item: T, index: number) => ReactNode;
}

export function InfiniteVirtualList<T>({
  height,
  width = "100%",
  className,
  emptyState,
  loadingMoreText = "Loading more...",
  renderItem,
  ...options
}: InfiniteVirtualListProps<T>) {
  const { scrollRef, virtualItems, totalSize, isLoadingMore } = useInfiniteVirtualList(options);

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
      {isLoadingMore ? <div className="py-2 text-center text-sm text-gray-500">{loadingMoreText}</div> : null}
    </div>
  );
}
