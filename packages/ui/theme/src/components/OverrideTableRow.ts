import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideTableRow(theme: Theme): Components['MuiTableRow'] {
  return {
    styleOverrides: {
      root: {
        '&.MuiTableRow-hover:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    },
  }
}
