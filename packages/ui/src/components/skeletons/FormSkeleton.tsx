"use client";

import { useSkeleton } from "../../headless/use-skeleton";

export interface FormFieldConfig {
  type: "text" | "textarea" | "select" | "switch" | "checkbox" | "radio" | "file" | "date";
  span?: number;
}

interface FormSkeletonProps {
  fields?: FormFieldConfig[] | number;
  columns?: 1 | 2 | 3;
  showTitle?: boolean;
  showActions?: boolean;
  paper?: boolean;
  showDividers?: boolean;
  spacing?: number;
  className?: string;
}

export function FormSkeleton({
  fields = 4,
  columns = 1,
  showTitle = true,
  showActions = true,
  paper = true,
  showDividers = false,
  spacing = 2.5,
  className
}: FormSkeletonProps) {
  const fieldConfigs: FormFieldConfig[] =
    typeof fields === "number"
      ? Array.from({ length: fields }, () => ({ type: "text" as const }))
      : fields;

  const skeleton = useSkeleton({
    count: fieldConfigs.length,
    keyPrefix: "form-field"
  });

  const renderField = (config: FormFieldConfig, key: string) => {
    if (config.type === "textarea") {
      return (
        <div key={key}>
          <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-24 animate-pulse rounded bg-gray-200" />
        </div>
      );
    }

    if (config.type === "switch") {
      return (
        <div className="flex items-center gap-2 py-1" key={key}>
          <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      );
    }

    if (config.type === "checkbox") {
      return (
        <div className="flex items-center gap-2 py-1" key={key}>
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
        </div>
      );
    }

    if (config.type === "radio") {
      return (
        <div className="space-y-1" key={key}>
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      );
    }

    if (config.type === "file") {
      return (
        <div key={key}>
          <div className="mb-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-28 animate-pulse rounded bg-gray-200" />
        </div>
      );
    }

    return (
      <div key={key}>
        <div className="mb-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-12 animate-pulse rounded bg-gray-200" />
      </div>
    );
  };

  const content = (
    <div
      className={paper ? "rounded border p-4" : ""}
      {...skeleton.containerProps}
      style={{ display: "flex", flexDirection: "column", gap: spacing * 4 }}
    >
      {showTitle ? (
        <div className="space-y-2">
          <div className="h-7 w-52 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: spacing * 4,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}
      >
        {fieldConfigs.map((config, index) => {
          const key = skeleton.items[index] ?? `field-${index}`;
          const span = config.span ?? (config.type === "textarea" || config.type === "file" ? columns : 1);

          return (
            <div
              key={key}
              style={{
                gridColumn: span > 1 ? `span ${Math.min(span, columns)}` : undefined
              }}
            >
              {renderField(config, key)}
              {showDividers && index < fieldConfigs.length - 1 && columns === 1 ? <hr className="mt-4 border-gray-200" /> : null}
            </div>
          );
        })}
      </div>

      {showActions ? (
        <div className="flex items-center justify-end gap-2">
          <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={className}>
      {content}
    </div>
  );
}
