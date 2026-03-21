"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";

interface SwitchFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function SwitchField<T extends FieldValues>({
  name,
  form,
  label,
  description,
  className,
  disabled
}: SwitchFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name}>
      {(field) => (
        <button
          aria-describedby={field["aria-describedby"]}
          aria-invalid={field["aria-invalid"]}
          aria-pressed={Boolean(field.value)}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            disabled || field.isSubmitting ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            field.value ? "bg-blue-600" : "bg-gray-300"
          ].join(" ")}
          disabled={disabled || field.isSubmitting}
          id={field.id}
          onBlur={field.onBlur}
          onClick={() => field.onChange((!field.value) as never)}
          type="button"
        >
          <span
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
              field.value ? "translate-x-5" : "translate-x-1"
            ].join(" ")}
          />
          <span className="sr-only">{label}</span>
        </button>
      )}
    </FormField>
  );
}
