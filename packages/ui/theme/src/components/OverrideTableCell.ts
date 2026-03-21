import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideTableCell(theme: Theme): Components['MuiTableCell'] {
  return {
    styleOverrides: {
      root: {
        fontSize: '14px',
        lineHeight: '20px',
        padding: '10px 8px',
        borderColor: theme.palette.divider,
        '&.cell-right': {
          justifyContent: 'flex-end',
          textAlign: 'right',
          '& > *': {
            justifyContent: 'flex-end',
            margin: '0 0 0 auto',
          },
          '& .MuiOutlinedInput-input': {
            textAlign: 'right',
          },
        },
        '&.cell-center': {
          justifyContent: 'center',
          textAlign: 'center',
          '& > *': {
            justifyContent: 'center',
            margin: '0 auto',
          },
        },
      },
      sizeSmall: {
        padding: '8px',
      },
      head: {
        fontSize: '0.75rem',
        fontWeight: 700,
      },
      footer: {
        fontSize: '0.75rem',
        textTransform: 'uppercase',
      },
    },
  }
}
