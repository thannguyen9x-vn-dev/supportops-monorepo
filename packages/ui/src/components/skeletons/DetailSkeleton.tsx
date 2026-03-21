"use client";

import { useSkeleton } from "../../headless/use-skeleton";

interface DetailSkeletonProps {
  fields?: number;
  columns?: 1 | 2 | 3;
  showHeader?: boolean;
  showHeaderActions?: boolean;
  showTabs?: boolean;
  tabCount?: number;
  paper?: boolean;
  className?: string;
}

export function DetailSkeleton({
  fields = 6,
  columns = 2,
  showHeader = true,
  showHeaderActions = true,
  showTabs = false,
  tabCount = 4,
  paper = true,
  className
}: DetailSkeletonProps) {
  const fieldSkeleton = useSkeleton({ count: fields, keyPrefix: "detail-field" });

  return (
    <div className={className} {...fieldSkeleton.containerProps}>
      <div className={paper ? "rounded border p-4" : ""}>
        {showHeader ? (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-1">
              <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-2 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-2 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
                <div className="space-y-1">
                  <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              {showHeaderActions ? (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {showTabs ? (
          <div className="mb-4 flex items-center gap-4 border-b pb-2">
            {Array.from({ length: tabCount }).map((_, index) => (
              <div className="h-5 animate-pulse rounded bg-gray-200" key={index} style={{ width: 70 + index * 10 }} />
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {fieldSkeleton.items.map((key) => (
            <div key={key}>
              <div className="mb-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
