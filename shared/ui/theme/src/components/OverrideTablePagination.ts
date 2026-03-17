import type {Theme} from '@mui/material'
import {Button} from '@mui/material'
import type {Components} from '@mui/material/styles'
import {
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from '@remixicon/react'

export function OverrideTablePagination(theme: Theme): Components['MuiTablePagination'] {
  const {grey} = theme.palette
  const typographyVariants = theme.typography
  return {
    defaultProps: {
      slots: {
        actions: {
          firstButton: Button,
          lastButton: Button,
          nextButton: Button,
          previousButton: Button,
        },
      },
      slotProps: {
        actions: {
          firstButtonIcon: {
            component: RiArrowLeftDoubleLine,
          },
          lastButtonIcon: {
            component: RiArrowRightDoubleLine,
          },
          nextButtonIcon: {
            component: RiArrowRightSLine,
          },
          previousButtonIcon: {
            component: RiArrowLeftSLine,
          },

          firstButton: {
            size: 'small',
          },
          lastButton: {
            size: 'small',
          },
          nextButton: {
            size: 'small',
          },
          previousButton: {
            size: 'small',
          },
        },
      },
    },
    styleOverrides: {
      root: {
        fontSize: '14px',
        lineHeight: '20px',
        '.MuiTablePagination-selectLabel': {
          ...typographyVariants.textSm,
        },
        '.MuiTablePagination-select': {
          ...typographyVariants.textSm,
        },
        '.MuiTablePagination-displayedRows': {
          ...typographyVariants.textSm,
        },
        '.MuiTablePagination-actions': {
          display: 'none',
        },
      },
      menuItem: {
        ...typographyVariants.textSm,
      },
      actions: {
        '.MuiButtonBase-root': {},
      },
      selectIcon: {
        top: 'calc(50% - 11px)',
        left: 'calc(50% + 2px)',
        width: '24px',
        height: '24px',
        position: 'absolute',
        color: `${grey[700]} !important`,
      },
    },
  }
}
