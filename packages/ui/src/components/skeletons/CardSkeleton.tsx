"use client";

import { useSkeleton } from "../../headless/use-skeleton";

interface CardSkeletonProps {
  count?: number;
  variant?: "standard" | "media" | "horizontal" | "compact";
  columns?: number;
  spacing?: number;
  showHeader?: boolean;
  showActions?: boolean;
  mediaHeight?: number;
  bodyLines?: number;
  className?: string;
}

export function CardSkeleton({
  count = 3,
  variant = "standard",
  columns = 3,
  spacing = 3,
  showHeader = true,
  showActions = false,
  mediaHeight = 180,
  bodyLines = 3,
  className
}: CardSkeletonProps) {
  const skeleton = useSkeleton({ count, keyPrefix: "card" });

  const renderCard = (key: string) => {
    if (variant === "horizontal") {
      return (
        <div className="flex overflow-hidden rounded-lg border" key={key}>
          <div className="h-[120px] w-[160px] shrink-0 animate-pulse bg-gray-200" />
          <div className="flex-1 space-y-2 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      );
    }

    if (variant === "compact") {
      return (
        <div className="rounded-lg border p-3" key={key}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-6 w-14 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border" key={key}>
        {variant === "media" ? <div className="w-full animate-pulse bg-gray-200" style={{ height: mediaHeight }} /> : null}

        <div className="space-y-2 p-4">
          {showHeader ? (
            <div className="mb-2 flex items-center gap-2">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : null}

          {Array.from({ length: bodyLines }).map((_, index) => (
            <div
              className="h-4 animate-pulse rounded bg-gray-200"
              key={`${key}-${index}`}
              style={{ width: index === bodyLines - 1 ? "70%" : "100%" }}
            />
          ))}

          {showActions ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (variant === "compact" || variant === "horizontal") {
    return (
      <div
        className={className ?? ""}
        {...skeleton.containerProps}
        style={{ display: "flex", flexDirection: "column", gap: spacing * 4 }}
      >
        {skeleton.items.map((key) => renderCard(key))}
      </div>
    );
  }

  return (
    <div
      className={className ?? ""}
      {...skeleton.containerProps}
      style={{
        display: "grid",
        gap: spacing * 4,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {skeleton.items.map((key) => renderCard(key))}
    </div>
  );
}
