import {
  useFieldArray as useReactHookFormFieldArray,
  useFormContext,
  type FieldArrayPath,
  type FieldValues,
  type UseFieldArrayProps
} from "react-hook-form";

export function useFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>(props: Omit<UseFieldArrayProps<TFieldValues, TFieldArrayName>, "control">) {
  const { control } = useFormContext<TFieldValues>();
  return useReactHookFormFieldArray({ ...props, control });
}
