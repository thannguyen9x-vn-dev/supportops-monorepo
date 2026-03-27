import { RadiusScale } from '../constant/radius'
import '@mui/material/IconButton'
import '@mui/material/Chip'

type ColorScale = {
  25: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}


type SpacerScale = {
  0: number
  50: number
  100: number
  150: number
  200: number
  300: number
  400: number
  500: number
  600: number
  800: number
  1000: number
  1200: number
  1400: number
  1600: number
  1800: number
  2000: number
  2400: number
  4000: number
  neg100: number
  neg200: number
  neg300: number
  neg400: number
  neg600: number
}


type ShadowCustomScale = {
  none: string
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  focusPrimary100: string
  focusGray100: string
  focusError100: string
  focusSuccess100: string
}


declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string
    darker?: string
  }

  interface SimplePaletteColorOptions {
    lighter?: string
    darker?: string
  }

  interface Color {
    light?: string
    main?: string
    dark?: string
    lighter?: string
    darker?: string
    contrastText?: string
  }

  interface TypographyOptions {
    fontWeightSemibold?: number
     // Text 9XL
    text9Xl: React.CSSProperties
    text9XlThin: React.CSSProperties
    text9XlExtraLight: React.CSSProperties
    text9XlLight: React.CSSProperties
    text9XlRegular: React.CSSProperties
    text9XlMedium: React.CSSProperties
    text9XlSemiBold: React.CSSProperties
    text9XlBold: React.CSSProperties
    text9XlExtraBold: React.CSSProperties
    text9XlBlack: React.CSSProperties

    // Text 8XL
    text8Xl: React.CSSProperties
    text8XlThin: React.CSSProperties
    text8XlExtraLight: React.CSSProperties
    text8XlLight: React.CSSProperties
    text8XlRegular: React.CSSProperties
    text8XlMedium: React.CSSProperties
    text8XlSemiBold: React.CSSProperties
    text8XlBold: React.CSSProperties
    text8XlExtraBold: React.CSSProperties
    text8XlBlack: React.CSSProperties

    // Text 7XL
    text7Xl: React.CSSProperties
    text7XlThin: React.CSSProperties
    text7XlExtraLight: React.CSSProperties
    text7XlLight: React.CSSProperties
    text7XlRegular: React.CSSProperties
    text7XlMedium: React.CSSProperties
    text7XlSemiBold: React.CSSProperties
    text7XlBold: React.CSSProperties
    text7XlExtraBold: React.CSSProperties
    text7XlBlack: React.CSSProperties

    // Text 6XL
    text6Xl: React.CSSProperties
    text6XlThin: React.CSSProperties
    text6XlExtraLight: React.CSSProperties
    text6XlLight: React.CSSProperties
    text6XlRegular: React.CSSProperties
    text6XlMedium: React.CSSProperties
    text6XlSemiBold: React.CSSProperties
    text6XlBold: React.CSSProperties
    text6XlExtraBold: React.CSSProperties
    text6XlBlack: React.CSSProperties

    // Text 5XL
    text5Xl: React.CSSProperties
    text5XlThin: React.CSSProperties
    text5XlExtraLight: React.CSSProperties
    text5XlLight: React.CSSProperties
    text5XlRegular: React.CSSProperties
    text5XlMedium: React.CSSProperties
    text5XlSemiBold: React.CSSProperties
    text5XlBold: React.CSSProperties
    text5XlExtraBold: React.CSSProperties
    text5XlBlack: React.CSSProperties

    // Text 4XL
    text4Xl: React.CSSProperties
    text4XlThin: React.CSSProperties
    text4XlExtraLight: React.CSSProperties
    text4XlLight: React.CSSProperties
    text4XlRegular: React.CSSProperties
    text4XlMedium: React.CSSProperties
    text4XlSemiBold: React.CSSProperties
    text4XlBold: React.CSSProperties
    text4XlExtraBold: React.CSSProperties
    text4XlBlack: React.CSSProperties

    // Text 3XL
    text3Xl: React.CSSProperties
    text3XlThin: React.CSSProperties
    text3XlExtraLight: React.CSSProperties
    text3XlLight: React.CSSProperties
    text3XlRegular: React.CSSProperties
    text3XlMedium: React.CSSProperties
    text3XlSemiBold: React.CSSProperties
    text3XlBold: React.CSSProperties
    text3XlExtraBold: React.CSSProperties
    text3XlBlack: React.CSSProperties

    // Text 2XL
    text2Xl: React.CSSProperties
    text2XlThin: React.CSSProperties
    text2XlExtraLight: React.CSSProperties
    text2XlLight: React.CSSProperties
    text2XlRegular: React.CSSProperties
    text2XlMedium: React.CSSProperties
    text2XlSemiBold: React.CSSProperties
    text2XlBold: React.CSSProperties
    text2XlExtraBold: React.CSSProperties
    text2XlBlack: React.CSSProperties

    // Text XL
    textXl: React.CSSProperties
    textXlThin: React.CSSProperties
    textXlExtraLight: React.CSSProperties
    textXlLight: React.CSSProperties
    textXlRegular: React.CSSProperties
    textXlMedium: React.CSSProperties
    textXlSemiBold: React.CSSProperties
    textXlBold: React.CSSProperties
    textXlExtraBold: React.CSSProperties
    textXlBlack: React.CSSProperties

    // Text LG
    textLg: React.CSSProperties
    textLgThin: React.CSSProperties
    textLgExtraLight: React.CSSProperties
    textLgLight: React.CSSProperties
    textLgRegular: React.CSSProperties
    textLgMedium: React.CSSProperties
    textLgSemiBold: React.CSSProperties
    textLgBold: React.CSSProperties
    textLgExtraBold: React.CSSProperties
    textLgBlack: React.CSSProperties

    // Text Base
    textBase: React.CSSProperties
    textBaseThin: React.CSSProperties
    textBaseExtraLight: React.CSSProperties
    textBaseLight: React.CSSProperties
    textBaseRegular: React.CSSProperties
    textBaseMedium: React.CSSProperties
    textBaseSemiBold: React.CSSProperties
    textBaseBold: React.CSSProperties
    textBaseExtraBold: React.CSSProperties
    textBaseBlack: React.CSSProperties

    // Text SM
    textSm: React.CSSProperties
    textSmThin: React.CSSProperties
    textSmExtraLight: React.CSSProperties
    textSmLight: React.CSSProperties
    textSmRegular: React.CSSProperties
    textSmMedium: React.CSSProperties
    textSmSemiBold: React.CSSProperties
    textSmBold: React.CSSProperties
    textSmExtraBold: React.CSSProperties
    textSmBlack: React.CSSProperties

    // Text XS
    textXs: React.CSSProperties
    textXsThin: React.CSSProperties
    textXsExtraLight: React.CSSProperties
    textXsLight: React.CSSProperties
    textXsRegular: React.CSSProperties
    textXsMedium: React.CSSProperties
    textXsSemiBold: React.CSSProperties
    textXsBold: React.CSSProperties
    textXsExtraBold: React.CSSProperties
    textXsBlack: React.CSSProperties

    // Button
    buttonSm: React.CSSProperties
    buttonMd: React.CSSProperties
    buttonLg: React.CSSProperties
  }

  interface TypographyVariants {
    fontWeightSemibold?: number
     // Text 9XL
    text9Xl: React.CSSProperties
    text9XlThin: React.CSSProperties
    text9XlExtraLight: React.CSSProperties
    text9XlLight: React.CSSProperties
    text9XlRegular: React.CSSProperties
    text9XlMedium: React.CSSProperties
    text9XlSemiBold: React.CSSProperties
    text9XlBold: React.CSSProperties
    text9XlExtraBold: React.CSSProperties
    text9XlBlack: React.CSSProperties

    // Text 8XL
    text8Xl: React.CSSProperties
    text8XlThin: React.CSSProperties
    text8XlExtraLight: React.CSSProperties
    text8XlLight: React.CSSProperties
    text8XlRegular: React.CSSProperties
    text8XlMedium: React.CSSProperties
    text8XlSemiBold: React.CSSProperties
    text8XlBold: React.CSSProperties
    text8XlExtraBold: React.CSSProperties
    text8XlBlack: React.CSSProperties

    // Text 7XL
    text7Xl: React.CSSProperties
    text7XlThin: React.CSSProperties
    text7XlExtraLight: React.CSSProperties
    text7XlLight: React.CSSProperties
    text7XlRegular: React.CSSProperties
    text7XlMedium: React.CSSProperties
    text7XlSemiBold: React.CSSProperties
    text7XlBold: React.CSSProperties
    text7XlExtraBold: React.CSSProperties
    text7XlBlack: React.CSSProperties

    // Text 6XL
    text6Xl: React.CSSProperties
    text6XlThin: React.CSSProperties
    text6XlExtraLight: React.CSSProperties
    text6XlLight: React.CSSProperties
    text6XlRegular: React.CSSProperties
    text6XlMedium: React.CSSProperties
    text6XlSemiBold: React.CSSProperties
    text6XlBold: React.CSSProperties
    text6XlExtraBold: React.CSSProperties
    text6XlBlack: React.CSSProperties

    // Text 5XL
    text5Xl: React.CSSProperties
    text5XlThin: React.CSSProperties
    text5XlExtraLight: React.CSSProperties
    text5XlLight: React.CSSProperties
    text5XlRegular: React.CSSProperties
    text5XlMedium: React.CSSProperties
    text5XlSemiBold: React.CSSProperties
    text5XlBold: React.CSSProperties
    text5XlExtraBold: React.CSSProperties
    text5XlBlack: React.CSSProperties

    // Text 4XL
    text4Xl: React.CSSProperties
    text4XlThin: React.CSSProperties
    text4XlExtraLight: React.CSSProperties
    text4XlLight: React.CSSProperties
    text4XlRegular: React.CSSProperties
    text4XlMedium: React.CSSProperties
    text4XlSemiBold: React.CSSProperties
    text4XlBold: React.CSSProperties
    text4XlExtraBold: React.CSSProperties
    text4XlBlack: React.CSSProperties

    // Text 3XL
    text3Xl: React.CSSProperties
    text3XlThin: React.CSSProperties
    text3XlExtraLight: React.CSSProperties
    text3XlLight: React.CSSProperties
    text3XlRegular: React.CSSProperties
    text3XlMedium: React.CSSProperties
    text3XlSemiBold: React.CSSProperties
    text3XlBold: React.CSSProperties
    text3XlExtraBold: React.CSSProperties
    text3XlBlack: React.CSSProperties

    // Text 2XL
    text2Xl: React.CSSProperties
    text2XlThin: React.CSSProperties
    text2XlExtraLight: React.CSSProperties
    text2XlLight: React.CSSProperties
    text2XlRegular: React.CSSProperties
    text2XlMedium: React.CSSProperties
    text2XlSemiBold: React.CSSProperties
    text2XlBold: React.CSSProperties
    text2XlExtraBold: React.CSSProperties
    text2XlBlack: React.CSSProperties

    // Text XL
    textXl: React.CSSProperties
    textXlThin: React.CSSProperties
    textXlExtraLight: React.CSSProperties
    textXlLight: React.CSSProperties
    textXlRegular: React.CSSProperties
    textXlMedium: React.CSSProperties
    textXlSemiBold: React.CSSProperties
    textXlBold: React.CSSProperties
    textXlExtraBold: React.CSSProperties
    textXlBlack: React.CSSProperties

    // Text LG
    textLg: React.CSSProperties
    textLgThin: React.CSSProperties
    textLgExtraLight: React.CSSProperties
    textLgLight: React.CSSProperties
    textLgRegular: React.CSSProperties
    textLgMedium: React.CSSProperties
    textLgSemiBold: React.CSSProperties
    textLgBold: React.CSSProperties
    textLgExtraBold: React.CSSProperties
    textLgBlack: React.CSSProperties

    // Text Base
    textBase: React.CSSProperties
    textBaseThin: React.CSSProperties
    textBaseExtraLight: React.CSSProperties
    textBaseLight: React.CSSProperties
    textBaseRegular: React.CSSProperties
    textBaseMedium: React.CSSProperties
    textBaseSemiBold: React.CSSProperties
    textBaseBold: React.CSSProperties
    textBaseExtraBold: React.CSSProperties
    textBaseBlack: React.CSSProperties

    // Text SM
    textSm: React.CSSProperties
    textSmThin: React.CSSProperties
    textSmExtraLight: React.CSSProperties
    textSmLight: React.CSSProperties
    textSmRegular: React.CSSProperties
    textSmMedium: React.CSSProperties
    textSmSemiBold: React.CSSProperties
    textSmBold: React.CSSProperties
    textSmExtraBold: React.CSSProperties
    textSmBlack: React.CSSProperties

    // Text XS
    textXs: React.CSSProperties
    textXsThin: React.CSSProperties
    textXsExtraLight: React.CSSProperties
    textXsLight: React.CSSProperties
    textXsRegular: React.CSSProperties
    textXsMedium: React.CSSProperties
    textXsSemiBold: React.CSSProperties
    textXsBold: React.CSSProperties
    textXsExtraBold: React.CSSProperties
    textXsBlack: React.CSSProperties

    // Button
    buttonSm: React.CSSProperties
    buttonMd: React.CSSProperties
    buttonLg: React.CSSProperties

  }

  interface Theme {
    radius: RadiusScale
    shadowCustom: ShadowCustomScale
    spacer: SpacerScale
  }
  interface ThemeOptions {
    radius?: Partial<RadiusScale>
    shadowCustom?: Partial<ShadowCustomScale>
    spacer?: Partial<SpacerScale>
  }

  interface PaletteColor extends ColorScale {
    lighter: string
    darker: string
  }

  interface SimplePaletteColorOptions extends Partial<ColorScale> {
    lighter: string
    darker: string
  }
   interface TypographyVariantsOptions {
    fontWeightSemibold?: number

     // Text 9XL
    text9Xl: React.CSSProperties
    text9XlThin: React.CSSProperties
    text9XlExtraLight: React.CSSProperties
    text9XlLight: React.CSSProperties
    text9XlRegular: React.CSSProperties
    text9XlMedium: React.CSSProperties
    text9XlSemiBold: React.CSSProperties
    text9XlBold: React.CSSProperties
    text9XlExtraBold: React.CSSProperties
    text9XlBlack: React.CSSProperties

    // Text 8XL
    text8Xl: React.CSSProperties
    text8XlThin: React.CSSProperties
    text8XlExtraLight: React.CSSProperties
    text8XlLight: React.CSSProperties
    text8XlRegular: React.CSSProperties
    text8XlMedium: React.CSSProperties
    text8XlSemiBold: React.CSSProperties
    text8XlBold: React.CSSProperties
    text8XlExtraBold: React.CSSProperties
    text8XlBlack: React.CSSProperties

    // Text 7XL
    text7Xl: React.CSSProperties
    text7XlThin: React.CSSProperties
    text7XlExtraLight: React.CSSProperties
    text7XlLight: React.CSSProperties
    text7XlRegular: React.CSSProperties
    text7XlMedium: React.CSSProperties
    text7XlSemiBold: React.CSSProperties
    text7XlBold: React.CSSProperties
    text7XlExtraBold: React.CSSProperties
    text7XlBlack: React.CSSProperties

    // Text 6XL
    text6Xl: React.CSSProperties
    text6XlThin: React.CSSProperties
    text6XlExtraLight: React.CSSProperties
    text6XlLight: React.CSSProperties
    text6XlRegular: React.CSSProperties
    text6XlMedium: React.CSSProperties
    text6XlSemiBold: React.CSSProperties
    text6XlBold: React.CSSProperties
    text6XlExtraBold: React.CSSProperties
    text6XlBlack: React.CSSProperties

    // Text 5XL
    text5Xl: React.CSSProperties
    text5XlThin: React.CSSProperties
    text5XlExtraLight: React.CSSProperties
    text5XlLight: React.CSSProperties
    text5XlRegular: React.CSSProperties
    text5XlMedium: React.CSSProperties
    text5XlSemiBold: React.CSSProperties
    text5XlBold: React.CSSProperties
    text5XlExtraBold: React.CSSProperties
    text5XlBlack: React.CSSProperties

    // Text 4XL
    text4Xl: React.CSSProperties
    text4XlThin: React.CSSProperties
    text4XlExtraLight: React.CSSProperties
    text4XlLight: React.CSSProperties
    text4XlRegular: React.CSSProperties
    text4XlMedium: React.CSSProperties
    text4XlSemiBold: React.CSSProperties
    text4XlBold: React.CSSProperties
    text4XlExtraBold: React.CSSProperties
    text4XlBlack: React.CSSProperties

    // Text 3XL
    text3Xl: React.CSSProperties
    text3XlThin: React.CSSProperties
    text3XlExtraLight: React.CSSProperties
    text3XlLight: React.CSSProperties
    text3XlRegular: React.CSSProperties
    text3XlMedium: React.CSSProperties
    text3XlSemiBold: React.CSSProperties
    text3XlBold: React.CSSProperties
    text3XlExtraBold: React.CSSProperties
    text3XlBlack: React.CSSProperties

    // Text 2XL
    text2Xl: React.CSSProperties
    text2XlThin: React.CSSProperties
    text2XlExtraLight: React.CSSProperties
    text2XlLight: React.CSSProperties
    text2XlRegular: React.CSSProperties
    text2XlMedium: React.CSSProperties
    text2XlSemiBold: React.CSSProperties
    text2XlBold: React.CSSProperties
    text2XlExtraBold: React.CSSProperties
    text2XlBlack: React.CSSProperties

    // Text XL
    textXl: React.CSSProperties
    textXlThin: React.CSSProperties
    textXlExtraLight: React.CSSProperties
    textXlLight: React.CSSProperties
    textXlRegular: React.CSSProperties
    textXlMedium: React.CSSProperties
    textXlSemiBold: React.CSSProperties
    textXlBold: React.CSSProperties
    textXlExtraBold: React.CSSProperties
    textXlBlack: React.CSSProperties

    // Text LG
    textLg: React.CSSProperties
    textLgThin: React.CSSProperties
    textLgExtraLight: React.CSSProperties
    textLgLight: React.CSSProperties
    textLgRegular: React.CSSProperties
    textLgMedium: React.CSSProperties
    textLgSemiBold: React.CSSProperties
    textLgBold: React.CSSProperties
    textLgExtraBold: React.CSSProperties
    textLgBlack: React.CSSProperties

    // Text Base
    textBase: React.CSSProperties
    textBaseThin: React.CSSProperties
    textBaseExtraLight: React.CSSProperties
    textBaseLight: React.CSSProperties
    textBaseRegular: React.CSSProperties
    textBaseMedium: React.CSSProperties
    textBaseSemiBold: React.CSSProperties
    textBaseBold: React.CSSProperties
    textBaseExtraBold: React.CSSProperties
    textBaseBlack: React.CSSProperties

    // Text SM
    textSm: React.CSSProperties
    textSmThin: React.CSSProperties
    textSmExtraLight: React.CSSProperties
    textSmLight: React.CSSProperties
    textSmRegular: React.CSSProperties
    textSmMedium: React.CSSProperties
    textSmSemiBold: React.CSSProperties
    textSmBold: React.CSSProperties
    textSmExtraBold: React.CSSProperties
    textSmBlack: React.CSSProperties

    // Text XS
    textXs: React.CSSProperties
    textXsThin: React.CSSProperties
    textXsExtraLight: React.CSSProperties
    textXsLight: React.CSSProperties
    textXsRegular: React.CSSProperties
    textXsMedium: React.CSSProperties
    textXsSemiBold: React.CSSProperties
    textXsBold: React.CSSProperties
    textXsExtraBold: React.CSSProperties
    textXsBlack: React.CSSProperties

    // Button
    buttonSm: React.CSSProperties
    buttonMd: React.CSSProperties
    buttonLg: React.CSSProperties
  }
  
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true
  }

  interface ButtonPropsColorOverrides {
    neutral: true
  }

  interface ButtonPropsSizeOverrides {
    xs: true
    xl: true
  }
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    neutral: true
    grey: true
    tertiary: true
    purple: true
    pink: true
    rose: true
    orange: true
  }
}

declare module '@mui/material/Icon' {
  interface IconPropsColorOverrides {
    neutral: true
    grey: true
    tertiary: true
    purple: true
    pink: true
    rose: true
    orange: true
  }
}
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true
    grey: true
    tertiary: true
    purple: true
    pink: true
    rose: true
    orange: true
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    // Text 9XL
    text9Xl: true
    text9XlThin: true
    text9XlExtraLight: true
    text9XlLight: true
    text9XlRegular: true
    text9XlMedium: true
    text9XlSemiBold: true
    text9XlBold: true
    text9XlExtraBold: true
    text9XlBlack: true

    // Text 8XL
    text8Xl: true
    text8XlThin: true
    text8XlExtraLight: true
    text8XlLight: true
    text8XlRegular: true
    text8XlMedium: true
    text8XlSemiBold: true
    text8XlBold: true
    text8XlExtraBold: true
    text8XlBlack: true

    // Text 7XL
    text7Xl: true
    text7XlThin: true
    text7XlExtraLight: true
    text7XlLight: true
    text7XlRegular: true
    text7XlMedium: true
    text7XlSemiBold: true
    text7XlBold: true
    text7XlExtraBold: true
    text7XlBlack: true

    // Text 6XL
    text6Xl: true
    text6XlThin: true
    text6XlExtraLight: true
    text6XlLight: true
    text6XlRegular: true
    text6XlMedium: true
    text6XlSemiBold: true
    text6XlBold: true
    text6XlExtraBold: true
    text6XlBlack: true

    // Text 5XL
    text5Xl: true
    text5XlThin: true
    text5XlExtraLight: true
    text5XlLight: true
    text5XlRegular: true
    text5XlMedium: true
    text5XlSemiBold: true
    text5XlBold: true
    text5XlExtraBold: true
    text5XlBlack: true

    // Text 4XL
    text4Xl: true
    text4XlThin: true
    text4XlExtraLight: true
    text4XlLight: true
    text4XlRegular: true
    text4XlMedium: true
    text4XlSemiBold: true
    text4XlBold: true
    text4XlExtraBold: true
    text4XlBlack: true

    // Text 3XL
    text3Xl: true
    text3XlThin: true
    text3XlExtraLight: true
    text3XlLight: true
    text3XlRegular: true
    text3XlMedium: true
    text3XlSemiBold: true
    text3XlBold: true
    text3XlExtraBold: true
    text3XlBlack: true

    // Text 2XL
    text2Xl: true
    text2XlThin: true
    text2XlExtraLight: true
    text2XlLight: true
    text2XlRegular: true
    text2XlMedium: true
    text2XlSemiBold: true
    text2XlBold: true
    text2XlExtraBold: true
    text2XlBlack: true

    // Text XL
    textXl: true
    textXlThin: true
    textXlExtraLight: true
    textXlLight: true
    textXlRegular: true
    textXlMedium: true
    textXlSemiBold: true
    textXlBold: true
    textXlExtraBold: true
    textXlBlack: true

    // Text LG
    textLg: true
    textLgThin: true
    textLgExtraLight: true
    textLgLight: true
    textLgRegular: true
    textLgMedium: true
    textLgSemiBold: true
    textLgBold: true
    textLgExtraBold: true
    textLgBlack: true

    // Text Base
    textBase: true
    textBaseThin: true
    textBaseExtraLight: true
    textBaseLight: true
    textBaseRegular: true
    textBaseMedium: true
    textBaseSemiBold: true
    textBaseBold: true
    textBaseExtraBold: true
    textBaseBlack: true

    // Text SM
    textSm: true
    textSmThin: true
    textSmExtraLight: true
    textSmLight: true
    textSmRegular: true
    textSmMedium: true
    textSmSemiBold: true
    textSmBold: true
    textSmExtraBold: true
    textSmBlack: true

    // Text XS
    textXs: true
    textXsThin: true
    textXsExtraLight: true
    textXsLight: true
    textXsRegular: true
    textXsMedium: true
    textXsSemiBold: true
    textXsBold: true
    textXsExtraBold: true
    textXsBlack: true

    // Button
    buttonSm: true
    buttonMd: true
    buttonLg: true
  }
}


declare module '@mui/material/IconButton' {
  interface IconButtonPropsVariantOverrides {
    contained: true
    soft: true
    outlined: true
  }

  interface IconButtonPropsColorOverrides {
    neutral: true
    secondary: true
  }

  interface IconButtonPropsSizeOverrides {
    xs: true
    xl: true
  }

  interface IconButtonOwnProps {
    variant?: 'contained' | 'soft' | 'outlined'
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    soft: true
    text: true
  
  }

  interface ChipPropsColorOverrides {
    neutral: true
  }
}
