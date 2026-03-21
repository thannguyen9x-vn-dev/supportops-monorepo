import React from 'react'
import type {Components, Theme} from '@mui/material/styles'
import {RiCloseLine} from '@remixicon/react'

export function OverrideChip(theme: Theme): Components['MuiChip'] {
  const {grey, primary, success, error, warning, info, common} = theme.palette
  const white = common.white

  return {
    defaultProps: {
      deleteIcon: <RiCloseLine size={16} />,
      variant: 'filled',
      size: 'medium',
      color: 'primary',
    },

    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: 6,
        '& .MuiChip-deleteIcon': {
          fontSize: 16,
          margin: 0,
          marginLeft: 4,
        },
        '& .MuiChip-icon': {
          marginLeft: 0,
          marginRight: 4,
        },
      },
      sizeSmall: {
        height: 20,
        fontSize: 12,
        lineHeight: '16px',
        padding: '2px 8px',
        '& .MuiChip-label': {
          padding: 0,
        },
        '& .MuiChip-icon': {
          fontSize: 14,
          width: 14,
          height: 14,
        },
        '& .MuiChip-deleteIcon': {
          fontSize: 14,
          width: 14,
          height: 14,
          marginLeft: 4,
        },
      },
      sizeMedium: {
        height: 24,
        fontSize: 13,
        lineHeight: '18px',
        padding: '3px 10px',
        '& .MuiChip-label': {
          padding: 0,
        },
        '& .MuiChip-icon': {
          fontSize: 16,
          width: 16,
          height: 16,
        },
        '& .MuiChip-deleteIcon': {
          fontSize: 16,
          width: 16,
          height: 16,
          marginLeft: 4,
        },
      },
      label: {
        padding: 0,
      },
    },

    variants: [
      // =====================
      // PRIMARY
      // =====================
      {
        props: {variant: 'filled', color: 'primary'},
        style: {
          backgroundColor: primary[500],
          color: white,
          '&:hover': {backgroundColor: primary[600]},
          '&:active': {backgroundColor: primary[700]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: white,
            opacity: 0.8,
            '&:hover': {
              color: white,
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'primary'},
        style: {
          backgroundColor: primary[50],
          color: primary[700],
          '&:hover': {backgroundColor: primary[100]},
          '&:active': {backgroundColor: primary[200], color: primary[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: primary[700],
            opacity: 0.7,
            '&:hover': {
              color: primary[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'primary'},
        style: {
          backgroundColor: 'transparent',
          borderColor: primary[300],
          color: primary[600],
          '&:hover': {
            backgroundColor: primary[50],
            borderColor: primary[400],
          },
          '&:active': {
            backgroundColor: primary[100],
            borderColor: primary[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: primary[600],
            opacity: 0.7,
            '&:hover': {
              color: primary[700],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'primary'},
        style: {
          backgroundColor: 'transparent',
          color: primary[600],
          '&:hover': {backgroundColor: primary[50]},
          '&:active': {backgroundColor: primary[100]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: primary[600],
            opacity: 0.7,
            '&:hover': {
              color: primary[700],
              opacity: 1,
            },
          },
        },
      },

      // =====================
      // SECONDARY / NEUTRAL
      // =====================
      {
        props: {variant: 'filled', color: 'secondary'},
        style: {
          backgroundColor: grey[700],
          color: white,
          '&:hover': {backgroundColor: grey[800]},
          '&:active': {backgroundColor: grey[900]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: white,
            opacity: 0.8,
            '&:hover': {
              color: white,
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'secondary'},
        style: {
          backgroundColor: grey[100],
          color: grey[700],
          '&:hover': {backgroundColor: grey[200]},
          '&:active': {backgroundColor: grey[300], color: grey[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[700],
            opacity: 0.7,
            '&:hover': {
              color: grey[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'secondary'},
        style: {
          backgroundColor: 'transparent',
          borderColor: grey[300],
          color: grey[700],
          '&:hover': {
            backgroundColor: grey[50],
            borderColor: grey[400],
          },
          '&:active': {
            backgroundColor: grey[100],
            borderColor: grey[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[700],
            opacity: 0.7,
            '&:hover': {
              color: grey[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'secondary'},
        style: {
          backgroundColor: 'transparent',
          color: grey[700],
          '&:hover': {backgroundColor: grey[100]},
          '&:active': {backgroundColor: grey[200]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[700],
            opacity: 0.7,
            '&:hover': {
              color: grey[800],
              opacity: 1,
            },
          },
        },
      },

      // =====================
      // NEUTRAL (Alternative)
      // =====================
      {
        props: {variant: 'filled', color: 'neutral'},
        style: {
          backgroundColor: grey[700],
          color: white,
          '&:hover': {backgroundColor: grey[800]},
          '&:active': {backgroundColor: grey[900]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: white,
            opacity: 0.8,
            '&:hover': {
              color: white,
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'neutral'},
        style: {
          backgroundColor: grey[100],
          color: grey[700],
          '&:hover': {backgroundColor: grey[200]},
          '&:active': {backgroundColor: grey[300], color: grey[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[700],
            opacity: 0.7,
            '&:hover': {
              color: grey[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'neutral'},
        style: {
          backgroundColor: 'transparent',
          borderColor: grey[300],
          color: grey[700],
          '&:hover': {
            backgroundColor: grey[50],
            borderColor: grey[400],
          },
          '&:active': {
            backgroundColor: grey[100],
            borderColor: grey[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[700],
            opacity: 0.7,
            '&:hover': {
              color: grey[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'neutral'},
        style: {
          backgroundColor: 'transparent',
          color: grey[700],
          '&:hover': {backgroundColor: grey[100]},
          '&:active': {backgroundColor: grey[200]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[700],
            opacity: 0.7,
            '&:hover': {
              color: grey[800],
              opacity: 1,
            },
          },
        },
      },

      // =====================
      // SUCCESS
      // =====================
      {
        props: {variant: 'filled', color: 'success'},
        style: {
          backgroundColor: success[500],
          color: white,
          '&:hover': {backgroundColor: success[600]},
          '&:active': {backgroundColor: success[700]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: white,
            opacity: 0.8,
            '&:hover': {
              color: white,
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'success'},
        style: {
          backgroundColor: success[50],
          color: success[700],
          '&:hover': {backgroundColor: success[100]},
          '&:active': {backgroundColor: success[200], color: success[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: success[700],
            opacity: 0.7,
            '&:hover': {
              color: success[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'success'},
        style: {
          backgroundColor: 'transparent',
          borderColor: success[300],
          color: success[600],
          '&:hover': {
            backgroundColor: success[50],
            borderColor: success[400],
          },
          '&:active': {
            backgroundColor: success[100],
            borderColor: success[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: success[600],
            opacity: 0.7,
            '&:hover': {
              color: success[700],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'success'},
        style: {
          backgroundColor: 'transparent',
          color: success[600],
          '&:hover': {backgroundColor: success[50]},
          '&:active': {backgroundColor: success[100]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: success[600],
            opacity: 0.7,
            '&:hover': {
              color: success[700],
              opacity: 1,
            },
          },
        },
      },

      // =====================
      // ERROR
      // =====================
      {
        props: {variant: 'filled', color: 'error'},
        style: {
          backgroundColor: error[500],
          color: white,
          '&:hover': {backgroundColor: error[600]},
          '&:active': {backgroundColor: error[700]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: white,
            opacity: 0.8,
            '&:hover': {
              color: white,
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'error'},
        style: {
          backgroundColor: error[50],
          color: error[700],
          '&:hover': {backgroundColor: error[100]},
          '&:active': {backgroundColor: error[200], color: error[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: error[700],
            opacity: 0.7,
            '&:hover': {
              color: error[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'error'},
        style: {
          backgroundColor: 'transparent',
          borderColor: error[300],
          color: error[600],
          '&:hover': {
            backgroundColor: error[50],
            borderColor: error[400],
          },
          '&:active': {
            backgroundColor: error[100],
            borderColor: error[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: error[600],
            opacity: 0.7,
            '&:hover': {
              color: error[700],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'error'},
        style: {
          backgroundColor: 'transparent',
          color: error[600],
          '&:hover': {backgroundColor: error[50]},
          '&:active': {backgroundColor: error[100]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: error[600],
            opacity: 0.7,
            '&:hover': {
              color: error[700],
              opacity: 1,
            },
          },
        },
      },

      // =====================
      // WARNING
      // =====================
      {
        props: {variant: 'filled', color: 'warning'},
        style: {
          backgroundColor: warning[400],
          color: grey[900],
          '&:hover': {backgroundColor: warning[500]},
          '&:active': {backgroundColor: warning[600]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: grey[900],
            opacity: 0.7,
            '&:hover': {
              color: grey[900],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'warning'},
        style: {
          backgroundColor: warning[50],
          color: warning[700],
          '&:hover': {backgroundColor: warning[100]},
          '&:active': {backgroundColor: warning[200], color: warning[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: warning[700],
            opacity: 0.7,
            '&:hover': {
              color: warning[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'warning'},
        style: {
          backgroundColor: 'transparent',
          borderColor: warning[300],
          color: warning[600],
          '&:hover': {
            backgroundColor: warning[50],
            borderColor: warning[400],
          },
          '&:active': {
            backgroundColor: warning[100],
            borderColor: warning[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: warning[600],
            opacity: 0.7,
            '&:hover': {
              color: warning[700],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'warning'},
        style: {
          backgroundColor: 'transparent',
          color: warning[600],
          '&:hover': {backgroundColor: warning[50]},
          '&:active': {backgroundColor: warning[100]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: warning[600],
            opacity: 0.7,
            '&:hover': {
              color: warning[700],
              opacity: 1,
            },
          },
        },
      },

      // =====================
      // INFO
      // =====================
      {
        props: {variant: 'filled', color: 'info'},
        style: {
          backgroundColor: info[500],
          color: white,
          '&:hover': {backgroundColor: info[600]},
          '&:active': {backgroundColor: info[700]},
          '&.Mui-disabled': {
            backgroundColor: grey[100],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: white,
            opacity: 0.8,
            '&:hover': {
              color: white,
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'soft', color: 'info'},
        style: {
          backgroundColor: info[50],
          color: info[700],
          '&:hover': {backgroundColor: info[100]},
          '&:active': {backgroundColor: info[200], color: info[800]},
          '&.Mui-disabled': {
            backgroundColor: grey[50],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: info[700],
            opacity: 0.7,
            '&:hover': {
              color: info[800],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'outlined', color: 'info'},
        style: {
          backgroundColor: 'transparent',
          borderColor: info[300],
          color: info[600],
          '&:hover': {
            backgroundColor: info[50],
            borderColor: info[400],
          },
          '&:active': {
            backgroundColor: info[100],
            borderColor: info[500],
          },
          '&.Mui-disabled': {
            borderColor: grey[200],
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: info[600],
            opacity: 0.7,
            '&:hover': {
              color: info[700],
              opacity: 1,
            },
          },
        },
      },
      {
        props: {variant: 'text', color: 'info'},
        style: {
          backgroundColor: 'transparent',
          color: info[600],
          '&:hover': {backgroundColor: info[50]},
          '&:active': {backgroundColor: info[100]},
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: grey[400],
          },
          '& .MuiChip-deleteIcon': {
            color: info[600],
            opacity: 0.7,
            '&:hover': {
              color: info[700],
              opacity: 1,
            },
          },
        },
      },
    ],
  }
}