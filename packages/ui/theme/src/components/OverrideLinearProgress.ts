import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideLinearProgress(theme: Theme): Components['MuiLinearProgress'] {
  return {
    styleOverrides: {
      root: {
        height: 6,
        borderRadius: 100,
        backgroundColor: theme.palette.grey[200],
      },
      bar: {
        borderRadius: 100,
      },
    },
  }
}
