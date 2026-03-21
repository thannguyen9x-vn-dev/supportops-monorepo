import type {Components} from '@mui/material/styles'

export function OverrideStepper(): Components['MuiStep'] {
  return {
    styleOverrides: {
      root: {
        '.MuiStepLabel-iconContainer': {
          '.MuiStepIcon-text': {
            fontSize: '12px',
          },
          '.Mui-completed': {
            width: '22px',
            height: '22px',
          },
        },
      },
    },
  }
}
