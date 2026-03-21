import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideTab(theme: Theme): Components['MuiTab'] {
  return {
    styleOverrides: {
      root: {
        padding: '4px 8px',
        minHeight: 'auto',
        borderRadius: '6px 6px 0 0',
        zIndex: 1,
        fontSize: '14px',
        lineHeight: '20px',
        minWidth: 'fit-content',
        '&.Mui-selected': {
          fontWeight: '700',
          backgroundColor: 'rgba(89,77,232, 0.1)',
          borderBottom: `2px solid ${theme.palette.primary['500']}`,
        },
      },
    },
  }
}
