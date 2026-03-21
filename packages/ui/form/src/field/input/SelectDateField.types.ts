import type {ReactNode} from 'react'
import type {Control, FieldPath, FieldValues, RegisterOptions} from 'react-hook-form'

export interface SelectDateFieldTexts {
  monthLabel?: string
  yearLabel?: string
  todayLabel?: string
  clearLabel?: string
  keyboardHint?: string
  selectMonthAriaLabel?: string
  selectYearAriaLabel?: string
  dayHeaders?: readonly [string, string, string, string, string, string, string]
}

export interface SelectDateFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** RHF control */
  control: Control<TFieldValues>
  /** Field name — must resolve to string in TFieldValues */
  name: TName
  /** RHF validation rules */
  rules?: RegisterOptions<TFieldValues, TName>
  /** Label rendered above the input */
  label?: ReactNode
  /** Placeholder text shown in the trigger input when no date is selected */
  placeholder?: string
  /** Disable the input */
  disabled?: boolean
  /** Hide the helper text region entirely when there is no message */
  hideEmptyHelperText?: boolean
  /** Locale string for Intl.DateTimeFormat (month names). Defaults to browser locale */
  locale?: string
  /** Customizable i18n text labels in popup */
  texts?: SelectDateFieldTexts
  /** Aria-label for the trigger input */
  'aria-label'?: string
}
