import type {Theme} from '@mui/material'
import {alpha} from '@mui/material/styles'
import type {Components} from '@mui/material/styles'

export function OverrideFormControlLabel(theme: Theme): Components['MuiFormControlLabel'] {
  return {
    styleOverrides: {
      root: {
        '&.with-checkbox': {
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          '&.checked': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            ...theme.applyStyles('dark', {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            }),
          },
        },
      },
    },
  }
}
