import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideRadio(theme: Theme): Components['MuiRadio'] {
  const textSecondary = theme.vars?.palette.text.secondary ?? theme.palette.text.secondary
  const textDisabled = theme.vars?.palette.text.disabled ?? theme.palette.text.disabled
  const primaryMain = theme.vars?.palette.primary.main ?? theme.palette.primary.main

  return {
    defaultProps: {
      disableRipple: true,
      disableTouchRipple: true,
      disableFocusRipple: true,
      size: 'medium',
    },
    styleOverrides: {
      root: {
        borderRadius: '8px',
        color: textSecondary,
        '&.Mui-checked': {
          color: primaryMain,
        },
        '&.Mui-disabled': {
          color: textDisabled,
        },
        '&.MuiRadio-sizeSmall': {
          padding: '8px',
          '.MuiSvgIcon-root, .icon': {
            fontSize: '16px',
            width: '16px',
            height: '16px',
          },
        },
        '&.MuiRadio-sizeMedium': {
          padding: '8px',
          '.MuiSvgIcon-root, .icon': {
            fontSize: '24px',
            width: '24px',
            height: '24px',
          },
        },
        '&.MuiRadio-sizeLarge': {
          padding: '12px',
          '.MuiSvgIcon-root, .icon': {
            fontSize: '32px',
            width: '32px',
            height: '32px',
          },
        },
      },
    },
  }
}
