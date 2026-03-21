import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCombobox } from "../useCombobox";
import type { ComboboxOption } from "../types";

const fruitOptions: ComboboxOption<string>[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date", disabled: true }
];

describe("useCombobox", () => {
  it("starts closed with empty query", () => {
    const { result } = renderHook(() => useCombobox({ options: fruitOptions }));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe("");
  });

  it("filters options case-insensitively", () => {
    const { result } = renderHook(() => useCombobox({ options: fruitOptions }));
    act(() => result.current.setQuery("ban"));
    expect(result.current.filteredOptions).toHaveLength(1);
    expect(result.current.filteredOptions[0]?.value).toBe("banana");
  });

  it("uses custom filter when provided", () => {
    const filterFn = vi.fn((option: ComboboxOption<string>, query: string) =>
      option.value.startsWith(query.toLowerCase())
    );
    const { result } = renderHook(() => useCombobox({ options: fruitOptions, filterFn }));
    act(() => result.current.setQuery("ch"));
    expect(result.current.filteredOptions[0]?.value).toBe("cherry");
    expect(filterFn).toHaveBeenCalled();
  });

  it("selects option and closes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ options: fruitOptions, onChange }));

    act(() => {
      result.current.setIsOpen(true);
      result.current.selectOption(fruitOptions[1]!);
    });

    expect(onChange).toHaveBeenCalledWith("banana");
    expect(result.current.query).toBe("");
    expect(result.current.isOpen).toBe(false);
  });

  it("does not select disabled option", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ options: fruitOptions, onChange }));

    act(() => result.current.selectOption(fruitOptions[3]!));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation and enter select", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ options: fruitOptions, onChange }));

    const event = {
      key: "ArrowDown",
      preventDefault: vi.fn()
    } as Parameters<typeof result.current.inputProps.onKeyDown>[0];
    act(() => {
      result.current.inputProps.onKeyDown(event);
    });
    expect(result.current.isOpen).toBe(true);

    const enter = {
      key: "Enter",
      preventDefault: vi.fn()
    } as Parameters<typeof result.current.inputProps.onKeyDown>[0];
    act(() => {
      result.current.inputProps.onKeyDown(enter);
    });

    expect(onChange).toHaveBeenCalled();
  });
});
