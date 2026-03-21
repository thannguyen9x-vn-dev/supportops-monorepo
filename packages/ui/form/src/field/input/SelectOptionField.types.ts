import type {AutocompleteProps} from '@mui/material/Autocomplete'
import type {TextFieldProps} from '@mui/material/TextField'
import type {ReactNode} from 'react'
import type {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form'

type SelectOptionValue = string | number

export interface SelectOption<TValue extends SelectOptionValue = string> {
  label: string
  value: TValue
  disabled?: boolean
}

type AutocompleteOption<TValue extends SelectOptionValue> = SelectOption<TValue>

export interface SelectOptionFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue extends SelectOptionValue = Extract<FieldPathValue<TFieldValues, TName>, SelectOptionValue>,
> extends Omit<TextFieldProps, 'name' | 'error' | 'onChange' | 'select' | 'value'> {
  name: TName

  control: Control<TFieldValues>

  rules?: RegisterOptions<TFieldValues, TName>

  label?: string

  helperText?: ReactNode

  hideEmptyHelperText?: boolean

  options: ReadonlyArray<SelectOption<TValue>>

  searchable?: boolean

  searchInPopup?: boolean

  searchPlaceholder?: string

  noOptionsText?: ReactNode

  disableClearable?: boolean

  autocompleteProps?: Omit<
    AutocompleteProps<AutocompleteOption<TValue>, false, boolean, false>,
    | 'options'
    | 'value'
    | 'onBlur'
    | 'onChange'
    | 'renderInput'
    | 'getOptionDisabled'
    | 'getOptionKey'
    | 'getOptionLabel'
    | 'id'
    | 'fullWidth'
  >
}
