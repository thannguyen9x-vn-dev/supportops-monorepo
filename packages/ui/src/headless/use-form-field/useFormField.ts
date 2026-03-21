import { useId, useMemo } from "react";
import {
  useController,
  useForm,
  useFormContext as useReactHookFormContext,
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn
} from "react-hook-form";

import type { HeadlessFieldProps, UseTypedFormOptions, UseTypedFormResult } from "./types";

export function useTypedForm<
  T extends FieldValues
>(options: UseTypedFormOptions<T>): UseTypedFormResult<T> {
  const { schema, defaultValues, onSubmit, onError } = options;

  const form = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
    mode: "onBlur",
    reValidateMode: "onChange"
  });

  const handleSubmit = form.handleSubmit(
    async (data) => {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const fieldPath = issue.path.join(".") as Path<T>;
          if (fieldPath) {
            form.setError(fieldPath, { type: issue.code, message: issue.message });
          }
        });
        return;
      }

      try {
        await onSubmit(parsed.data as T);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "fieldErrors" in error &&
          error.fieldErrors &&
          typeof error.fieldErrors === "object"
        ) {
          Object.entries(error.fieldErrors as Record<string, string>).forEach(([field, message]) => {
            form.setError(field as Path<T>, { type: "server", message });
          });
        }
        throw error;
      }
    },
    onError
  );

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    reset: form.reset
  };
}

export function useFormField<
  T extends FieldValues = FieldValues,
  TName extends Path<T> = Path<T>
>(
  name: TName,
  form?: UseFormReturn<T>
): HeadlessFieldProps<T, TName> {
  const id = useId();
  const resolvedForm = (form ?? useReactHookFormContext<T>()) as UseFormReturn<T>;

  const {
    field,
    fieldState: { error, isTouched, isDirty },
    formState: { isSubmitting, isValidating }
  } = useController({
    name,
    control: resolvedForm.control
  });

  const errorId = `${id}-error`;

  return useMemo(
    () => ({
      name: field.name as TName,
      value: field.value as HeadlessFieldProps<T, TName>["value"],
      error: error?.message,
      isValidating,
      isTouched,
      isDirty,
      isSubmitting,
      onChange: field.onChange,
      onBlur: field.onBlur,
      ref: field.ref,
      id,
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? errorId : undefined
    }),
    [field, error, isValidating, isTouched, isDirty, isSubmitting, id, errorId]
  );
}
