"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import type { ComboboxOption } from "../../../headless/use-combobox";
import { Combobox } from "../../combobox/Combobox";
import { FormField } from "../FormField";

interface ComboboxFieldProps<T extends FieldValues, TValue = string> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  options: ComboboxOption<TValue>[];
  placeholder?: string;
  allowCustomValue?: boolean;
  filterFn?: (option: ComboboxOption<TValue>, query: string) => boolean;
}

export function ComboboxField<T extends FieldValues, TValue = string>({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  options,
  placeholder,
  allowCustomValue,
  filterFn
}: ComboboxFieldProps<T, TValue>) {
  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => (
        <Combobox
          allowCustomValue={allowCustomValue}
          disabled={disabled || field.isSubmitting}
          error={field.error}
          filterFn={filterFn}
          inputId={field.id}
          onBlur={field.onBlur}
          onChange={(value) => field.onChange(value as never)}
          options={options}
          placeholder={placeholder}
          value={field.value as TValue | undefined}
        />
      )}
    </FormField>
  );
}
