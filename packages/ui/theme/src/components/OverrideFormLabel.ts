import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideFormLabel(theme: Theme): Components['MuiFormLabel'] {
  const textSecondary = theme.vars?.palette.text.secondary ?? theme.palette.text.secondary
  const errorMain = theme.vars?.palette.error.main ?? theme.palette.error.main

  return {
    styleOverrides: {
      root: {
        color: textSecondary,
        '&.Mui-focused': {
          color: textSecondary,
        },
        '&.Mui-error': {
          color: errorMain,
        },
        '&.Mui-required': {
          position: 'relative',
          paddingLeft: '8px',
          '.MuiFormLabel-asterisk': {
            position: 'absolute',
            left: 0,
            color: 'currentColor',
          },
        },
      },
    },
  }
}
