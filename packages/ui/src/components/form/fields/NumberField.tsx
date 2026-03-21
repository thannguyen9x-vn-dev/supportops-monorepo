"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface NumberFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  disabled?: boolean;
}

export function NumberField<T extends FieldValues>({
  name,
  form,
  label,
  placeholder,
  description,
  required,
  min,
  max,
  step,
  prefix,
  suffix,
  className,
  disabled
}: NumberFieldProps<T>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => (
        <div className="relative">
          {prefix ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{prefix}</span> : null}
          <input
            aria-describedby={field["aria-describedby"]}
            aria-invalid={field["aria-invalid"]}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
              field.error ? "border-red-300 focus:ring-red-500" : "border-gray-300",
              prefix ? "pl-8" : "",
              suffix ? "pr-12" : ""
            )}
            disabled={disabled || field.isSubmitting}
            id={field.id}
            max={max}
            min={min}
            onBlur={field.onBlur}
            onChange={(event) => {
              const rawValue = event.target.value;
              field.onChange((rawValue === "" ? undefined : Number(rawValue)) as never);
            }}
            placeholder={placeholder}
            ref={field.ref as React.Ref<HTMLInputElement>}
            step={step}
            type="number"
            value={field.value === undefined || field.value === null ? "" : String(field.value)}
          />
          {suffix ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span> : null}
        </div>
      )}
    </FormField>
  );
}
