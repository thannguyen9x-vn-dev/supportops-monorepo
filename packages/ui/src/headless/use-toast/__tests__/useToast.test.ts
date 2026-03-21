import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useToast } from "../useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it("adds a toast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ message: "Hello" });
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]?.message).toBe("Hello");
    expect(result.current.toasts[0]?.severity).toBe("info");
  });

  it("assigns unique ids", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ message: "A" });
      result.current.toast({ message: "B" });
    });
    const ids = result.current.toasts.map((item) => item.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("supports convenience methods", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success("Done");
      result.current.error("Failed");
      result.current.warning("Watch");
      result.current.info("Info");
    });
    expect(result.current.toasts.map((item) => item.severity)).toEqual([
      "success",
      "error",
      "warning",
      "info"
    ]);
  });

  it("dismisses specific toast by id", () => {
    const { result } = renderHook(() => useToast());
    let firstId = "";
    act(() => {
      firstId = result.current.toast({ message: "First" });
      result.current.toast({ message: "Second" });
    });
    act(() => {
      result.current.dismiss(firstId);
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]?.message).toBe("Second");
  });

  it("dismisses all toasts", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ message: "A" });
      result.current.toast({ message: "B" });
    });
    expect(result.current.toasts).toHaveLength(2);
    act(() => {
      result.current.dismissAll();
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("auto-dismisses by duration", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ message: "Temp", duration: 3000 });
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("does not auto-dismiss when duration=0", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ message: "Persistent", duration: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.toasts).toHaveLength(1);
  });

  it("respects maxToasts", () => {
    const { result } = renderHook(() => useToast({ maxToasts: 3 }));
    act(() => {
      result.current.toast({ message: "A", duration: 0 });
      result.current.toast({ message: "B", duration: 0 });
      result.current.toast({ message: "C", duration: 0 });
      result.current.toast({ message: "D", duration: 0 });
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts.map((item) => item.message)).toEqual(["B", "C", "D"]);
  });
});
