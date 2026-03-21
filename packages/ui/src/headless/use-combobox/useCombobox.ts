import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import type { ComboboxOption, UseComboboxOptions } from "./types";

export function useCombobox<TValue = string>(options: UseComboboxOptions<TValue>) {
  const {
    options: allOptions,
    value,
    onChange,
    filterFn,
    allowCustomValue = false
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = useMemo(() => {
    if (!query) return allOptions;

    const defaultFilter = (opt: ComboboxOption<TValue>, q: string) =>
      opt.label.toLowerCase().includes(q.toLowerCase());

    return allOptions.filter((opt) => (filterFn ?? defaultFilter)(opt, query));
  }, [allOptions, query, filterFn]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, ComboboxOption<TValue>[]>();

    filteredOptions.forEach((option) => {
      const group = option.group ?? "";
      const current = groups.get(group) ?? [];
      groups.set(group, [...current, option]);
    });

    return groups;
  }, [filteredOptions]);

  const selectedOption = useMemo(
    () => allOptions.find((option) => option.value === value),
    [allOptions, value]
  );

  const selectOption = useCallback(
    (option: ComboboxOption<TValue>) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setIsOpen(true);
          setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
          break;
        case "Enter": {
          event.preventDefault();
          const highlightedOption = filteredOptions[highlightedIndex];

          if (highlightedOption) {
            selectOption(highlightedOption);
          } else if (allowCustomValue && query && onChange) {
            onChange(query as TValue);
            setIsOpen(false);
          }
          break;
        }
        case "Escape":
          setIsOpen(false);
          setQuery("");
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [allowCustomValue, filteredOptions, highlightedIndex, onChange, query, selectOption]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        !inputRef.current?.contains(event.target as Node) &&
        !listRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  return {
    isOpen,
    query,
    highlightedIndex,
    filteredOptions,
    groupedOptions,
    selectedOption,
    setQuery,
    setIsOpen,
    selectOption,
    inputProps: {
      ref: inputRef,
      value: isOpen ? query : selectedOption?.label ?? "",
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        setIsOpen(true);
        setHighlightedIndex(-1);
      },
      onFocus: () => setIsOpen(true),
      onKeyDown: handleKeyDown,
      role: "combobox" as const,
      "aria-expanded": isOpen,
      "aria-autocomplete": "list" as const,
      "aria-controls": "combobox-listbox"
    },
    listProps: {
      ref: listRef,
      id: "combobox-listbox",
      role: "listbox" as const
    },
    getOptionProps: (option: ComboboxOption<TValue>, index: number) => ({
      role: "option" as const,
      "aria-selected": option.value === value,
      "aria-disabled": option.disabled,
      "data-highlighted": index === highlightedIndex,
      onClick: () => selectOption(option),
      onMouseEnter: () => setHighlightedIndex(index)
    })
  };
}
