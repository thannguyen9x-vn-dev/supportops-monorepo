'use client'

import type {ReactElement} from 'react'
import {useMemo} from 'react'
import {useFormState, useWatch} from 'react-hook-form'
import type {FieldPath, FieldPathValue, FieldValues} from 'react-hook-form'

import Box from '@mui/material/Box'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'

import {SelectOptionField} from './SelectOptionField'
import {TextInputField} from './TextInputField'
import type {PhoneCountryOption, PhoneNumberFieldProps} from './PhoneNumberField.types'

const textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
}

function PhoneNumberFieldInner<
  TFieldValues extends FieldValues = FieldValues,
  TCountryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TPhoneName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue extends string | number = Extract<FieldPathValue<TFieldValues, TCountryName>, string | number>,
>(
  props: PhoneNumberFieldProps<TFieldValues, TCountryName, TPhoneName, TValue>,
): ReactElement {
  const {
    control,
    countryName,
    phoneName,
    countryOptions,
    label,
    countryAriaLabel,
    phoneAriaLabel,
    phonePlaceholder,
    searchPlaceholder,
    noOptionsText,
    countryRules,
    phoneRules,
    countryWidthPx = 128,
    popupWidthPx = 340,
  } = props

  const {errors} = useFormState({
    control,
    name: [countryName, phoneName],
  })

  const selectedCountry = useWatch({control, name: countryName})
  const selectedCountryOption = useMemo(
    () => countryOptions.find(option => option.value === selectedCountry) ?? null,
    [countryOptions, selectedCountry],
  )

  return (
    <Box sx={{width: '100%'}}>
      {label ? (
        <FormLabel
          sx={{
            ...textSmStyle,
            display: 'block',
            color: 'grey.800',
            mb: 0.75,
          }}
        >
          {label}
        </FormLabel>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `${countryWidthPx}px minmax(0, 1fr)`,
          gap: 0,
          border: '1px solid',
          borderColor: 'var(--mui-palette-grey-300)',
          borderRadius: 1,
          bgcolor: 'grey.50',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease',
          '&:focus-within': {
            borderColor: 'var(--mui-palette-primary-main)',
          },
          '&:has(.MuiAutocomplete-root.Mui-expanded)': {
            borderColor: 'var(--mui-palette-primary-main)',
          },
          '& .phone-country-control': {
            position: 'relative',
            borderRight: '1px solid',
            borderRightColor: 'var(--mui-palette-grey-300)',
            minWidth: 0,
            transition: 'border-right-color 0.15s ease',
          },
          '&:focus-within .phone-country-control': {
            borderRightColor: 'var(--mui-palette-primary-main)',
          },
          '&:has(.MuiAutocomplete-root.Mui-expanded) .phone-country-control': {
            borderRightColor: 'var(--mui-palette-primary-main)',
          },
          '& .phone-number-control': {
            minWidth: 0,
          },
          '& .phone-country-value-overlay': {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            pl: 1.75,
            pr: 4.25,
            pointerEvents: 'none',
            zIndex: 1,
          },
          '& .phone-country-flag': {
            fontSize: 20,
            lineHeight: 1,
          },
          '& .phone-country-dial': {
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1,
            color: 'grey.700',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            backgroundColor: 'transparent',
            outline: 'none !important',
          },
          '& .MuiOutlinedInput-root fieldset, & .MuiOutlinedInput-root:hover fieldset, & .MuiOutlinedInput-root.Mui-focused fieldset':
            {
              border: 'none',
            },
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: 'none',
            outline: 'none !important',
          },
          '& .MuiInputBase-root:focus-within': {
            boxShadow: 'none !important',
            outline: 'none !important',
          },
          '& .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '& .MuiAutocomplete-root:focus-within': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '& .MuiAutocomplete-popupIndicator': {
            mr: '6px !important',
          },
          '& .phone-country-control .MuiAutocomplete-input': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'clip',
            paddingRight: '0 !important',
            textAlign: 'left',
            color: 'transparent !important',
            WebkitTextFillColor: 'transparent !important',
            caretColor: 'transparent !important',
            textShadow: 'none !important',
          },
          '& .phone-country-control .MuiAutocomplete-endAdornment': {
            right: '4px !important',
          },
        }}
      >
        <Box className="phone-country-control">
          {selectedCountryOption ? (
            <Box aria-hidden className="phone-country-value-overlay">
              <span className="phone-country-flag">{selectedCountryOption.flag}</span>
              <span className="phone-country-dial">{`(+${selectedCountryOption.dialingCode})`}</span>
            </Box>
          ) : null}

          <SelectOptionField
            aria-label={countryAriaLabel}
            control={control}
            hideEmptyHelperText
            name={countryName}
            noOptionsText={noOptionsText}
            options={countryOptions}
            rules={countryRules}
            searchable
            searchInPopup
            searchPlaceholder={searchPlaceholder}
            autocompleteProps={{
              slotProps: {
                popper: {
                  placement: 'bottom-start',
                  modifiers: [
                    {
                      name: 'flip',
                      enabled: false,
                    },
                    {
                      name: 'preventOverflow',
                      options: {
                        altAxis: false,
                      },
                    },
                  ],
                  sx: {
                    width: `${popupWidthPx}px !important`,
                    left: '0 !important',
                  },
                },
              },
              renderOption: (renderProps, option) => {
                const typedOption = option as PhoneCountryOption<TValue>
                return (
                  <li {...renderProps} key={String(typedOption.value)}>
                    {`${typedOption.flag} ${typedOption.countryName} (+${typedOption.dialingCode})`}
                  </li>
                )
              },
            }}
          />
        </Box>

        <Box className="phone-number-control">
          <TextInputField
            aria-label={phoneAriaLabel}
            control={control}
            hideEmptyHelperText
            name={phoneName}
            placeholder={phonePlaceholder}
            rules={phoneRules}
            status="default"
          />
        </Box>
      </Box>

      {(
        (errors[phoneName]?.message as string | undefined) ||
        (errors[countryName]?.message as string | undefined)
      ) ? (
        <FormHelperText
          error
          sx={{
            ml: 0,
            mt: 1,
            ...textSmStyle,
          }}
        >
          {(errors[phoneName]?.message as string | undefined) ??
            (errors[countryName]?.message as string | undefined)}
        </FormHelperText>
      ) : null}
    </Box>
  )
}

export const PhoneNumberField = PhoneNumberFieldInner as <
  TFieldValues extends FieldValues = FieldValues,
  TCountryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TPhoneName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue extends string | number = Extract<FieldPathValue<TFieldValues, TCountryName>, string | number>,
>(
  props: PhoneNumberFieldProps<TFieldValues, TCountryName, TPhoneName, TValue>,
) => ReactElement

export default PhoneNumberField
