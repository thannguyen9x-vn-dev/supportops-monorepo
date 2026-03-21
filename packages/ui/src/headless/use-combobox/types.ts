export interface ComboboxOption<TValue = string> {
  label: string;
  value: TValue;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface UseComboboxOptions<TValue = string> {
  options: ComboboxOption<TValue>[];
  value?: TValue;
  onChange?: (value: TValue) => void;
  filterFn?: (option: ComboboxOption<TValue>, query: string) => boolean;
  allowCustomValue?: boolean;
}
