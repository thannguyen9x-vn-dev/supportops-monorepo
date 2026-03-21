import type {Components} from '@mui/material/styles'

export function OverrideMenuItem(): Components['MuiMenuItem'] {
  return {
    styleOverrides: {
      root: {
        fontSize: 'inherit',
        minHeight: '40px',
      },
    },
  }
}
