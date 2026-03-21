'use client'

import type {ReactElement} from 'react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {FieldPath, FieldValues} from 'react-hook-form'
import {useController} from 'react-hook-form'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Select from '@mui/material/Select'
import {styled} from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import type {SelectDateFieldProps, SelectDateFieldTexts} from './SelectDateField.types'
import type {TextInputFieldStatus} from './TextInputField.types'

// ─── Pure helpers (no hooks) ─────────────────────────────────────────────────

interface CalendarCell {
  day: number
  month: number
  year: number
  overflow: boolean
}

/** Parse ISO string (YYYY-MM-DD) without UTC shift */
function isoToDate(iso: string): Date {
  const parts = iso.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Date(y, m - 1, d)
}

/** Format Date to ISO string YYYY-MM-DD */
function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Format ISO string to human-readable display string */
function formatDisplayDate(iso: string, locale?: string): string {
  const parts = iso.split('-')
  const y = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 1)
  const d = Number(parts[2] ?? 1)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(y, m - 1, d))
}

/** Get month names array (12 items) */
function getMonthNames(locale?: string): readonly string[] {
  return Array.from({length: 12}, (_, i) =>
    new Intl.DateTimeFormat(locale, {month: 'long'}).format(new Date(2000, i, 1))
  )
}

/** Get weekday headers starting from Sunday */
function getDayHeaders(locale?: string): readonly string[] {
  const sunday = new Date(2023, 0, 1)
  return Array.from({length: 7}, (_, i) =>
    new Intl.DateTimeFormat(locale, {weekday: 'short'})
      .format(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i))
      .replace('.', '')
  )
}

/** Build 42-cell calendar grid (6 rows × 7 cols, Sunday first) */
function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const grid: CalendarCell[] = []

  // Leading days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const overflowMonth = month === 0 ? 11 : month - 1
    const overflowYear = month === 0 ? year - 1 : year
    grid.push({day: daysInPrevMonth - i, month: overflowMonth, year: overflowYear, overflow: true})
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({day: d, month, year, overflow: false})
  }

  // Trailing days from next month — fill to 42 cells total
  const trailing = 42 - grid.length
  for (let d = 1; d <= trailing; d++) {
    const overflowMonth = month === 11 ? 0 : month + 1
    const overflowYear = month === 11 ? year + 1 : year
    grid.push({day: d, month: overflowMonth, year: overflowYear, overflow: true})
  }

  return grid
}

function isSameDay(cell: CalendarCell, date: Date | null): boolean {
  if (!date) return false
  return (
    cell.day === date.getDate() &&
    cell.month === date.getMonth() &&
    cell.year === date.getFullYear()
  )
}

function isToday(cell: CalendarCell): boolean {
  const today = new Date()
  return (
    cell.day === today.getDate() &&
    cell.month === today.getMonth() &&
    cell.year === today.getFullYear()
  )
}

/** Year range 1900–2100 */
const YEAR_OPTIONS: readonly number[] = Array.from({length: 201}, (_, i) => 1900 + i)

const DEFAULT_TEXTS: Required<Omit<SelectDateFieldTexts, 'dayHeaders'>> = {
  monthLabel: 'Month',
  yearLabel: 'Year',
  todayLabel: 'Today',
  clearLabel: 'Clear',
  keyboardHint: 'Cursor keys can navigate dates',
  selectMonthAriaLabel: 'Select month',
  selectYearAriaLabel: 'Select year',
}

// ─── Styled components ────────────────────────────────────────────────────────

const textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
} as const

function getBorderRadiusPx(value: string | number): number {
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return 8
  return parsed
}

const StyledTextField = styled(TextField, {
  shouldForwardProp: prop => prop !== 'fieldStatus',
})<{fieldStatus?: TextInputFieldStatus}>(({theme, fieldStatus = 'default'}) => {
  const controlHeight = 40
  const baseRadius = getBorderRadiusPx(theme.shape.borderRadius)
  const borderRadius = baseRadius * 3

  const baseBorderColor = theme.palette.divider
  const focusBorderColor = theme.palette.primary.main

  const statusBorderColor = fieldStatus === 'error' ? theme.palette.error.main : baseBorderColor

  return {
    '& .MuiOutlinedInput-root': {
      height: controlHeight,
      minHeight: controlHeight,
      borderRadius,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      transition: theme.transitions.create(['border-color', 'background-color']),
      cursor: 'pointer',

      '& fieldset': {
        borderColor: statusBorderColor,
        borderWidth: 1,
        inset: 0,
      },

      '&:hover fieldset': {
        borderColor: fieldStatus === 'default' ? baseBorderColor : statusBorderColor,
      },

      '&.Mui-focused fieldset': {
        borderColor: fieldStatus === 'default' ? focusBorderColor : statusBorderColor,
        borderWidth: 1,
        boxShadow: 'none !important',
      },
      '&.Mui-focused input ~ fieldset': {
        boxShadow: 'none !important',
      },

      '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        cursor: 'default',

        '& fieldset': {
          borderColor: theme.palette.divider,
        },
      },

      '& .MuiOutlinedInput-input': {
        ...textSmStyle,
        boxSizing: 'border-box',
        height: controlHeight,
        padding: '10px 16px',
        color: theme.palette.text.primary,
        outline: 'none',
        cursor: 'pointer',

        '&::placeholder': {
          color: theme.palette.text.secondary,
          fontWeight: 400,
          opacity: 1,
        },

        '&:focus': {outline: 'none'},
        '&:focus-visible': {outline: 'none'},
      },

      '& .MuiInputAdornment-root': {
        marginLeft: 12,
        marginRight: 8,
        color: fieldStatus === 'error' ? theme.palette.error.main : theme.palette.text.secondary,
      },

      '& .MuiSvgIcon-root': {
        fontSize: 22,
      },

      '& .MuiOutlinedInput-notchedOutline legend': {
        display: 'none',
      },

      '& .MuiOutlinedInput-notchedOutline': {
        top: 0,
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

const StyledHelperText = styled(FormHelperText, {
  shouldForwardProp: prop => prop !== 'fieldStatus',
})<{fieldStatus?: TextInputFieldStatus}>(({theme, fieldStatus = 'default'}) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle,
  color: fieldStatus === 'error' ? theme.palette.error.main : theme.palette.text.secondary,
}))

const StyledCompactSelect = styled(Select)(({theme}) => ({
  minWidth: 0,
  '& .MuiSelect-select': {
    ...textSmStyle,
    color: theme.palette.text.primary,
    padding: 0,
    lineHeight: '24px',
    minHeight: '24px !important',
    borderRadius: 0,
    backgroundColor: 'transparent !important',
  },
  '& .MuiSelect-select:focus': {
    backgroundColor: 'transparent !important',
    outline: 'none !important',
  },
  '& .MuiSelect-select:focus-visible': {
    backgroundColor: 'transparent !important',
    outline: 'none !important',
  },
  '& .MuiSelect-select.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
    outline: 'none !important',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none !important',
    boxShadow: 'none !important',
  },
  '& fieldset': {
    border: 'none !important',
    boxShadow: 'none !important',
  },
}))

// ─── Component ────────────────────────────────────────────────────────────────

function SelectDateFieldInner<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: SelectDateFieldProps<TFieldValues, TName>): ReactElement {
  const {
    name,
    control,
    rules,
    label,
    placeholder,
    hideEmptyHelperText = false,
    disabled,
    locale,
    texts,
    'aria-label': ariaLabel,
  } = props

  const {
    field,
    fieldState: {error},
  } = useController({name, control, rules})

  // ── Calendar state ──────────────────────────────────────────────────────────
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth())
  const [focusedDate, setFocusedDate] = useState<Date | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const open = Boolean(anchorEl)

  const selectedDate = useMemo<Date | null>(() => {
    const val = field.value as string
    if (!val) return null
    return isoToDate(val)
  }, [field.value])

  const displayValue = useMemo<string>(() => {
    const val = field.value as string
    if (!val) return ''
    return formatDisplayDate(val, locale)
  }, [field.value, locale])

  const monthNames = useMemo(() => getMonthNames(locale), [locale])
  const dayHeaders = useMemo(() => texts?.dayHeaders ?? getDayHeaders(locale), [locale, texts])
  const uiTexts = useMemo(
    () => ({
      ...DEFAULT_TEXTS,
      ...texts,
    }),
    [texts]
  )
  const selectMenuProps = useMemo(
    () => ({
      PaperProps: {
        sx: {
          mt: '4px',
          maxHeight: '40vh',
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 4,
        },
      },
    }),
    []
  )

  const calendarGrid = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth])

  const fieldStatus: TextInputFieldStatus = error ? 'error' : 'default'

  // ── Focus management: when focusedDate changes, focus the matching button ───
  useEffect(() => {
    if (!open || !focusedDate) return
    const iso = dateToIso(focusedDate)
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)
    btn?.focus()
  }, [focusedDate, open])

  // ── Sync view when popover opens ────────────────────────────────────────────
  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return
      const date = selectedDate ?? new Date()
      setViewYear(date.getFullYear())
      setViewMonth(date.getMonth())
      setFocusedDate(selectedDate)
      setAnchorEl(event.currentTarget)
    },
    [disabled, selectedDate]
  )

  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setFocusedDate(null)
  }, [])

  const handleDaySelect = useCallback(
    (cell: CalendarCell) => {
      const date = new Date(cell.year, cell.month, cell.day)
      ;(field.onChange as (v: string) => void)(dateToIso(date))
      setAnchorEl(null)
      setFocusedDate(null)
    },
    [field]
  )

  const handleToday = useCallback(() => {
    const today = new Date()
    ;(field.onChange as (v: string) => void)(dateToIso(today))
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setAnchorEl(null)
    setFocusedDate(null)
  }, [field])

  const handleClear = useCallback(() => {
    ;(field.onChange as (v: string) => void)('')
    setAnchorEl(null)
    setFocusedDate(null)
  }, [field])

  const handlePrevMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const base = focusedDate ?? selectedDate ?? new Date(viewYear, viewMonth, 1)

      const delta: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      }

      if (e.key in delta) {
        e.preventDefault()
        const next = new Date(base)
        next.setDate(next.getDate() + (delta[e.key] ?? 0))
        setFocusedDate(next)
        if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
          setViewMonth(next.getMonth())
          setViewYear(next.getFullYear())
        }
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const target = focusedDate ?? base
        handleDaySelect({
          day: target.getDate(),
          month: target.getMonth(),
          year: target.getFullYear(),
          overflow: false,
        })
        return
      }

      if (e.key === 'Escape') {
        handleClose()
        return
      }

      if (e.key === 'PageUp') {
        e.preventDefault()
        handlePrevMonth()
        return
      }

      if (e.key === 'PageDown') {
        e.preventDefault()
        handleNextMonth()
      }
    },
    [
      focusedDate,
      selectedDate,
      viewYear,
      viewMonth,
      handleDaySelect,
      handleClose,
      handlePrevMonth,
      handleNextMonth,
    ]
  )

  const inputId = String(name)
  const showHelper = !hideEmptyHelperText || error?.message

  const helperContent = error?.message ?? null

  return (
    <Box sx={{width: '100%'}}>
      {label ? <StyledFieldLabel htmlFor={inputId}>{label}</StyledFieldLabel> : null}

      <StyledTextField
        disabled={disabled}
        error={Boolean(error)}
        fieldStatus={fieldStatus}
        fullWidth
        id={inputId}
        inputProps={{
          readOnly: true,
          'aria-label': ariaLabel,
          style: {cursor: disabled ? 'default' : 'pointer'},
        }}
        onClick={disabled ? undefined : handleOpen}
        placeholder={placeholder}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-hidden
                  disabled={disabled}
                  onClick={disabled ? undefined : handleOpen}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    bgcolor: 'transparent',
                    '&:hover': {bgcolor: 'transparent'},
                  }}
                  tabIndex={-1}
                >
                  <CalendarMonthIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        value={displayValue}
        variant="outlined"
      />

      {showHelper ? (
        <StyledHelperText fieldStatus={fieldStatus}>{helperContent}</StyledHelperText>
      ) : null}

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            sx: {
              mt: '4px',
              width: 320,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 4,
            },
          },
        }}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
      >
        {/* ── Header: month | year ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            px: 1.5,
            pt: 1.5,
            pb: 1,
            gap: 0,
          }}
        >
          {/* Month dropdown */}
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0}}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: 'fit-content',
              }}
            >
              <Typography
                sx={{fontSize: 10, color: 'text.secondary', lineHeight: 1, mb: 0.25, textAlign: 'center'}}
                variant="caption"
              >
                {uiTexts.monthLabel}
              </Typography>
              <Box
                sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}
              >
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <StyledCompactSelect
                    IconComponent={() => null}
                    MenuProps={selectMenuProps}
                    inputProps={{'aria-label': uiTexts.selectMonthAriaLabel}}
                    onChange={e => setViewMonth(Number(e.target.value))}
                    size="small"
                    value={viewMonth}
                    variant="outlined"
                  >
                    {monthNames.map((name, idx) => (
                      <MenuItem key={idx} value={idx}>
                        {name}
                      </MenuItem>
                    ))}
                  </StyledCompactSelect>
                </Box>
                <KeyboardArrowDownIcon
                  sx={{fontSize: 24, color: 'text.secondary', pointerEvents: 'none'}}
                />
              </Box>
            </Box>
          </Box>

          {/* Year dropdown */}
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0}}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: 'fit-content',
              }}
            >
              <Typography
                sx={{fontSize: 10, color: 'text.secondary', lineHeight: 1, mb: 0.25, textAlign: 'center'}}
                variant="caption"
              >
                {uiTexts.yearLabel}
              </Typography>
              <Box
                sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}
              >
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <StyledCompactSelect
                    IconComponent={() => null}
                    MenuProps={selectMenuProps}
                    inputProps={{'aria-label': uiTexts.selectYearAriaLabel}}
                    onChange={e => setViewYear(Number(e.target.value))}
                    size="small"
                    value={viewYear}
                    variant="outlined"
                  >
                    {YEAR_OPTIONS.map(y => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </StyledCompactSelect>
                </Box>
                <KeyboardArrowDownIcon
                  sx={{fontSize: 24, color: 'text.secondary', pointerEvents: 'none'}}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Calendar grid ── */}
        <Box onKeyDown={handleGridKeyDown} ref={gridRef} role="grid" sx={{px: 1.5, py: 1}}>
          {/* Day headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              mb: 0.5,
            }}
          >
            {dayHeaders.map((h, idx) => (
              <Box
                key={`${idx}-${h}`}
                sx={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'text.secondary',
                  py: 0.5,
                }}
              >
                {h}
              </Box>
            ))}
          </Box>

          {/* Day cells */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 0.25,
            }}
          >
            {calendarGrid.map((cell, idx) => {
              const selected = isSameDay(cell, selectedDate)
              const focused = isSameDay(cell, focusedDate)
              const today = isToday(cell)
              const iso = dateToIso(new Date(cell.year, cell.month, cell.day))

              return (
                <Box
                  aria-label={iso}
                  aria-pressed={selected}
                  aria-selected={selected}
                  component="button"
                  data-date={iso}
                  key={idx}
                  onClick={() => handleDaySelect(cell)}
                  role="gridcell"
                  tabIndex={focused ? 0 : -1}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    border: today && !selected ? '1.5px solid' : 'none',
                    borderColor: 'primary.main',
                    background: selected ? 'primary.main' : 'transparent',
                    bgcolor: selected ? 'primary.main' : 'transparent',
                    color: selected
                      ? 'primary.contrastText'
                      : cell.overflow
                        ? 'text.disabled'
                        : 'text.primary',
                    fontSize: 13,
                    fontWeight: selected ? 700 : 400,
                    cursor: 'pointer',
                    outline: focused ? '2px solid' : 'none',
                    outlineColor: 'primary.main',
                    outlineOffset: 1,
                    transition: 'background-color 0.15s',
                    '&:hover': {
                      bgcolor: selected ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {cell.day}
                </Box>
              )
            })}
          </Box>
        </Box>

        <Divider />

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={handleToday}
            size="small"
            startIcon={<CalendarTodayIcon sx={{fontSize: '16px !important'}} />}
            variant="text"
          >
            {uiTexts.todayLabel}
          </Button>
          <Button onClick={handleClear} size="small" sx={{color: 'text.secondary'}} variant="text">
            {uiTexts.clearLabel}
          </Button>
        </Box>
        <Box sx={{px: 1.5, pb: 1.5}}>
          <Typography sx={{fontSize: 11, color: 'text.disabled'}}>{uiTexts.keyboardHint}</Typography>
        </Box>
      </Popover>
    </Box>
  )
}

export const SelectDateField = SelectDateFieldInner as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: SelectDateFieldProps<TFieldValues, TName>
) => ReactElement

export default SelectDateField
