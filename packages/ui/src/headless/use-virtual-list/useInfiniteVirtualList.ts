import { useEffect, useRef } from "react";

import { useVirtualList } from "./useVirtualList";
import type { UseInfiniteVirtualListOptions } from "./types";

export function useInfiniteVirtualList<T>(options: UseInfiniteVirtualListOptions<T>) {
  const {
    isLoadingMore,
    hasMore,
    onLoadMore,
    loadMoreThreshold = 5,
    ...virtualOptions
  } = options;

  const virtualState = useVirtualList(virtualOptions);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const lastVirtualItem = virtualState.virtualItems[virtualState.virtualItems.length - 1];
    if (!lastVirtualItem) return;

    const isNearEnd = lastVirtualItem.index >= virtualOptions.items.length - loadMoreThreshold;

    if (isNearEnd && hasMore && !isLoadingMore) {
      onLoadMoreRef.current();
    }
  }, [virtualState.virtualItems, virtualOptions.items.length, hasMore, isLoadingMore, loadMoreThreshold]);

  return {
    ...virtualState,
    isLoadingMore
  };
}
