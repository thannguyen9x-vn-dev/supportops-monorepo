import type {ReactNode} from 'react'
import type {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form'

import type {SelectOption} from './SelectOptionField.types'

type SelectOptionValue = string | number

export interface PhoneCountryOption<TValue extends SelectOptionValue = string>
  extends SelectOption<TValue> {
  /** Country flag emoji, ex: 🇺🇸 */
  flag: string
  /** Localized country name, ex: United States */
  countryName: string
  /** Calling code without plus sign, ex: 1, 84 */
  dialingCode: string
}

export interface PhoneNumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TCountryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TPhoneName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue extends SelectOptionValue = Extract<FieldPathValue<TFieldValues, TCountryName>, SelectOptionValue>,
> {
  /** RHF control */
  control: Control<TFieldValues>
  /** Field name for country selector */
  countryName: TCountryName
  /** Field name for phone number input */
  phoneName: TPhoneName
  /** Selector options */
  countryOptions: ReadonlyArray<PhoneCountryOption<TValue>>

  label?: ReactNode
  countryAriaLabel?: string
  phoneAriaLabel?: string
  phonePlaceholder?: string
  searchPlaceholder?: string
  noOptionsText?: ReactNode

  countryRules?: RegisterOptions<TFieldValues, TCountryName>
  phoneRules?: RegisterOptions<TFieldValues, TPhoneName>

  /** Left selector width in px */
  countryWidthPx?: number
  /** Popup width in px */
  popupWidthPx?: number
}
