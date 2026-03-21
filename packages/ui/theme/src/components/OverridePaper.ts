import type {Components} from '@mui/material/styles'

export function OverridePaper(): Components['MuiPaper'] {
  return {
    defaultProps: {
      elevation: 3,
    },
    styleOverrides: {
      root: {
        boxShadow: 'none',
      },
    },
  }
}
