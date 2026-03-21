"use client";

import type { ComboboxOption } from "../../headless/use-combobox";
import { cn } from "../../utils/cn";
import { Combobox } from "./Combobox";

interface MultiComboboxProps<TValue = string> {
  options: ComboboxOption<TValue>[];
  value: TValue[];
  onChange: (values: TValue[]) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function MultiCombobox<TValue = string>({
  options,
  value,
  onChange,
  disabled,
  error,
  placeholder
}: MultiComboboxProps<TValue>) {
  const selected = options.filter((option) => value.some((current) => current === option.value));

  return (
    <div className="space-y-2">
      <Combobox
        disabled={disabled}
        error={error}
        onChange={(selectedValue) => {
          if (value.some((current) => current === selectedValue)) return;
          onChange([...value, selectedValue]);
        }}
        options={options}
        placeholder={placeholder}
      />

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selected.map((item, index) => (
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700",
                disabled ? "cursor-not-allowed opacity-60" : "hover:border-gray-300"
              )}
              disabled={disabled}
              key={`${String(item.value)}-${index}`}
              onClick={() => onChange(value.filter((current) => current !== item.value))}
              type="button"
            >
              <span>{item.label}</span>
              <span aria-hidden="true">x</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
