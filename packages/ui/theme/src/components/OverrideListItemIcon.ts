import type {Components} from '@mui/material/styles'

export function OverrideListItemIcon(): Components['MuiListItemIcon'] {
  return {
    styleOverrides: {
      root: {
        minWidth: 24,
      },
    },
  }
}
