"use client";

import { cn } from "../../utils/cn";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: (id: string) => void;
}

function variantClassName(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}

export function Toast({
  id,
  title,
  description,
  variant = "info",
  onClose
}: ToastProps) {
  return (
    <div
      className={cn(
        "w-full rounded-md border p-3 shadow-sm",
        "flex items-start justify-between gap-3",
        variantClassName(variant)
      )}
      role="status"
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 text-xs opacity-90">{description}</p> : null}
      </div>
      {onClose ? (
        <button
          aria-label="Close notification"
          className="rounded px-1 text-xs opacity-80 hover:opacity-100"
          onClick={() => onClose(id)}
          type="button"
        >
          x
        </button>
      ) : null}
    </div>
  );
}
