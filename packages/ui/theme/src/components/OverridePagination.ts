import type {Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverridePagination(theme: Theme): Components['MuiPagination'] {
  const {grey, common} = theme.palette
  const white = common.white
  const typographyVariants = theme.typography
  return {
    styleOverrides: {
      root: {
        fontSize: '14px',
        lineHeight: '20px',
        '.MuiPagination-ul': {
          flexDirection: 'row',
          gap: '6px',
        },
        '.MuiPaginationItem-root.Mui-selected': {
          backgroundColor: `${grey[700]} !important`,
          color: `${white} !important`,
          minWidth: '26px !important',
          height: '26px !important',
          justifyContent: 'center !important',
          alignItems: 'center !important',
          borderRadius: '4px !important',
          border: '1px solid !important',
          borderColor: `${grey[700]} !important`,
          padding: '2px !important',
        },
        '.MuiPaginationItem-root:not(.Mui-selected ):not(.MuiPaginationItem-ellipsis):not(.MuiPaginationItem-previousNext)':
          {
            backgroundColor: `${white} !important`,
            color: `${grey[700]} !important`,
            minWidth: '26px !important',
            height: '26px !important',
            border: `1px solid ${grey[100]} !important`,
            borderRadius: '4px !important',
            padding: '2px !important',
            '&:hover': {
              backgroundColor: `${grey[700]} !important`,
              color: `${white} !important`,
              borderColor: `${grey[700]} !important`,
            },
          },
        '.MuiPaginationItem-previousNext': {
          minWidth: '26px !important',
          height: '26px !important',
          borderRadius: '4px !important',
          '&:hover': {
            backgroundColor: `${grey[700]} !important`,
            color: `${white} !important`,
            borderColor: `${grey[700]} !important`,
          },
        },
        '.MuiPaginationItem-root.MuiPaginationItem-ellipsis.MuiPaginationItem-circular': {
          padding: '0px 3px !important',
          minWidth: '26px !important',
          height: '26px !important',
          textAlign: 'center',
          lineHeight: 1,
          color: `${grey[500]} !important`,
        },

        '.MuiTablePagination-selectLabel': {
          ...typographyVariants.textSm,
        },
        '.MuiTablePagination-select': {
          ...typographyVariants.textSm,
        },
        '.MuiTablePagination-displayedRows': {
          ...typographyVariants.textSm,
        },
      },
    },
  }
}
