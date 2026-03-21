import type {CSSObject, Theme} from '@mui/material'
import type {Components} from '@mui/material/styles'

export function OverrideOutlinedInput(theme: Theme): Components['MuiOutlinedInput'] {
  function baseInputStyle(): CSSObject {
    const {textSm: fontStyleBodySm} = theme.typography
    const {text, error, primary, background, divider, action} = theme.palette
    const varsPalette = theme.vars?.palette
    const {sm: radiusSm} = theme.radius
    const textPrimary = varsPalette?.text.primary ?? text.primary
    const textSecondary = varsPalette?.text.secondary ?? text.secondary
    const errorMain = varsPalette?.error.main ?? error.main
    const primaryMain = varsPalette?.primary.main ?? primary.main
    const inputBackgroundColor = varsPalette?.background.paper ?? background.paper
    const dividerColor = varsPalette?.divider ?? divider
    const actionHover = varsPalette?.action.hover ?? action.hover
    const focusPrimaryRing = '0px 0px 0px 4px rgba(var(--mui-palette-primary-mainChannel) / 0.2)'
    const focusErrorRing = '0px 0px 0px 4px rgba(var(--mui-palette-error-mainChannel) / 0.2)'

    return {
      ...fontStyleBodySm,
      fontWeight: 500,
      color: textPrimary,
      ':not(.Mui-error):not(.Mui-readOnly):hover, &.Mui-focused': {
        input: {
          '&::placeholder': {
            color: textPrimary,
          },
        },
        textarea: {
          '&::placeholder': {
            color: textPrimary,
          },
        },
        fieldset: {
          borderColor: `${dividerColor}`,
        },
      },
      input: {
        backgroundColor: inputBackgroundColor,
        borderRadius: radiusSm,
        padding: '10px 16px',
        '&::placeholder': {
          ...fontStyleBodySm,
          color: textSecondary,
          opacity: 1,
        },
      },
      textarea: {
        backgroundColor: inputBackgroundColor,
        borderRadius: radiusSm,
        padding: '10px 16px',
        '&::placeholder': {
          ...fontStyleBodySm,
          color: textSecondary,
          opacity: 1,
        },
      },
      fieldset: {
        border: '1px solid',
        borderColor: dividerColor,
        borderRadius: radiusSm,
      },
      '&.Mui-error': {
        fieldset: {
          borderColor: `${errorMain}`,
        },
        svg: {
          color: `${errorMain}`,
        },
      },
      '&.Mui-focused.Mui-error': {
        fieldset: {
          borderColor: `${errorMain}`,
          borderWidth: '1px ',
          boxShadow: focusErrorRing,
        },
        svg: {
          color: `${errorMain}`,
        },
      },

      '&.Mui-focused:not(.Mui-readOnly) input[aria-invalid="false"] ~ fieldset': {
        borderColor: `${primaryMain}`,
        borderWidth: '1px',
        boxShadow: focusPrimaryRing,
      },
      '&.Mui-focused:not(.Mui-readOnly) textarea[aria-invalid="false"] ~ fieldset': {
        borderColor: `${primaryMain}`,
        borderWidth: '1px ',
        boxShadow: focusPrimaryRing,
      },

      '&.Mui-readOnly, &.Mui-readOnly.Mui-focused': {
        backgroundColor: actionHover,
        input: {
          backgroundColor: actionHover,
        },
        textarea: {
          backgroundColor: actionHover,
        },
        fieldset: {
          borderColor: `${dividerColor}`,
          borderWidth: '1px',
        },
      },
    }
  }

  function textAreaStyle(): CSSObject {
    return {
      '&.MuiInputBase-multiline': {
        padding: 0,
      },
    }
  }

  return {
    styleOverrides: {
      root: {
        ...baseInputStyle(),
        ...textAreaStyle(),
      },
    },
  }
}
