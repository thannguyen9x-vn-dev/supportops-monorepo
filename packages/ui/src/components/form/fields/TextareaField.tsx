"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface TextareaFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  showCount?: boolean;
}

export function TextareaField<T extends FieldValues>({
  name,
  form,
  label,
  placeholder,
  description,
  required,
  className,
  disabled,
  rows = 4,
  minLength,
  maxLength,
  showCount = false
}: TextareaFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => {
        const value = String(field.value ?? "");
        const countText = showCount && maxLength ? `${value.length}/${maxLength}` : null;

        return (
          <div className="space-y-1">
            <textarea
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
              maxLength={maxLength}
              minLength={minLength}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value as never)}
              placeholder={placeholder}
              ref={field.ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              value={value}
            />
            {countText ? <p className="text-right text-xs text-gray-500">{countText}</p> : null}
          </div>
        );
      }}
    </FormField>
  );
}
