import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideInputLabel(theme: Theme): Components['MuiInputLabel'] {
  const textSecondary = theme.vars?.palette.text.secondary ?? theme.palette.text.secondary
  return {
    styleOverrides: {
      root: {
        fontSize: '12px',
        lineHeight: '15px',
        color: textSecondary,
        transform: 'none',
        marginBottom: '4px',
      },
    },
  }
}
