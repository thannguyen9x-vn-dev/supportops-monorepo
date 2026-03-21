import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideTableHead(theme: Theme): Components['MuiTableHead'] {
  return {
    styleOverrides: {
      root: {
        textWrap: 'nowrap',
        backgroundColor: theme.palette.action.hover,
        fontWeight: 600,

        '& tr th:first-of-type': {
          borderRadius: '4px 0 0 0',
        },
        '& tr th:last-of-type': {
          borderRadius: '0 4px 0 0',
        },
      },
    },
  }
}
