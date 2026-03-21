"use client";

import type { KeyboardEvent } from "react";

import { useCombobox, type ComboboxOption, type UseComboboxOptions } from "../../headless/use-combobox";
import { cn } from "../../utils/cn";

interface ComboboxProps<TValue = string> extends UseComboboxOptions<TValue> {
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  inputId?: string;
  onBlur?: () => void;
}

export function Combobox<TValue = string>({
  options,
  value,
  onChange,
  filterFn,
  allowCustomValue,
  disabled,
  error,
  placeholder,
  inputId,
  onBlur
}: ComboboxProps<TValue>) {
  const combobox = useCombobox<TValue>({
    options,
    value,
    onChange,
    filterFn,
    allowCustomValue
  });

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    combobox.inputProps.onKeyDown(event);
    if (event.key === "Tab") {
      onBlur?.();
    }
  };

  return (
    <div className="relative">
      <input
        {...combobox.inputProps}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled ? "cursor-not-allowed bg-gray-50 text-gray-500" : "",
          error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
        )}
        disabled={disabled}
        id={inputId}
        onBlur={() => onBlur?.()}
        onChange={combobox.inputProps.onChange}
        onFocus={combobox.inputProps.onFocus}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
      />

      {combobox.isOpen && combobox.filteredOptions.length > 0 ? (
        <ul
          {...combobox.listProps}
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {combobox.filteredOptions.map((option, index) => {
            const optionProps = combobox.getOptionProps(option, index);
            return (
              <li
                {...optionProps}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm",
                  option.disabled ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-100",
                  combobox.highlightedIndex === index ? "bg-blue-50 text-blue-700" : ""
                )}
                key={`${String(option.value)}-${index}`}
              >
                <div>{option.label}</div>
                {option.description ? <div className="text-xs text-gray-500">{option.description}</div> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export type { ComboboxOption };
