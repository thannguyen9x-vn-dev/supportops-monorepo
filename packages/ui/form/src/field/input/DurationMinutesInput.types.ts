import type {TextFieldProps} from '@mui/material/TextField'

export interface DurationMinutesInputProps
  extends Omit<TextFieldProps, 'label' | 'onChange' | 'type' | 'value'> {
  label: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
}
