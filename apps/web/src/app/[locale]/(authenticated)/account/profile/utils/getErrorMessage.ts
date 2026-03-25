"use client";

import { ApiError } from "@/lib/api/apiClient";

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    const details = Array.isArray(error.error.details)
      ? error.error.details.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

    if (details.length > 0) {
      return `${error.message} (${details.join(", ")})`;
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
