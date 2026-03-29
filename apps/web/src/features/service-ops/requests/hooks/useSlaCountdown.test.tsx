import { act, renderHook } from "@testing-library/react";

import { useSlaCountdown } from "./useSlaCountdown";

describe("useSlaCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-29T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calculates remaining minutes", () => {
    const targetAt = "2026-03-29T10:45:00.000Z";

    const { result } = renderHook(() => useSlaCountdown(targetAt, 0, false));

    expect(result.current).toBe(45);

    act(() => {
      jest.setSystemTime(new Date("2026-03-29T10:15:00.000Z"));
      jest.advanceTimersByTime(30_000);
    });

    expect(result.current).toBeGreaterThanOrEqual(29);
    expect(result.current).toBeLessThanOrEqual(30);
  });

  it("does not count down while paused", () => {
    const targetAt = "2026-03-29T10:30:00.000Z";

    const { result } = renderHook(() => useSlaCountdown(targetAt, 0, true));

    expect(result.current).toBe(0);

    act(() => {
      jest.setSystemTime(new Date("2026-03-29T10:20:00.000Z"));
      jest.advanceTimersByTime(30_000);
    });

    expect(result.current).toBe(0);
  });
});
