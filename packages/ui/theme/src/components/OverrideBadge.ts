import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideBadge(theme: Theme): Components['MuiBadge'] {
  const {primary, grey, success, error, warning, info} = theme.palette
  return {
    defaultProps: {
      variant: 'standard',
      color: 'error',
    },

    styleOverrides: {
      badge: {
        padding: '0px 3px',
        fontSize: '8px',
        lineHeight: '12px',
        height: '12px',
        fontWeight: 500,
      },
    },

    variants: [
      {
        props: {variant: 'standard', color: 'primary'},
        style: {
          color: primary['contrastText'],
        },
      },
      {
        props: {variant: 'standard', color: 'grey'},
        style: {
          color: grey['contrastText'],
        },
      },
      {
        props: {variant: 'standard', color: 'success'},
        style: {
          color: success['contrastText'],
        },
      },
      {
        props: {variant: 'standard', color: 'error'},
        style: {
          color: error['contrastText'],
        },
      },
      {
        props: {variant: 'standard', color: 'warning'},
        style: {
          color: warning['contrastText'],
        },
      },
      {
        props: {variant: 'standard', color: 'info'},
        style: {
          color: info['contrastText'],
        },
      },
    ],
  }
}
