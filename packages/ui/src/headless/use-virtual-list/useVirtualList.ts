import { useCallback, useMemo, useRef, useState, useEffect } from "react";

import type { UseVirtualListOptions, UseVirtualListReturn, VirtualItem } from "./types";

function resolveItemSize(estimateSize: number | ((index: number) => number), index: number): number {
  return typeof estimateSize === "function" ? estimateSize(index) : estimateSize;
}

export function useVirtualList<T>(options: UseVirtualListOptions<T>): UseVirtualListReturn<T> {
  const { items, estimateSize, overscan = 5 } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    setViewportSize(element.clientHeight);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      setScrollOffset(element.scrollTop);
      setIsScrolling(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolling(false), 120);
    };

    const handleResize = () => {
      setViewportSize(element.clientHeight);
    };

    element.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const starts = useMemo(() => {
    const offsets: number[] = [];
    let current = 0;

    items.forEach((_, index) => {
      offsets.push(current);
      current += resolveItemSize(estimateSize, index);
    });

    return offsets;
  }, [items, estimateSize]);

  const totalSize = useMemo(() => {
    if (items.length === 0) return 0;
    const lastIndex = items.length - 1;
    const lastStart = starts[lastIndex] ?? 0;
    return lastStart + resolveItemSize(estimateSize, lastIndex);
  }, [estimateSize, items.length, starts]);

  const startIndex = useMemo(() => {
    const estimated = resolveItemSize(estimateSize, 0) || 1;
    return Math.max(0, Math.floor(scrollOffset / estimated) - overscan);
  }, [estimateSize, overscan, scrollOffset]);

  const endIndex = useMemo(() => {
    const estimated = resolveItemSize(estimateSize, 0) || 1;
    const visibleCount = Math.ceil(viewportSize / estimated);
    return Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
  }, [estimateSize, items.length, overscan, startIndex, viewportSize]);

  const virtualItems: VirtualItem<T>[] = useMemo(() => {
    if (items.length === 0) return [];

    const result: VirtualItem<T>[] = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
      const item = items[index];
      if (item === undefined) continue;
      result.push({
        index,
        data: item,
        start: starts[index] ?? 0,
        size: resolveItemSize(estimateSize, index),
        key: options.getItemKey ? options.getItemKey(index) : index
      });
    }

    return result;
  }, [endIndex, estimateSize, items, options, startIndex, starts]);

  const scrollToIndex = useCallback(
    (index: number, scrollOptions?: { align?: "start" | "center" | "end" }) => {
      const element = scrollRef.current;
      if (!element) return;

      const start = starts[index] ?? 0;
      const size = resolveItemSize(estimateSize, index);
      const align = scrollOptions?.align ?? "start";

      if (align === "center") {
        element.scrollTop = Math.max(0, start - element.clientHeight / 2 + size / 2);
      } else if (align === "end") {
        element.scrollTop = Math.max(0, start - element.clientHeight + size);
      } else {
        element.scrollTop = start;
      }
    },
    [estimateSize, starts]
  );

  return {
    scrollRef,
    virtualItems,
    totalSize,
    scrollToIndex,
    scrollOffset,
    isScrolling
  };
}
