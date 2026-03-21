import { useCallback, useEffect, useRef, useState } from "react";

import type { UseClipboardOptions, UseClipboardReturn } from "./types";

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { resetDelay = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
    setError(null);
  }, [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer();
      setError(null);

      try {
        if (!navigator?.clipboard?.writeText) {
          throw new Error("Clipboard API is not available");
        }

        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (resetDelay > 0) {
          timerRef.current = setTimeout(() => {
            setCopied(false);
          }, resetDelay);
        }

        return true;
      } catch (unknownError) {
        const normalizedError = unknownError instanceof Error ? unknownError : new Error("Failed to copy");
        setError(normalizedError);
        setCopied(false);
        return false;
      }
    },
    [clearTimer, resetDelay]
  );

  const read = useCallback(async (): Promise<string | null> => {
    try {
      if (!navigator?.clipboard?.readText) {
        throw new Error("Clipboard API is not available");
      }
      return await navigator.clipboard.readText();
    } catch (unknownError) {
      const normalizedError = unknownError instanceof Error ? unknownError : new Error("Failed to read clipboard");
      setError(normalizedError);
      return null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    copied,
    error,
    copy,
    read,
    reset
  };
}
