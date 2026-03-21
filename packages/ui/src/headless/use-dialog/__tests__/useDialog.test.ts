import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDialog } from "../useDialog";

describe("useDialog", () => {
  it("is closed by default", () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.isOpen).toBe(false);
  });

  it("supports defaultOpen", () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it("opens, closes and toggles", () => {
    const { result } = renderHook(() => useDialog());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("calls onOpenChange when state changes", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDialog({ onOpenChange }));

    act(() => result.current.open());
    act(() => result.current.close());

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it("calls onClose when closed", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog({ defaultOpen: true, onClose }));
    act(() => result.current.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports controlled mode", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) => useDialog({ open, onOpenChange }),
      { initialProps: { open: false } }
    );

    expect(result.current.isOpen).toBe(false);
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender({ open: true });
    expect(result.current.isOpen).toBe(true);
  });

  it("blocks escape close when disableEscapeKeyClose", () => {
    const { result } = renderHook(() =>
      useDialog({ defaultOpen: true, disableEscapeKeyClose: true })
    );

    act(() => result.current.dialogProps.onClose({}, "escapeKeyDown"));
    expect(result.current.isOpen).toBe(true);
  });

  it("blocks backdrop close when disableBackdropClose", () => {
    const { result } = renderHook(() =>
      useDialog({ defaultOpen: true, disableBackdropClose: true })
    );

    act(() => result.current.dialogProps.onClose({}, "backdropClick"));
    expect(result.current.isOpen).toBe(true);
  });

  it("triggerProps opens dialog", () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.triggerProps["aria-expanded"]).toBe(true);
  });

  it("keeps function references stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useDialog());

    const openRef = result.current.open;
    const closeRef = result.current.close;
    const toggleRef = result.current.toggle;

    rerender();
    expect(result.current.open).toBe(openRef);
    expect(result.current.close).toBe(closeRef);
    expect(result.current.toggle).toBe(toggleRef);
  });
});
