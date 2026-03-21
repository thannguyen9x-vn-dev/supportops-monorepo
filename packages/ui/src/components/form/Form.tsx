"use client";

import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";

interface FormProps<T extends FieldValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export function Form<T extends FieldValues>({ form, onSubmit, children, ...props }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
