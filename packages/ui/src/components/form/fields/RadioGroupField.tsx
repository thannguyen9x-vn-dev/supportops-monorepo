"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioGroupFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  options: RadioOption[];
  row?: boolean;
}

export function RadioGroupField<T extends FieldValues>({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  options,
  row = false
}: RadioGroupFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => (
        <div className={row ? "flex flex-wrap gap-4" : "space-y-2"}>
          {options.map((option) => (
            <label className="inline-flex items-center gap-2 text-sm text-gray-700" key={option.value}>
              <input
                aria-describedby={field["aria-describedby"]}
                aria-invalid={field["aria-invalid"]}
                checked={String(field.value ?? "") === option.value}
                disabled={disabled || field.isSubmitting || option.disabled}
                name={String(field.name)}
                onBlur={field.onBlur}
                onChange={() => field.onChange(option.value as never)}
                ref={field.ref as React.Ref<HTMLInputElement>}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </FormField>
  );
}
