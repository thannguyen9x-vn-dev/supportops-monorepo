import type {Components} from '@mui/material/styles'
import {RiExpandUpDownLine} from '@remixicon/react'

export function OverrideAutocomplete(): Components['MuiAutocomplete'] {
  return {
    defaultProps: {
      popupIcon: <RiExpandUpDownLine />,
    },
    styleOverrides: {
      popper: {
        boxShadow:
          '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08);',
      },
      listbox: {
        padding: 0,
        '.MuiAutocomplete-option': {
          paddingTop: '4px',
          paddingBottom: '4px',
          background: '#FFF',
        },
      },
      root: {
        '.MuiOutlinedInput-root': {
          padding: '0',
          minHeight: '40px',

          '.MuiAutocomplete-input': {
            padding: '8px 12px',
          },
          '&.MuiInputBase-sizeSmall': {
            paddingTop: '0',
            paddingBottom: '0',
            paddingLeft: '0',
            minHeight: '32px',
            '.MuiAutocomplete-input': {
              padding: '8px 12px',
            },
          },
          '.MuiChip-root.MuiAutocomplete-tag': {
            height: '24px',
          },
        },
      },
      paper: {
        fontSize: '16px',
        lineHeight: '24px',
      },
    },
  }
}
