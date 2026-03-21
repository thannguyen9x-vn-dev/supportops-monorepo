"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface CheckboxFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function CheckboxField<T extends FieldValues>({
  name,
  form,
  label,
  description,
  className,
  disabled
}: CheckboxFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name}>
      {(field) => (
        <label className="inline-flex items-center gap-2">
          <input
            aria-describedby={field["aria-describedby"]}
            aria-invalid={field["aria-invalid"]}
            checked={Boolean(field.value)}
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-blue-600",
              "focus:ring-2 focus:ring-blue-500"
            )}
            disabled={disabled || field.isSubmitting}
            id={field.id}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.checked as never)}
            ref={field.ref as React.Ref<HTMLInputElement>}
            type="checkbox"
          />
        </label>
      )}
    </FormField>
  );
}
