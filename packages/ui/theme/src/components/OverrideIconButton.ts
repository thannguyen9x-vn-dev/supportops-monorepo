import {alpha} from '@mui/material'
import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

const focusRing = (color: string) => ({
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    boxShadow: `0 0 0 4px ${alpha(color, 0.25)}`,
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  '&:focus-visible::after': {
    opacity: 1,
  },
  '&:active::after': {
    opacity: 0,
  },
})

export function OverrideIconButton(theme: Theme): Components['MuiIconButton'] {
  const {grey, primary, common, success, error, warning, info} = theme.palette
  const white = common.white

  return {
    defaultProps: {
      color: 'primary',
      size: 'medium',
    },

    styleOverrides: {
      root: {
        position: 'relative',
        padding: 0, 
        minWidth: 'auto',
        overflow: 'hidden',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: 8,
        transition: 'all 0.2s ease-in-out',
      },
    },

    variants: [
      // =====================
      // SIZES
      // =====================
      {
        props: {size: 'xs'},
        style: {
          width: 28,
          height: 28,
          borderRadius: 6,
          '& .MuiSvgIcon-root': {
            fontSize: 16,
          },
        },
      },
      {
        props: {size: 'small'},
        style: {
          width: 32,
          height: 32,
          borderRadius: 6,
          '& .MuiSvgIcon-root': {
            fontSize: 18,
          },
        },
      },
      {
        props: {size: 'medium'},
        style: {
          width: 40,
          height: 40,
          borderRadius: 8,
          '& .MuiSvgIcon-root': {
            fontSize: 20,
          },
        },
      },
      {
        props: {size: 'large'},
        style: {
          width: 48,
          height: 48,
          borderRadius: 10,
          '& .MuiSvgIcon-root': {
            fontSize: 24,
          },
        },
      },
      {
        props: {size: 'xl'},
        style: {
          width: 56,
          height: 56,
          borderRadius: 12,
          '& .MuiSvgIcon-root': {
            fontSize: 28,
          },
        },
      },

      // =====================
      // PRIMARY - CONTAINED (Default)
      // =====================
      {
        props: {color: 'primary'},
        style: {
          backgroundColor: primary[500],
          color: white,
          '&:hover': {
            backgroundColor: primary[600],
          },
          '&:active': {
            backgroundColor: primary[700],
          },
          '&.Mui-disabled': {
            backgroundColor: primary[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(primary[500]),
        },
      },
      {
        props: {color: 'primary', variant: 'contained'},
        style: {
          backgroundColor: primary[500],
          color: white,
          '&:hover': {
            backgroundColor: primary[600],
          },
          '&:active': {
            backgroundColor: primary[700],
          },
          '&.Mui-disabled': {
            backgroundColor: primary[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(primary[500]),
        },
      },
      {
        props: {color: 'primary', variant: 'soft'},
        style: {
          backgroundColor: primary[50],
          color: primary[600],
          '&:hover': {
            backgroundColor: primary[100],
            color: primary[700],
          },
          '&:active': {
            backgroundColor: primary[200],
            color: primary[800],
          },
          '&.Mui-disabled': {
            backgroundColor: primary[50],
            color: primary[300],
          },
          ...focusRing(primary[200]),
        },
      },
      {
        props: {color: 'primary', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: primary[500],
          borderColor: primary[500],
          '&:hover': {
            backgroundColor: primary[50],
            borderColor: primary[600],
            color: primary[600],
          },
          '&:active': {
            backgroundColor: primary[100],
            borderColor: primary[700],
            color: primary[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: primary[200],
            color: primary[200],
          },
          ...focusRing(primary[200]),
        },
      },

      // =====================
      // SECONDARY - CONTAINED
      // =====================
      {
        props: {color: 'secondary'},
        style: {
          backgroundColor: grey[700],
          color: white,
          '&:hover': {
            backgroundColor: grey[800],
          },
          '&:active': {
            backgroundColor: grey[900],
          },
          '&.Mui-disabled': {
            backgroundColor: grey[300],
            color: grey[500],
          },
          ...focusRing(grey[600]),
        },
      },
      {
        props: {color: 'secondary', variant: 'contained'},
        style: {
          backgroundColor: grey[700],
          color: white,
          '&:hover': {
            backgroundColor: grey[800],
          },
          '&:active': {
            backgroundColor: grey[900],
          },
          '&.Mui-disabled': {
            backgroundColor: grey[300],
            color: grey[500],
          },
          ...focusRing(grey[600]),
        },
      },
      {
        props: {color: 'secondary', variant: 'soft'},
        style: {
          backgroundColor: grey[100],
          color: grey[700],
          '&:hover': {
            backgroundColor: grey[200],
            color: grey[800],
          },
          '&:active': {
            backgroundColor: grey[300],
            color: grey[900],
          },
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          ...focusRing(grey[200]),
        },
      },
      {
        props: {color: 'secondary', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: grey[600],
          borderColor: grey[300],
          '&:hover': {
            backgroundColor: grey[50],
            borderColor: grey[400],
            color: grey[700],
          },
          '&:active': {
            backgroundColor: grey[100],
            borderColor: grey[500],
            color: grey[800],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: grey[200],
            color: grey[300],
          },
          ...focusRing(grey[200]),
        },
      },

      // =====================
      // NEUTRAL (Light grey)
      // =====================
      {
        props: {color: 'neutral'},
        style: {
          backgroundColor: grey[200],
          color: grey[700],
          '&:hover': {
            backgroundColor: grey[300],
          },
          '&:active': {
            backgroundColor: grey[400],
          },
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          ...focusRing(grey[300]),
        },
      },
      {
        props: {color: 'neutral', variant: 'contained'},
        style: {
          backgroundColor: grey[200],
          color: grey[700],
          '&:hover': {
            backgroundColor: grey[300],
          },
          '&:active': {
            backgroundColor: grey[400],
          },
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          ...focusRing(grey[300]),
        },
      },
      {
        props: {color: 'neutral', variant: 'soft'},
        style: {
          backgroundColor: grey[50],
          color: grey[600],
          '&:hover': {
            backgroundColor: grey[100],
            color: grey[700],
          },
          '&:active': {
            backgroundColor: grey[200],
            color: grey[800],
          },
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[300],
          },
          ...focusRing(grey[100]),
        },
      },
      {
        props: {color: 'neutral', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: grey[600],
          borderColor: grey[200],
          '&:hover': {
            backgroundColor: grey[50],
            borderColor: grey[300],
          },
          '&:active': {
            backgroundColor: grey[100],
            borderColor: grey[400],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: grey[100],
            color: grey[300],
          },
          ...focusRing(grey[100]),
        },
      },

      // =====================
      // SUCCESS (Green)
      // =====================
      {
        props: {color: 'success'},
        style: {
          backgroundColor: success[500],
          color: white,
          '&:hover': {
            backgroundColor: success[600],
          },
          '&:active': {
            backgroundColor: success[700],
          },
          '&.Mui-disabled': {
            backgroundColor: success[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(success[500]),
        },
      },
      {
        props: {color: 'success', variant: 'contained'},
        style: {
          backgroundColor: success[500],
          color: white,
          '&:hover': {
            backgroundColor: success[600],
          },
          '&:active': {
            backgroundColor: success[700],
          },
          '&.Mui-disabled': {
            backgroundColor: success[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(success[500]),
        },
      },
      {
        props: {color: 'success', variant: 'soft'},
        style: {
          backgroundColor: success[50],
          color: success[600],
          '&:hover': {
            backgroundColor: success[100],
            color: success[700],
          },
          '&:active': {
            backgroundColor: success[200],
            color: success[800],
          },
          '&.Mui-disabled': {
            backgroundColor: success[50],
            color: success[300],
          },
          ...focusRing(success[200]),
        },
      },
      {
        props: {color: 'success', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: success[500],
          borderColor: success[500],
          '&:hover': {
            backgroundColor: success[50],
            borderColor: success[600],
            color: success[600],
          },
          '&:active': {
            backgroundColor: success[100],
            borderColor: success[700],
            color: success[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: success[200],
            color: success[200],
          },
          ...focusRing(success[200]),
        },
      },

      // =====================
      // ERROR (Red)
      // =====================
      {
        props: {color: 'error'},
        style: {
          backgroundColor: error[500],
          color: white,
          '&:hover': {
            backgroundColor: error[600],
          },
          '&:active': {
            backgroundColor: error[700],
          },
          '&.Mui-disabled': {
            backgroundColor: error[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(error[500]),
        },
      },
      {
        props: {color: 'error', variant: 'contained'},
        style: {
          backgroundColor: error[500],
          color: white,
          '&:hover': {
            backgroundColor: error[600],
          },
          '&:active': {
            backgroundColor: error[700],
          },
          '&.Mui-disabled': {
            backgroundColor: error[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(error[500]),
        },
      },
      {
        props: {color: 'error', variant: 'soft'},
        style: {
          backgroundColor: error[50],
          color: error[600],
          '&:hover': {
            backgroundColor: error[100],
            color: error[700],
          },
          '&:active': {
            backgroundColor: error[200],
            color: error[800],
          },
          '&.Mui-disabled': {
            backgroundColor: error[50],
            color: error[300],
          },
          ...focusRing(error[200]),
        },
      },
      {
        props: {color: 'error', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: error[500],
          borderColor: error[500],
          '&:hover': {
            backgroundColor: error[50],
            borderColor: error[600],
            color: error[600],
          },
          '&:active': {
            backgroundColor: error[100],
            borderColor: error[700],
            color: error[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: error[200],
            color: error[200],
          },
          ...focusRing(error[200]),
        },
      },

      // =====================
      // WARNING (Yellow)
      // =====================
      {
        props: {color: 'warning'},
        style: {
          backgroundColor: warning[400],
          color: grey[900],
          '&:hover': {
            backgroundColor: warning[500],
          },
          '&:active': {
            backgroundColor: warning[600],
          },
          '&.Mui-disabled': {
            backgroundColor: warning[200],
            color: grey[400],
          },
          ...focusRing(warning[400]),
        },
      },
      {
        props: {color: 'warning', variant: 'contained'},
        style: {
          backgroundColor: warning[400],
          color: grey[900],
          '&:hover': {
            backgroundColor: warning[500],
          },
          '&:active': {
            backgroundColor: warning[600],
          },
          '&.Mui-disabled': {
            backgroundColor: warning[200],
            color: grey[400],
          },
          ...focusRing(warning[400]),
        },
      },
      {
        props: {color: 'warning', variant: 'soft'},
        style: {
          backgroundColor: warning[50],
          color: warning[700],
          '&:hover': {
            backgroundColor: warning[100],
            color: warning[800],
          },
          '&:active': {
            backgroundColor: warning[200],
            color: warning[900],
          },
          '&.Mui-disabled': {
            backgroundColor: warning[50],
            color: warning[300],
          },
          ...focusRing(warning[200]),
        },
      },
      {
        props: {color: 'warning', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: warning[600],
          borderColor: warning[400],
          '&:hover': {
            backgroundColor: warning[50],
            borderColor: warning[500],
            color: warning[700],
          },
          '&:active': {
            backgroundColor: warning[100],
            borderColor: warning[600],
            color: warning[800],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: warning[200],
            color: warning[200],
          },
          ...focusRing(warning[200]),
        },
      },

      // =====================
      // INFO (Teal)
      // =====================
      {
        props: {color: 'info'},
        style: {
          backgroundColor: info[500],
          color: white,
          '&:hover': {
            backgroundColor: info[600],
          },
          '&:active': {
            backgroundColor: info[700],
          },
          '&.Mui-disabled': {
            backgroundColor: info[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(info[500]),
        },
      },
      {
        props: {color: 'info', variant: 'contained'},
        style: {
          backgroundColor: info[500],
          color: white,
          '&:hover': {
            backgroundColor: info[600],
          },
          '&:active': {
            backgroundColor: info[700],
          },
          '&.Mui-disabled': {
            backgroundColor: info[200],
            color: white,
            opacity: 0.7,
          },
          ...focusRing(info[500]),
        },
      },
      {
        props: {color: 'info', variant: 'soft'},
        style: {
          backgroundColor: info[50],
          color: info[600],
          '&:hover': {
            backgroundColor: info[100],
            color: info[700],
          },
          '&:active': {
            backgroundColor: info[200],
            color: info[800],
          },
          '&.Mui-disabled': {
            backgroundColor: info[50],
            color: info[300],
          },
          ...focusRing(info[200]),
        },
      },
      {
        props: {color: 'info', variant: 'outlined'},
        style: {
          backgroundColor: 'transparent',
          color: info[500],
          borderColor: info[500],
          '&:hover': {
            backgroundColor: info[50],
            borderColor: info[600],
            color: info[600],
          },
          '&:active': {
            backgroundColor: info[100],
            borderColor: info[700],
            color: info[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: info[200],
            color: info[200],
          },
          ...focusRing(info[200]),
        },
      },
    ],
  }
}