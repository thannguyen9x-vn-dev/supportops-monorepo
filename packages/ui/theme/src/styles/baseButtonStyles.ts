import type {Theme} from '@mui/material/styles'

export const baseButtonStyles = (theme: Theme) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'row' as const,
  borderRadius: theme.radius.xs,

  '.MuiButton-startIcon, .MuiButton-endIcon': {
    margin: 0,
  },

  '& svg.remixicon': {
    width: 16,
    height: 16, 
  },

})
