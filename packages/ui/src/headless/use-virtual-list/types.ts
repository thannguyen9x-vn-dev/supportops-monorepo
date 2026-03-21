import type { RefObject } from "react";

export interface UseVirtualListOptions<T> {
  items: T[];
  estimateSize: number | ((index: number) => number);
  overscan?: number;
  horizontal?: boolean;
  getItemKey?: (index: number) => string | number;
  gap?: number;
}

export interface VirtualItem<T> {
  index: number;
  data: T;
  start: number;
  size: number;
  key: string | number;
}

export interface UseVirtualListReturn<T> {
  scrollRef: RefObject<HTMLDivElement | null>;
  virtualItems: VirtualItem<T>[];
  totalSize: number;
  scrollToIndex: (index: number, options?: { align?: "start" | "center" | "end" }) => void;
  scrollOffset: number;
  isScrolling: boolean;
}

export interface UseInfiniteVirtualListOptions<T> extends UseVirtualListOptions<T> {
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadMoreThreshold?: number;
}
