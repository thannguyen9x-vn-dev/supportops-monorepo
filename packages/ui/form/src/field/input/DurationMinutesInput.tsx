'use client'

import type {ReactElement} from 'react'

import Box from '@mui/material/Box'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import {styled} from '@mui/material/styles'

import type {DurationMinutesInputProps} from './DurationMinutesInput.types'

const textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
}

function getBorderRadiusPx(value: string | number): number {
  if (typeof value === 'number') return value

  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return 8
  return parsed
}

const StyledFieldLabel = styled(FormLabel)(({theme}) => ({
  ...textSmStyle,
  display: 'block',
  color: theme.palette.text.secondary,
  marginBottom: 6,
}))

const StyledTextField = styled(TextField)(({theme}) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: getBorderRadiusPx(theme.shape.borderRadius) * 3,
  },
  '& .MuiOutlinedInput-input': {
    ...textSmStyle,
    padding: '10px 16px',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      fontWeight: 400,
      opacity: 1,
    },
  },
}))

export function DurationMinutesInput({
  label,
  value,
  onChange,
  min = 1,
  step = 1,
  max,
  fullWidth = true,
  ...rest
}: DurationMinutesInputProps): ReactElement {
  return (
    <Box sx={{width: fullWidth ? '100%' : undefined}}>
      <StyledFieldLabel>{label}</StyledFieldLabel>
      <StyledTextField
        {...rest}
        fullWidth={fullWidth}
        onChange={event => onChange(event.target.value)}
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            min,
            max,
            step,
          },
        }}
        type='number'
        value={value}
        variant='outlined'
      />
    </Box>
  )
}

export default DurationMinutesInput
