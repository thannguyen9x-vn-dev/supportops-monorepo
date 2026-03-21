export type ToastSeverity = "info" | "success" | "warning" | "error";

export interface ToastInput {
  title?: string;
  message: string;
  severity?: ToastSeverity;
  duration?: number;
}

export interface ToastItem extends ToastInput {
  id: string;
  severity: ToastSeverity;
  createdAt: number;
}

export interface UseToastOptions {
  maxToasts?: number;
  defaultDuration?: number;
}

export interface UseToastReturn {
  toasts: ToastItem[];
  toast: (input: ToastInput) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
