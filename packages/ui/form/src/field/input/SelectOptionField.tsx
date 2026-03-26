'use client'

import type {ComponentProps, ReactElement} from 'react'
import {useCallback, useMemo, useState} from 'react'
import type {FieldPath, FieldPathValue, FieldValues} from 'react-hook-form'
import {useController} from 'react-hook-form'

import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import {styled} from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'

import type {SelectOption, SelectOptionFieldProps} from './SelectOptionField.types'

const textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
}

const POPUP_OFFSET: [number, number] = [0, 8]

const StyledTextField = styled(TextField)(({theme}) => {
  const controlHeight = 40
  const borderRadius = 8
  const innerRadius = Math.max(borderRadius - 2, 0)
  const varsPalette = theme.vars?.palette

  const borderColor = varsPalette?.divider ?? theme.palette.divider
  const backgroundPaper = varsPalette?.background.paper ?? theme.palette.background.paper
  const textPrimary = varsPalette?.text.primary ?? theme.palette.text.primary
  const textSecondary = varsPalette?.text.secondary ?? theme.palette.text.secondary
  const textDisabled = varsPalette?.text.disabled ?? theme.palette.text.disabled
  const disabledBackground =
    varsPalette?.action.disabledBackground ?? theme.palette.action.disabledBackground

  return {
    '& .MuiOutlinedInput-root': {
      minHeight: controlHeight,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: backgroundPaper,
      color: textPrimary,
      transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),

      '& fieldset': {
        borderColor,
        borderWidth: 1,
        inset: 0,
      },

      '&:hover fieldset': {
        borderColor,
      },

      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },

      '&.Mui-focused': {
        boxShadow: 'none',
      },

      '&.Mui-focused:not(.Mui-readOnly) input[aria-invalid="false"] ~ fieldset': {
        boxShadow: 'none',
      },

      '& .MuiOutlinedInput-input': {
        ...textSmStyle,
        boxSizing: 'border-box',
        height: controlHeight,
        padding: '10px 16px',
        color: textPrimary,
        outline: 'none',
        WebkitTextFillColor: textPrimary,
        caretColor: textPrimary,

        '&::placeholder': {
          color: textSecondary,
          opacity: 1,
        },

        '&:focus': {
          outline: 'none',
        },

        '&:focus-visible': {
          outline: 'none',
        },
      },

      '&.Mui-disabled': {
        backgroundColor: disabledBackground,
        color: textDisabled,

        '& fieldset': {
          borderColor,
        },
      },

      '& .MuiOutlinedInput-notchedOutline legend': {
        display: 'none',
      },

      '& .MuiOutlinedInput-notchedOutline': {
        top: 0,
        borderRadius: 'inherit',
      },

      '& .MuiSelect-select': {
        ...textSmStyle,
        boxSizing: 'border-box',
        minHeight: `${controlHeight - 4}px !important`,
        height: `${controlHeight - 4}px !important`,
        width: 'calc(100% - 4px)',
        margin: '2px',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 38px 10px 14px !important',
        color: textPrimary,
        WebkitTextFillColor: textPrimary,
        backgroundColor: `${backgroundPaper} !important`,
        borderRadius: `${innerRadius}px`,
      },
      '& .MuiSelect-select:focus': {
        backgroundColor: `${backgroundPaper} !important`,
      },
      '& .MuiSelect-select.Mui-disabled': {
        color: textDisabled,
        WebkitTextFillColor: textDisabled,
      },
      // Neutralize global MuiOutlinedInput input background/radius on select display
      '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input': {
        backgroundColor: `${backgroundPaper} !important`,
        borderRadius: `${innerRadius}px`,
        boxShadow: 'none !important',
      },
      '& .MuiSelect-nativeInput': {
        inset: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: 'transparent !important',
        borderRadius: 0,
      },

      '& .MuiSelect-icon': {
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        marginTop: 0,
        fontSize: 24,
      },
    },
  }
})

const StyledFieldLabel = styled(FormLabel)(({theme}) => ({
  ...textSmStyle,
  display: 'block',
  color: theme.palette.text.secondary,
  marginBottom: 6,
}))

const StyledHelperText = styled(FormHelperText)(({theme}) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle,
  color: theme.palette.text.secondary,
  '&.Mui-error': {
    color: theme.palette.error.main,
  },
}))

const popupPaperBorderStyles = {
  border: '1px solid var(--mui-palette-divider)',
  borderRadius: '8px',
  boxShadow: '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)',
  overflow: 'hidden',
} as const

function SelectOptionFieldInner<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue extends string | number = Extract<FieldPathValue<TFieldValues, TName>, string | number>,
>(props: SelectOptionFieldProps<TFieldValues, TName, TValue>): ReactElement {
  const {
    name,
    control,
    rules,
    label,
    helperText,
    hideEmptyHelperText = false,
    options,
    searchable = false,
    searchInPopup = false,
    searchPlaceholder,
    noOptionsText,
    disableClearable = true,
    autocompleteProps,
    id,
    disabled,
    placeholder,
    ...textFieldProps
  } = props

  const {
    field,
    fieldState: {error},
  } = useController({
    name,
    control,
    rules,
  })

  const helperTextContent = error?.message ?? helperText
  const showHelper = !hideEmptyHelperText || helperTextContent
  const inputId = id ?? String(name)
  const [open, setOpen] = useState(false)
  const [popupSearchValue, setPopupSearchValue] = useState('')

  const selectedOption = useMemo(() => {
    return options.find(option => option.value === field.value) ?? null
  }, [field.value, options])

  const popupSearchText = popupSearchValue.trim().toLocaleLowerCase()

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(
    (event: unknown, reason: string) => {
      if (searchInPopup && reason === 'blur') return

      setOpen(false)
      setPopupSearchValue('')
      autocompleteProps?.onClose?.(
        event as Parameters<NonNullable<typeof autocompleteProps.onClose>>[0],
        reason as Parameters<NonNullable<typeof autocompleteProps.onClose>>[1],
      )
    },
    [autocompleteProps, searchInPopup],
  )

  const handleClickAway = useCallback(() => {
    if (!searchInPopup) return

    setOpen(false)
    setPopupSearchValue('')
  }, [searchInPopup])

  const handleSelect = useCallback(
    (_: unknown, nextOption: SelectOption<TValue> | null) => {
      if (!nextOption && disableClearable) return

      field.onChange(nextOption?.value ?? '')
      if (searchInPopup) {
        setOpen(false)
        setPopupSearchValue('')
      }
    },
    [disableClearable, field, searchInPopup],
  )

  const mergedPopperSlotProps = useMemo(() => {
    const popperSlotProp = autocompleteProps?.slotProps?.popper

    if (typeof popperSlotProp === 'function') return popperSlotProp

    const existingModifiers = Array.isArray(popperSlotProp?.modifiers)
      ? popperSlotProp.modifiers
      : []

    return {
      ...popperSlotProp,
      modifiers: [
        ...existingModifiers,
        {
          name: 'offset',
          enabled: true,
          options: {
            offset: POPUP_OFFSET,
          },
        },
      ],
    }
  }, [autocompleteProps?.slotProps?.popper])

  const PopupPaper = useCallback(
    (paperProps: ComponentProps<typeof Paper>) => {
      const {children, ...rest} = paperProps

      return (
        <Paper
          {...rest}
          sx={{
            ...popupPaperBorderStyles,
            paddingTop: searchInPopup ? 1 : 0,
          }}
        >
          {searchInPopup ? (
            <>
              <Box sx={{paddingX: 1, paddingBottom: 1}}>
                <TextField
                  autoFocus
                  fullWidth
                  onChange={event => {
                    setPopupSearchValue(event.target.value)
                  }}
                  onKeyDown={event => {
                    event.stopPropagation()
                  }}
                  onMouseDown={event => {
                    event.stopPropagation()
                  }}
                  placeholder={searchPlaceholder}
                  size="small"
                  value={popupSearchValue}
                />
              </Box>
              <Divider />
            </>
          ) : null}
          {children}
        </Paper>
      )
    },
    [popupSearchValue, searchInPopup, searchPlaceholder],
  )

  const autocompleteSx = {
    '& .MuiAutocomplete-inputRoot': {
      padding: '0 !important',
    },
    '& .MuiAutocomplete-input': {
      ...textSmStyle,
      boxSizing: 'border-box',
      height: '40px !important',
      minWidth: 0,
      padding: '10px 16px !important',
    },
    '& .MuiAutocomplete-endAdornment': {
      top: '50%',
      transform: 'translateY(-50%)',
      right: 8,
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiAutocomplete-popupIndicator': {
      width: 24,
      height: 24,
      minWidth: 24,
      border: 0,
      borderRadius: 6,
      backgroundColor: 'transparent !important',
      boxShadow: 'none',
      color: 'var(--mui-palette-text-secondary)',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
        color: 'var(--mui-palette-text-primary)',
      },
      '& .MuiSvgIcon-root': {
        fontSize: 24,
      },
    },
    '& .MuiAutocomplete-popupIndicator.Mui-focused': {
      backgroundColor: 'transparent',
    },
    '& .MuiAutocomplete-clearIndicator': {
      width: 20,
      height: 20,
      minWidth: 20,
      border: 0,
      borderRadius: 4,
      backgroundColor: 'transparent !important',
      boxShadow: 'none',
      color: 'var(--mui-palette-text-secondary)',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent !important',
        color: 'var(--mui-palette-text-primary)',
      },
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '& .MuiAutocomplete-listbox': {
      maxHeight: 320,
    },
  } as const

  const nativeSelectMenuProps = {
    PaperProps: {
      sx: {
        ...popupPaperBorderStyles,
        mt: '4px',
        bgcolor: 'background.paper',
        '& .MuiMenuItem-root': {
          ...textSmStyle,
          color: 'text.primary',
        },
        '& .MuiMenuItem-root:hover': {
          bgcolor: 'action.hover',
        },
        '& .MuiMenuItem-root.Mui-selected': {
          bgcolor: 'action.selected',
        },
        '& .MuiMenuItem-root.Mui-selected:hover': {
          bgcolor: 'action.selected',
        },
        '& .MuiMenuItem-root.Mui-disabled': {
          color: 'text.disabled',
        },
      },
    },
  } as const

  function PopupSearchAutocomplete(): ReactElement {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box sx={{width: '100%'}}>
          <Autocomplete<SelectOption<TValue>, false, boolean, false>
            {...autocompleteProps}
            clearOnBlur={false}
            disableClearable={disableClearable}
            disabled={disabled}
            forcePopupIcon
            fullWidth
            getOptionDisabled={option => Boolean(option.disabled)}
            getOptionKey={option => String(option.value)}
            getOptionLabel={option => option.label}
            id={inputId}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            noOptionsText={noOptionsText}
            onBlur={field.onBlur}
            onChange={handleSelect}
            onClose={handleClose}
            onOpen={event => {
              handleOpen()
              autocompleteProps?.onOpen?.(event)
            }}
            open={open}
            options={options}
            popupIcon={<KeyboardArrowDownRoundedIcon />}
            renderInput={params => (
              <StyledTextField
                {...params}
                {...textFieldProps}
                error={Boolean(error)}
                inputProps={{
                  ...params.inputProps,
                  readOnly: true,
                }}
                onClick={() => {
                  setOpen(prev => !prev)
                }}
                placeholder={placeholder}
                variant="outlined"
              />
            )}
            filterOptions={items => {
              if (!popupSearchText) return items

              return items.filter(option =>
                option.label.toLocaleLowerCase().includes(popupSearchText),
              )
            }}
            selectOnFocus={false}
            slotProps={{
              ...autocompleteProps?.slotProps,
              popupIndicator: {
                ...(autocompleteProps?.slotProps?.popupIndicator ?? {}),
                disableRipple: true,
              },
              clearIndicator: {
                ...(autocompleteProps?.slotProps?.clearIndicator ?? {}),
                disableRipple: true,
                sx: {
                  color: 'text.secondary',
                  backgroundColor: 'transparent !important',
                  '&:hover': { backgroundColor: 'transparent !important', color: 'text.primary' },
                  '& .MuiSvgIcon-root': { fontSize: 16 },
                },
              },
              popper: mergedPopperSlotProps,
            }}
            slots={{
              ...autocompleteProps?.slots,
              paper: PopupPaper,
            }}
            sx={{
              ...autocompleteSx,
              '& .MuiAutocomplete-input': {
                ...autocompleteSx['& .MuiAutocomplete-input'],
                cursor: 'pointer',
              },
            }}
            value={selectedOption}
          />
        </Box>
      </ClickAwayListener>
    )
  }

  function InlineSearchAutocomplete(): ReactElement {
    return (
      <Autocomplete<SelectOption<TValue>, false, boolean, false>
        {...autocompleteProps}
        clearOnBlur={false}
        disableClearable={disableClearable}
        disabled={disabled}
        forcePopupIcon
        fullWidth
        getOptionDisabled={option => Boolean(option.disabled)}
        getOptionKey={option => String(option.value)}
        getOptionLabel={option => option.label}
        id={inputId}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        noOptionsText={noOptionsText}
        onBlur={field.onBlur}
        onChange={handleSelect}
        options={options}
        popupIcon={<KeyboardArrowDownRoundedIcon />}
        renderInput={params => (
          <StyledTextField
            {...params}
            {...textFieldProps}
            error={Boolean(error)}
            placeholder={searchPlaceholder ?? placeholder}
            variant="outlined"
          />
        )}
        selectOnFocus={false}
        slotProps={{
          ...autocompleteProps?.slotProps,
          popupIndicator: {
            ...(autocompleteProps?.slotProps?.popupIndicator ?? {}),
            disableRipple: true,
          },
          clearIndicator: {
            ...(autocompleteProps?.slotProps?.clearIndicator ?? {}),
            disableRipple: true,
            sx: {
              color: 'text.secondary',
              backgroundColor: 'transparent !important',
              '&:hover': { backgroundColor: 'transparent !important', color: 'text.primary' },
              '& .MuiSvgIcon-root': { fontSize: 16 },
            },
          },
          popper: mergedPopperSlotProps,
        }}
        sx={autocompleteSx}
        value={selectedOption}
      />
    )
  }

  function NativeSelectField(): ReactElement {
    return (
      <StyledTextField
        {...textFieldProps}
        {...field}
        disabled={disabled}
        error={Boolean(error)}
        fullWidth
        id={inputId}
        SelectProps={{
          MenuProps: nativeSelectMenuProps,
          displayEmpty: true,
          renderValue: (selected: unknown) => {
            if (selected === '' || selected === null || selected === undefined) {
              return (
                <span
                  style={{
                    color: 'var(--mui-palette-text-secondary)',
                    WebkitTextFillColor: 'var(--mui-palette-text-secondary)',
                    fontWeight: 400,
                  }}
                >
                  {placeholder ?? 'Select'}
                </span>
              )
            }
            return <span>{options.find(o => o.value === selected)?.label ?? String(selected)}</span>
          },
        }}
        select
        value={field.value ?? ''}
        variant="outlined"
      >
        {options.map(option => (
          <MenuItem disabled={option.disabled} key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </StyledTextField>
    )
  }

  return (
    <Box sx={{width: '100%'}}>
      {label ? (
        <StyledFieldLabel htmlFor={inputId}>
          {label}
        </StyledFieldLabel>
      ) : null}

      {searchable ? (
        searchInPopup ? (
          PopupSearchAutocomplete()
        ) : (
          InlineSearchAutocomplete()
        )
      ) : (
        NativeSelectField()
      )}

      {showHelper ? (
        <StyledHelperText error={Boolean(error)}>{helperTextContent}</StyledHelperText>
      ) : null}
    </Box>
  )
}

export const SelectOptionField = SelectOptionFieldInner as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue extends string | number = Extract<FieldPathValue<TFieldValues, TName>, string | number>,
>(
  props: SelectOptionFieldProps<TFieldValues, TName, TValue>,
) => ReactElement

export default SelectOptionField
