"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface TextFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "url" | "tel";
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function TextField<T extends FieldValues>({
  name,
  form,
  label,
  placeholder,
  description,
  required,
  type = "text",
  autoComplete,
  className,
  inputClassName,
  disabled
}: TextFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => (
        <input
          aria-describedby={field["aria-describedby"]}
          aria-invalid={field["aria-invalid"]}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300",
            inputClassName
          )}
          disabled={disabled || field.isSubmitting}
          id={field.id}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(event.target.value as never)}
          placeholder={placeholder}
          ref={field.ref as React.Ref<HTMLInputElement>}
          type={type}
          value={String(field.value ?? "")}
        />
      )}
    </FormField>
  );
}
