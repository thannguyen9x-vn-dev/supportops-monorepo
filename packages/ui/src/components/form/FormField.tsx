"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";

import { useFormField as useHeadlessField, type HeadlessFieldProps } from "../../headless/use-form-field";
import { cn } from "../../utils/cn";

interface FormFieldProps<T extends FieldValues, TName extends Path<T>> {
  name: TName;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (field: HeadlessFieldProps<T, TName>) => ReactNode;
}

export function FormField<T extends FieldValues, TName extends Path<T>>({
  name,
  form,
  label,
  description,
  required,
  className,
  children
}: FormFieldProps<T, TName>) {
  const field = useHeadlessField<T, TName>(name, form);

  return (
    <div className={cn("space-y-2", className)}>
      <label
        className={cn("text-sm font-medium leading-none", field.error ? "text-red-600" : "")}
        htmlFor={field.id}
      >
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      {description ? <p className="text-xs text-gray-500">{description}</p> : null}

      {children(field)}

      {field.error ? (
        <p className="text-sm text-red-600" id={`${field.id}-error`} role="alert">
          {field.error}
        </p>
      ) : null}
    </div>
  );
}
