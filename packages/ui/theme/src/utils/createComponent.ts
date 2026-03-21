import type {Theme, ThemeOptions} from '@mui/material/styles'
import {OverrideAutocomplete} from '../components/OverrideAutocomplete'
import {OverrideBadge} from '../components/OverrideBadge'
import {OverrideBreadcrumbs} from '../components/OverrideBreadcrumbs'
import {OverrideButton} from '../components/OverrideButton'
import {OverrideCardContent} from '../components/OverrideCardContent'
import {OverrideCheckbox} from '../components/OverrideCheckbox'
import {OverrideChip} from '../components/OverrideChip'
import {OverrideFormControlLabel} from '../components/OverrideFormControlLabel'
import {OverrideFormHelperText} from '../components/OverrideFormHelperText'
import {OverrideFormLabel} from '../components/OverrideFormLabel'
import {OverrideIconButton} from '../components/OverrideIconButton'
import {OverrideInputLabel} from '../components/OverrideInputLabel'
import {OverrideLinearProgress} from '../components/OverrideLinearProgress'
import {OverrideLink} from '../components/OverrideLink'
import {OverrideListItemIcon} from '../components/OverrideListItemIcon'
import {OverrideMenuItem} from '../components/OverrideMenuItem'
import {OverrideMuiSelect} from '../components/OverrideMuiSelect'
import {OverrideOutlinedInput} from '../components/OverrideOutlinedInput'
import {OverridePagination} from '../components/OverridePagination'
import {OverridePaper} from '../components/OverridePaper'
import {OverrideRadio} from '../components/OverrideRadio'
import {OverrideStepper} from '../components/OverrideStepper'
import {OverrideSwitch} from '../components/OverrideSwitch'
import {OverrideTab} from '../components/OverrideTab'
import {OverrideTableCell} from '../components/OverrideTableCell'
import {OverrideTableHead} from '../components/OverrideTableHead'
import {OverrideTablePagination} from '../components/OverrideTablePagination'
import {OverrideTableRow} from '../components/OverrideTableRow'
import {OverrideTabs} from '../components/OverrideTabs'
import {OverrideTextField} from '../components/OverrideTextField'

export function createComponents(theme: Theme): ThemeOptions['components'] {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontWeight: 500,
        },
      },
    },
    MuiButton: OverrideButton(theme),
    MuiAutocomplete: OverrideAutocomplete(),
    MuiBreadcrumbs: OverrideBreadcrumbs(),
    MuiBadge: OverrideBadge(theme),
    MuiCardContent: OverrideCardContent(),
    MuiCheckbox: OverrideCheckbox(theme),
    MuiChip: OverrideChip(theme),
    MuiFormControlLabel: OverrideFormControlLabel(theme),
    MuiFormHelperText: OverrideFormHelperText(theme),
    MuiIconButton: OverrideIconButton(theme),
    MuiFormLabel: OverrideFormLabel(theme),
    MuiInputLabel: OverrideInputLabel(theme),
    MuiLinearProgress: OverrideLinearProgress(theme),
    MuiLink: OverrideLink(),
    MuiListItemIcon: OverrideListItemIcon(),
    MuiMenuItem: OverrideMenuItem(),
    MuiSelect: OverrideMuiSelect(),
    MuiOutlinedInput: OverrideOutlinedInput(theme),
    MuiPagination: OverridePagination(theme),
    MuiPaper: OverridePaper(),
    MuiRadio: OverrideRadio(theme),
    MuiStep: OverrideStepper(),
    MuiSwitch: OverrideSwitch(theme),
    MuiTab: OverrideTab(theme),
    MuiTableCell: OverrideTableCell(theme),
    MuiTableHead: OverrideTableHead(theme),
    MuiTablePagination: OverrideTablePagination(theme),
    MuiTableRow: OverrideTableRow(theme),
    MuiTabs: OverrideTabs(theme),
    MuiTextField: OverrideTextField(),
  }
}
