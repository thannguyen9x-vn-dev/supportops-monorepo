import { useCallback, useEffect, useRef, useState } from "react";

import type { ToastInput, ToastItem, ToastSeverity, UseToastOptions, UseToastReturn } from "./types";

function nextId(counter: number): string {
  return `toast-${counter}-${Date.now()}`;
}

export function useToast(options: UseToastOptions = {}): UseToastReturn {
  const { maxToasts = 5, defaultDuration = 4000 } = options;
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const counterRef = useRef(0);

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimer]
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (input: ToastInput): string => {
      counterRef.current += 1;
      const id = nextId(counterRef.current);
      const severity: ToastSeverity = input.severity ?? "info";
      const duration = input.duration ?? defaultDuration;

      const item: ToastItem = {
        id,
        title: input.title,
        message: input.message,
        severity,
        duration,
        createdAt: Date.now()
      };

      setToasts((prev) => {
        const next = [...prev, item];
        if (next.length <= maxToasts) return next;

        const overflow = next.length - maxToasts;
        const removed = next.slice(0, overflow);
        removed.forEach((toastItem) => clearTimer(toastItem.id));
        return next.slice(overflow);
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [clearTimer, defaultDuration, dismiss, maxToasts]
  );

  const createHelper = useCallback(
    (severity: ToastSeverity) =>
      (message: string, title?: string, duration?: number): string =>
        toast({ message, title, duration, severity }),
    [toast]
  );

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  return {
    toasts,
    toast,
    success: createHelper("success"),
    error: createHelper("error"),
    warning: createHelper("warning"),
    info: createHelper("info"),
    dismiss,
    dismissAll
  };
}
