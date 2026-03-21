"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface DateFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "date" | "datetime-local" | "time";
  min?: string;
  max?: string;
}

export function DateField<T extends FieldValues>({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  type = "date",
  min,
  max
}: DateFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => (
        <input
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
          max={max}
          min={min}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(event.target.value as never)}
          ref={field.ref as React.Ref<HTMLInputElement>}
          type={type}
          value={String(field.value ?? "")}
        />
      )}
    </FormField>
  );
}
