"use client";

import { useSkeleton } from "../../headless/use-skeleton";

interface ListSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  avatarVariant?: "circular" | "rounded" | "square";
  avatarSize?: number;
  showSecondaryText?: boolean;
  showAction?: boolean;
  showDividers?: boolean;
  paper?: boolean;
  secondaryLines?: number;
  dense?: boolean;
  className?: string;
}

export function ListSkeleton({
  count = 5,
  showAvatar = true,
  avatarVariant = "circular",
  avatarSize = 40,
  showSecondaryText = true,
  showAction = false,
  showDividers = true,
  paper = true,
  secondaryLines = 1,
  dense = false,
  className
}: ListSkeletonProps) {
  const skeleton = useSkeleton({ count, keyPrefix: "list" });

  const avatarClassName =
    avatarVariant === "circular"
      ? "rounded-full"
      : avatarVariant === "rounded"
      ? "rounded-md"
      : "rounded-none";

  const list = (
    <ul className={`divide-y ${showDividers ? "divide-gray-200" : "divide-transparent"}`} {...skeleton.containerProps}>
      {skeleton.items.map((key, index) => (
        <li className={`flex items-center gap-3 px-3 ${dense ? "py-2" : "py-3"}`} key={key}>
          {showAvatar ? (
            <div
              className={`shrink-0 animate-pulse bg-gray-200 ${avatarClassName}`}
              style={{ height: avatarSize, width: avatarSize }}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="h-4 animate-pulse rounded bg-gray-200" style={{ width: `${45 + ((index * 13) % 35)}%` }} />
            {showSecondaryText ? (
              <div className="mt-1 space-y-1">
                {Array.from({ length: secondaryLines }).map((_, secondaryIndex) => (
                  <div
                    className="h-3 animate-pulse rounded bg-gray-200"
                    key={`${key}-${secondaryIndex}`}
                    style={{ width: secondaryIndex === secondaryLines - 1 ? "40%" : "75%" }}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {showAction ? <div className="h-7 w-16 animate-pulse rounded bg-gray-200" /> : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={className}>
      {paper ? <div className="overflow-hidden rounded border">{list}</div> : list}
    </div>
  );
}
