import {alpha} from '@mui/material'
import type {Components, Theme} from '@mui/material/styles'
import { baseButtonStyles } from '../styles/baseButtonStyles'


const iconStyle = {
  '&>*:nth-of-type(1)': {fontSize: 'inherit'},
}

const focusRing = (color: string) => ({
  '&::after': {
    boxShadow: `0 0 0 4px ${alpha(color, 0.25)}`,
  },
  '&:active::after': {
    boxShadow: 'none',
  },
  '&:focus-visible': {
    outline: `2px solid ${color}`,
    outlineOffset: 2,
  },
})

export function OverrideButton(theme: Theme): Components['MuiButton'] {
  const {primary, grey, common, success, error, warning, info} = theme.palette
  const white = common.white

  return {
    defaultProps: {
      disableElevation: true,
      size: 'medium',
      variant: 'contained',
      color: 'primary',
    },

    styleOverrides: {
      root: baseButtonStyles(theme),
      startIcon: iconStyle,
      endIcon: iconStyle,
    },

    variants: [
      // =====================
      // SIZES
      // =====================
      {
        props: {size: 'xs'},
        style: {
          height: 28,
          minHeight: 28,
          padding: '4px 12px',
          fontSize: 12,
          lineHeight: '20px',
          borderRadius: 6,
          '& .MuiButton-startIcon': {
            marginRight: 4,
            '&>*:nth-of-type(1)': {fontSize: 14},
          },
          '& .MuiButton-endIcon': {
            marginLeft: 4,
            '&>*:nth-of-type(1)': {fontSize: 14},
          },
        },
      },
      {
        props: {size: 'small'},
        style: {
          height: 32,
          minHeight: 32,
          padding: '6px 14px',
          fontSize: 13,
          lineHeight: '20px',
          borderRadius: 6,
          '& .MuiButton-startIcon': {
            marginRight: 6,
            '&>*:nth-of-type(1)': {fontSize: 16},
          },
          '& .MuiButton-endIcon': {
            marginLeft: 6,
            '&>*:nth-of-type(1)': {fontSize: 16},
          },
        },
      },
      {
        props: {size: 'medium'},
        style: {
          height: 40,
          minHeight: 40,
          padding: '10px 16px',
          fontSize: 14,
          lineHeight: '20px',
          borderRadius: 8,
          '& .MuiButton-startIcon': {
            marginRight: 8,
            '&>*:nth-of-type(1)': {fontSize: 18},
          },
          '& .MuiButton-endIcon': {
            marginLeft: 8,
            '&>*:nth-of-type(1)': {fontSize: 18},
          },
        },
      },
      {
        props: {size: 'large'},
        style: {
          height: 48,
          minHeight: 48,
          padding: '12px 20px',
          fontSize: 16,
          lineHeight: '24px',
          borderRadius: 10,
          '& .MuiButton-startIcon': {
            marginRight: 8,
            '&>*:nth-of-type(1)': {fontSize: 20},
          },
          '& .MuiButton-endIcon': {
            marginLeft: 8,
            '&>*:nth-of-type(1)': {fontSize: 20},
          },
        },
      },
      {
        props: {size: 'xl'},
        style: {
          height: 56,
          minHeight: 56,
          padding: '14px 24px',
          fontSize: 18,
          lineHeight: '28px',
          borderRadius: 12,
          '& .MuiButton-startIcon': {
            marginRight: 10,
            '&>*:nth-of-type(1)': {fontSize: 22},
          },
          '& .MuiButton-endIcon': {
            marginLeft: 10,
            '&>*:nth-of-type(1)': {fontSize: 22},
          },
        },
      },

      // =====================
      // PRIMARY (Blue)
      // =====================
      {
        props: {variant: 'contained', color: 'primary'},
        style: {
          backgroundColor: primary[500],
          color: white,
          '&:hover': {
            backgroundColor: primary[600],
          },
          '&:active': {
            backgroundColor: primary[700],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'primary'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'primary'},
        style: {
          backgroundColor: 'transparent',
          color: primary[500],
          borderColor: primary[500],
          borderWidth: 1,
          borderStyle: 'solid',
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
          '&.active': {
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
      {
        props: {variant: 'text', color: 'primary'},
        style: {
          backgroundColor: 'transparent',
          color: primary[500],
          '&:hover': {
            backgroundColor: primary[50],
            color: primary[600],
          },
          '&:active': {
            backgroundColor: primary[100],
            color: primary[700],
          },
          '&.active': {
            backgroundColor: primary[100],
            color: primary[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: primary[200],
          },
          ...focusRing(primary[100]),
        },
      },

      // =====================
      // SECONDARY / NEUTRAL (Grey)
      // =====================
      {
        props: {variant: 'contained', color: 'secondary'},
        style: {
          backgroundColor: grey[700],
          color: white,
          '&:hover': {
            backgroundColor: grey[800],
          },
          '&:active': {
            backgroundColor: grey[900],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'secondary'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'secondary'},
        style: {
          backgroundColor: 'transparent',
          color: grey[600],
          borderColor: grey[300],
          borderWidth: 1,
          borderStyle: 'solid',
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
          '&.active': {
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
      {
        props: {variant: 'text', color: 'secondary'},
        style: {
          backgroundColor: 'transparent',
          color: grey[600],
          '&:hover': {
            backgroundColor: grey[100],
            color: grey[700],
          },
          '&:active': {
            backgroundColor: grey[200],
            color: grey[800],
          },
          '&.active': {
            backgroundColor: grey[200],
            color: grey[800],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[300],
          },
          ...focusRing(grey[100]),
        },
      },

      // =====================
      // SUCCESS (Green)
      // =====================
      {
        props: {variant: 'contained', color: 'success'},
        style: {
          backgroundColor: success[500],
          color: white,
          '&:hover': {
            backgroundColor: success[600],
          },
          '&:active': {
            backgroundColor: success[700],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'success'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'success'},
        style: {
          backgroundColor: 'transparent',
          color: success[500],
          borderColor: success[500],
          borderWidth: 1,
          borderStyle: 'solid',
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
          '&.active': {
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
      {
        props: {variant: 'text', color: 'success'},
        style: {
          backgroundColor: 'transparent',
          color: success[500],
          '&:hover': {
            backgroundColor: success[50],
            color: success[600],
          },
          '&:active': {
            backgroundColor: success[100],
            color: success[700],
          },
          '&.active': {
            backgroundColor: success[100],
            color: success[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: success[200],
          },
          ...focusRing(success[100]),
        },
      },

      // =====================
      // ERROR (Red)
      // =====================
      {
        props: {variant: 'contained', color: 'error'},
        style: {
          backgroundColor: error[500],
          color: white,
          '&:hover': {
            backgroundColor: error[600],
          },
          '&:active': {
            backgroundColor: error[700],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'error'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'error'},
        style: {
          backgroundColor: 'transparent',
          color: error[500],
          borderColor: error[500],
          borderWidth: 1,
          borderStyle: 'solid',
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
          '&.active': {
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
      {
        props: {variant: 'text', color: 'error'},
        style: {
          backgroundColor: 'transparent',
          color: error[500],
          '&:hover': {
            backgroundColor: error[50],
            color: error[600],
          },
          '&:active': {
            backgroundColor: error[100],
            color: error[700],
          },
          '&.active': {
            backgroundColor: error[100],
            color: error[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: error[200],
          },
          ...focusRing(error[100]),
        },
      },

      // =====================
      // WARNING (Yellow/Orange)
      // =====================
      {
        props: {variant: 'contained', color: 'warning'},
        style: {
          backgroundColor: warning[400],
          color: grey[900],
          '&:hover': {
            backgroundColor: warning[500],
          },
          '&:active': {
            backgroundColor: warning[600],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'warning'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'warning'},
        style: {
          backgroundColor: 'transparent',
          color: warning[600],
          borderColor: warning[400],
          borderWidth: 1,
          borderStyle: 'solid',
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
          '&.active': {
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
      {
        props: {variant: 'text', color: 'warning'},
        style: {
          backgroundColor: 'transparent',
          color: warning[600],
          '&:hover': {
            backgroundColor: warning[50],
            color: warning[700],
          },
          '&:active': {
            backgroundColor: warning[100],
            color: warning[800],
          },
          '&.active': {
            backgroundColor: warning[100],
            color: warning[800],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: warning[200],
          },
          ...focusRing(warning[100]),
        },
      },

      // =====================
      // INFO (Teal)
      // =====================
      {
        props: {variant: 'contained', color: 'info'},
        style: {
          backgroundColor: info[500],
          color: white,
          '&:hover': {
            backgroundColor: info[600],
          },
          '&:active': {
            backgroundColor: info[700],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'info'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'info'},
        style: {
          backgroundColor: 'transparent',
          color: info[500],
          borderColor: info[500],
          borderWidth: 1,
          borderStyle: 'solid',
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
          '&.active': {
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
      {
        props: {variant: 'text', color: 'info'},
        style: {
          backgroundColor: 'transparent',
          color: info[500],
          '&:hover': {
            backgroundColor: info[50],
            color: info[600],
          },
          '&:active': {
            backgroundColor: info[100],
            color: info[700],
          },
          '&.active': {
            backgroundColor: info[100],
            color: info[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: info[200],
          },
          ...focusRing(info[100]),
        },
      },

      // =====================
      // NEUTRAL (Grey - alternative name)
      // =====================
      {
        props: {variant: 'contained', color: 'neutral'},
        style: {
          backgroundColor: grey[700],
          color: white,
          '&:hover': {
            backgroundColor: grey[800],
          },
          '&:active': {
            backgroundColor: grey[900],
          },
          '&.active': {
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
        props: {variant: 'soft', color: 'neutral'},
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
          '&.active': {
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
        props: {variant: 'outlined', color: 'neutral'},
        style: {
          backgroundColor: 'transparent',
          color: grey[700],
          borderColor: grey[300],
          borderWidth: 1,
          borderStyle: 'solid',
          '&:hover': {
            backgroundColor: grey[50],
            borderColor: grey[400],
          },
          '&:active': {
            backgroundColor: white,
            borderColor: grey[700],
          },
          '&.active': {
            backgroundColor: white,
            borderColor: grey[700],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            borderColor: grey[200],
            color: grey[400],
          },
          ...focusRing(grey[200]),
        },
      },
      {
        props: {variant: 'text', color: 'neutral'},
        style: {
          backgroundColor: 'transparent',
          color: grey[700],
          '&:hover': {
            backgroundColor: grey[100],
          },
          '&:active': {
            backgroundColor: grey[200],
          },
          '&.active': {
            backgroundColor: grey[200],
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          ...focusRing(grey[100]),
        },
      },
    ],
  }
}