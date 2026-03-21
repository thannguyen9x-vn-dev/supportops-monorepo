import { ReactNode, ReactElement } from 'react';
import { FieldValues, FieldPath, FieldPathValue, Control, RegisterOptions } from 'react-hook-form';
import { AutocompleteProps } from '@mui/material/Autocomplete';
import { TextFieldProps } from '@mui/material/TextField';

type SelectOptionValue$1 = string | number;
interface SelectOption<TValue extends SelectOptionValue$1 = string> {
    label: string;
    value: TValue;
    disabled?: boolean;
}
type AutocompleteOption<TValue extends SelectOptionValue$1> = SelectOption<TValue>;
interface SelectOptionFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TValue extends SelectOptionValue$1 = Extract<FieldPathValue<TFieldValues, TName>, SelectOptionValue$1>> extends Omit<TextFieldProps, 'name' | 'error' | 'onChange' | 'select' | 'value'> {
    name: TName;
    control: Control<TFieldValues>;
    rules?: RegisterOptions<TFieldValues, TName>;
    label?: string;
    helperText?: ReactNode;
    hideEmptyHelperText?: boolean;
    options: ReadonlyArray<SelectOption<TValue>>;
    searchable?: boolean;
    searchInPopup?: boolean;
    searchPlaceholder?: string;
    noOptionsText?: ReactNode;
    disableClearable?: boolean;
    autocompleteProps?: Omit<AutocompleteProps<AutocompleteOption<TValue>, false, boolean, false>, 'options' | 'value' | 'onBlur' | 'onChange' | 'renderInput' | 'getOptionDisabled' | 'getOptionKey' | 'getOptionLabel' | 'id' | 'fullWidth'>;
}

declare const SelectOptionField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TValue extends string | number = Extract<FieldPathValue<TFieldValues, TName>, string | number>>(props: SelectOptionFieldProps<TFieldValues, TName, TValue>) => ReactElement;

type TextInputFieldStatus = 'default' | 'success' | 'error';
type TextInputFieldType = 'text' | 'email' | 'password';
interface TextInputFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> extends Omit<TextFieldProps, 'name' | 'error'> {
    name: TName;
    control: Control<TFieldValues>;
    rules?: RegisterOptions<TFieldValues, TName>;
    label?: string;
    placeholder?: string;
    helperText?: ReactNode;
    successMessage?: ReactNode;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    status?: TextInputFieldStatus;
    showSuccessState?: boolean;
    successIcon?: ReactNode;
    errorIcon?: ReactNode;
    hideEmptyHelperText?: boolean;
    inputType?: TextInputFieldType;
    showPasswordToggle?: boolean;
}

declare const TextInputField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(props: TextInputFieldProps<TFieldValues, TName>) => ReactElement;

interface TextAreaFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> extends Omit<TextInputFieldProps<TFieldValues, TName>, 'multiline' | 'rows' | 'type' | 'inputType'> {
    minRows?: number;
    maxRows?: number;
}

declare function TextAreaField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(props: TextAreaFieldProps<TFieldValues, TName>): ReactElement;

type SelectOptionValue = string | number;
interface PhoneCountryOption<TValue extends SelectOptionValue = string> extends SelectOption<TValue> {
    /** Country flag emoji, ex: 🇺🇸 */
    flag: string;
    /** Localized country name, ex: United States */
    countryName: string;
    /** Calling code without plus sign, ex: 1, 84 */
    dialingCode: string;
}
interface PhoneNumberFieldProps<TFieldValues extends FieldValues = FieldValues, TCountryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TPhoneName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TValue extends SelectOptionValue = Extract<FieldPathValue<TFieldValues, TCountryName>, SelectOptionValue>> {
    /** RHF control */
    control: Control<TFieldValues>;
    /** Field name for country selector */
    countryName: TCountryName;
    /** Field name for phone number input */
    phoneName: TPhoneName;
    /** Selector options */
    countryOptions: ReadonlyArray<PhoneCountryOption<TValue>>;
    label?: ReactNode;
    countryAriaLabel?: string;
    phoneAriaLabel?: string;
    phonePlaceholder?: string;
    searchPlaceholder?: string;
    noOptionsText?: ReactNode;
    countryRules?: RegisterOptions<TFieldValues, TCountryName>;
    phoneRules?: RegisterOptions<TFieldValues, TPhoneName>;
    /** Left selector width in px */
    countryWidthPx?: number;
    /** Popup width in px */
    popupWidthPx?: number;
}

declare const PhoneNumberField: <TFieldValues extends FieldValues = FieldValues, TCountryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TPhoneName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TValue extends string | number = Extract<FieldPathValue<TFieldValues, TCountryName>, string | number>>(props: PhoneNumberFieldProps<TFieldValues, TCountryName, TPhoneName, TValue>) => ReactElement;

interface SelectDateFieldTexts {
    monthLabel?: string;
    yearLabel?: string;
    todayLabel?: string;
    clearLabel?: string;
    keyboardHint?: string;
    selectMonthAriaLabel?: string;
    selectYearAriaLabel?: string;
    dayHeaders?: readonly [string, string, string, string, string, string, string];
}
interface SelectDateFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
    /** RHF control */
    control: Control<TFieldValues>;
    /** Field name — must resolve to string in TFieldValues */
    name: TName;
    /** RHF validation rules */
    rules?: RegisterOptions<TFieldValues, TName>;
    /** Label rendered above the input */
    label?: ReactNode;
    /** Placeholder text shown in the trigger input when no date is selected */
    placeholder?: string;
    /** Disable the input */
    disabled?: boolean;
    /** Hide the helper text region entirely when there is no message */
    hideEmptyHelperText?: boolean;
    /** Locale string for Intl.DateTimeFormat (month names). Defaults to browser locale */
    locale?: string;
    /** Customizable i18n text labels in popup */
    texts?: SelectDateFieldTexts;
    /** Aria-label for the trigger input */
    'aria-label'?: string;
}

declare const SelectDateField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(props: SelectDateFieldProps<TFieldValues, TName>) => ReactElement;

export { type PhoneCountryOption, PhoneNumberField, type PhoneNumberFieldProps, SelectDateField, type SelectDateFieldProps, type SelectOption, SelectOptionField, type SelectOptionFieldProps, TextAreaField, type TextAreaFieldProps, TextInputField, type TextInputFieldProps, type TextInputFieldStatus, type TextInputFieldType };
