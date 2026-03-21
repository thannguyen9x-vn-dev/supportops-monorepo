import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useClipboard } from "../useClipboard";

describe("useClipboard", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue("clipboard content")
      },
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with copied=false and error=null", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("copies text and sets copied=true", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const ok = await result.current.copy("Hello World");
      expect(ok).toBe(true);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hello World");
    expect(result.current.copied).toBe(true);
  });

  it("resets copied after resetDelay", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useClipboard({ resetDelay: 1000 }));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
    vi.useRealTimers();
  });

  it("sets error when clipboard write fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        readText: vi.fn()
      },
      configurable: true
    });

    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const ok = await result.current.copy("x");
      expect(ok).toBe(false);
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error?.message).toContain("Permission denied");
  });

  it("can reset state manually", async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy("x");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
