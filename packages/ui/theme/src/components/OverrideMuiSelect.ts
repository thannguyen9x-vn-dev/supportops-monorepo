import type {Components} from '@mui/material/styles'
import {RiArrowDownSLine} from '@remixicon/react'

export function OverrideMuiSelect(): Components['MuiSelect'] {
  return {
    defaultProps: {
      IconComponent: RiArrowDownSLine,
    },
  }
}
