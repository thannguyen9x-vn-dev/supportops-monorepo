import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideSwitch(theme: Theme): Components['MuiSwitch'] {
  return {
    styleOverrides: {
      root: {
        width: 36,
        height: 20,
        padding: 0,
        borderRadius: 12,
        display: 'flex',
        position: 'relative',
        '&:has(.MuiSwitch-switchBase.Mui-disabled)': {
          pointerEvents: 'none',
        },
        '&:active': {
          '& .MuiSwitch-thumb': {
            width: 18,
          },
          '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(16px)',
          },
        },
        '& .MuiSwitch-switchBase': {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '&.Mui-disabled': {
              color: '#fff',
            },
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: theme.palette.primary['500'],
              ...theme.applyStyles('dark', {
                backgroundColor: theme.palette.grey['300'],
              }),
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              backgroundColor: theme.palette.grey['200'],
            },
          },
          '&.Mui-disabled': {
            color: theme.palette.grey[200],
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.grey[200],
              opacity: 1,
            },
          },
        },

        '& .MuiSwitch-thumb': {
          boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
          width: 16,
          height: 16,
          borderRadius: 16,
          transition: theme.transitions.create(['width'], {
            duration: 200,
          }),
        },
        '& .MuiSwitch-track': {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor: theme.palette.grey['100'],
          boxSizing: 'border-box',
          ...theme.applyStyles('dark', {
            backgroundColor: 'rgba(255,255,255,.35)',
          }),
        },
      },
    },
  }
}
