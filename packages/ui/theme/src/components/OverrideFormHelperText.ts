import type {Components, Theme} from '@mui/material/styles'

export function OverrideFormHelperText(theme: Theme): Components['MuiFormHelperText'] {
  return {
    styleOverrides: {
      root: {
        ...theme.typography.textXs,
      },
    },
  }
}
