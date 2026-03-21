
import type {TypographyVariantsOptions} from '@mui/material'
import { typographyConstant } from '../constant/typographyConstant'


export function getTypographyVariantOptions(): TypographyVariantsOptions {
  return {
    htmlFontSize: 16,
    fontSize: 16,
    allVariants: {
      fontSize: '16px',
      lineHeight: '24px',
    },

    fontFamily:
      'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Cantarell,Helvetica Neue,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    ...typographyConstant,
    button: {
      textTransform: 'none',
    },
  }
}
