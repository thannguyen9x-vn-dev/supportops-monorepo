"use client";

import { useEffect } from "react";

import { Toast, type ToastProps } from "./Toast";

export interface ToasterItem extends Omit<ToastProps, "onClose"> {
  durationMs?: number;
}

interface ToasterProps {
  toasts: ToasterItem[];
  onRemove: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

function positionClassName(position: NonNullable<ToasterProps["position"]>): string {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    default:
      return "top-4 right-4";
  }
}

export function Toaster({
  toasts,
  onRemove,
  position = "top-right"
}: ToasterProps) {
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts
      .filter((toast) => (toast.durationMs ?? 4000) > 0)
      .map((toast) =>
        window.setTimeout(() => {
          onRemove(toast.id);
        }, toast.durationMs ?? 4000)
      );

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [toasts, onRemove]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed z-[1600] w-full max-w-sm space-y-2 ${positionClassName(position)}`}
    >
      {toasts.map((toast) => (
        <div className="pointer-events-auto" key={toast.id}>
          <Toast
            description={toast.description}
            id={toast.id}
            onClose={onRemove}
            title={toast.title}
            variant={toast.variant}
          />
        </div>
      ))}
    </div>
  );
}
