import type { BaseSyntheticEvent, Ref } from "react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn
} from "react-hook-form";

export interface UseTypedFormOptions<
  T extends FieldValues
> {
  schema: {
    safeParse: (data: unknown) =>
      | { success: true; data: T }
      | {
          success: false;
          error: {
            issues: Array<{
              path: Array<string | number>;
              code: string;
              message: string;
            }>;
          };
        };
  };
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: FieldErrors<T>) => void;
}

export interface HeadlessFieldProps<
  T extends FieldValues = FieldValues,
  TName extends Path<T> = Path<T>
> {
  name: TName;
  value: PathValue<T, TName>;
  error?: string;
  isValidating: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  onChange: (value: PathValue<T, TName>) => void;
  onBlur: () => void;
  ref: Ref<HTMLElement>;
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

export interface FieldConfig {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

export interface UseTypedFormResult<T extends FieldValues> {
  form: UseFormReturn<T>;
  handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: FieldErrors<T>;
  reset: UseFormReturn<T>["reset"];
}
