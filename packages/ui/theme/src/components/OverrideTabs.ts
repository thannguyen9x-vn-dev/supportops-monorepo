import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideTabs(theme: Theme): Components['MuiTabs'] {
  return {
    styleOverrides: {
      vertical: {
        overflow: 'visible',
      },
      root: {
        minHeight: 'auto',
        position: 'relative',
        '&:after': {
          content: '""',
          display: 'block',
          width: '100%',
          borderBottom: `1px solid ${theme.palette.grey[300]}`,
          position: 'absolute',
          bottom: 0,
          left: 0,
        },
      },
    },
  }
}
