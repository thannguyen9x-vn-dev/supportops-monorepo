import type {Components} from '@mui/material/styles'

export function OverrideCardContent(): Components['MuiCardContent'] {
  return {
    styleOverrides: {
      root: {
        padding: 20,
        '&:last-child': {
          paddingBottom: 20,
        },
      },
    },
  }
}
