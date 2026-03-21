import type {Components} from '@mui/material/styles'

export function OverrideLink(): Components['MuiLink'] {
  return {
    defaultProps: {
      underline: 'none',
    },
    styleOverrides: {
      root: {
        cursor: 'pointer',
      },
    },
  }
}
