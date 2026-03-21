"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  name,
  form,
  label,
  options,
  placeholder,
  description,
  required,
  className,
  disabled
}: SelectFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => (
        <select
          aria-describedby={field["aria-describedby"]}
          aria-invalid={field["aria-invalid"]}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          )}
          disabled={disabled || field.isSubmitting}
          id={field.id}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(event.target.value as never)}
          ref={field.ref as React.Ref<HTMLSelectElement>}
          value={String(field.value ?? "")}
        >
          {placeholder ? (
            <option disabled value="">
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
