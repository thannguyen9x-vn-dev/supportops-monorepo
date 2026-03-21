import type {Components} from '@mui/material/styles'

export function OverrideTextField(): Components['MuiTextField'] {
  return {
    styleOverrides: {
      root: {
        '& .MuiInputAdornment-positionStart.startAdornmentCustom + .MuiInputBase-input': {
          paddingLeft: 0,
        },
      },
    },
  }
}
