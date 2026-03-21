import type {FieldPath, FieldValues} from 'react-hook-form'
import type {TextInputFieldProps} from './TextInputField.types'

export interface TextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<TextInputFieldProps<TFieldValues, TName>, 'multiline' | 'rows' | 'type' | 'inputType'> {
  minRows?: number
  maxRows?: number
}
