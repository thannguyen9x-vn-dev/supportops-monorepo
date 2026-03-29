"use client";

import { useEffect, useMemo, useState } from "react";

export function useSlaCountdown(
  targetAt: string | undefined,
  totalPausedSeconds: number,
  isPaused: boolean,
) {
  const [now, setNow] = useState(() => Date.now());

  const targetTimestamp = useMemo(() => {
    if (!targetAt) {
      return null;
    }

    const parsed = new Date(targetAt).getTime();
    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed + totalPausedSeconds * 1000;
  }, [targetAt, totalPausedSeconds]);

  useEffect(() => {
    if (!targetTimestamp || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, targetTimestamp]);

  return useMemo(() => {
    if (!targetTimestamp || isPaused) {
      return 0;
    }
    const remainingMinutes = (targetTimestamp - now) / 60_000;
    return Math.max(0, Math.floor(remainingMinutes));
  }, [isPaused, now, targetTimestamp]);
}
