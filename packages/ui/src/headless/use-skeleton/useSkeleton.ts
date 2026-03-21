import { useMemo } from "react";

import type { SkeletonRepeatOptions, UseSkeletonReturn } from "./types";

export function useSkeleton(options: SkeletonRepeatOptions): UseSkeletonReturn {
  const { count, keyPrefix = "skeleton" } = options;

  const items = useMemo(
    () => Array.from({ length: count }, (_, index) => `${keyPrefix}-${index}`),
    [count, keyPrefix]
  );

  return {
    items,
    containerProps: {
      "aria-busy": true,
      "aria-label": "Loading content",
      role: "status"
    }
  };
}
