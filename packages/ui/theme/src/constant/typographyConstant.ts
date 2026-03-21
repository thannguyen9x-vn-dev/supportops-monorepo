export const FontFamily = {
  body: "Inter",
} as const

export const FontWeight = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const

export type FontWeightKey = keyof typeof FontWeight

export const textScale = {
  xs: { fontSize: 12, lineHeight: "16px" },
  sm: { fontSize: 14, lineHeight: "20px" },
  base: { fontSize: 16, lineHeight: "24px" },
  lg: { fontSize: 18, lineHeight: "28px" },
  xl: { fontSize: 20, lineHeight: "28px" },
  "2xl": { fontSize: 24, lineHeight: "32px" },
  "3xl": { fontSize: 30, lineHeight: "36px" },
  "4xl": { fontSize: 36, lineHeight: "40px" },
  "5xl": { fontSize: 48, lineHeight: "52px" },
  "6xl": { fontSize: 60, lineHeight: "64px" },
  "7xl": { fontSize: 72, lineHeight: "76px" },
  "8xl": { fontSize: 96, lineHeight: "100px" },
  "9xl": { fontSize: 128, lineHeight: "132px" },
} as const

export type TextScaleKey = keyof typeof textScale

export type TypographyToken = {
  fontSize: `${number}px`
  lineHeight: `${number}px`
  fontWeight: number
  fontFamily: string
}

/**
 * typographyConstant (new naming)
 * - Each size has 9 weights.
 * - Default (no suffix) = Medium (500)
 */
export const typographyConstant = {
  // =====================
  // text-xs (12/16)
  // =====================
  textXs: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textXsThin: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  textXsExtraLight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  textXsLight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  textXsRegular: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  textXsMedium: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textXsSemiBold: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  textXsBold: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  textXsExtraBold: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  textXsBlack: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-sm (14/20)
  // =====================
  textSm: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textSmThin: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  textSmExtraLight: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  textSmLight: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  textSmRegular: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  textSmMedium: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textSmSemiBold: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  textSmBold: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  textSmExtraBold: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  textSmBlack: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-base (16/24)
  // =====================
  textBase: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textBaseThin: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  textBaseExtraLight: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  textBaseLight: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  textBaseRegular: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  textBaseMedium: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textBaseSemiBold: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  textBaseBold: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  textBaseExtraBold: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  textBaseBlack: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-lg (18/28)
  // =====================
  textLg: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textLgThin: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  textLgExtraLight: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  textLgLight: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  textLgRegular: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  textLgMedium: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textLgSemiBold: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  textLgBold: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  textLgExtraBold: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  textLgBlack: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-xl (20/28)
  // =====================
  textXl: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textXlThin: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  textXlExtraLight: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  textXlLight: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  textXlRegular: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  textXlMedium: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  textXlSemiBold: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  textXlBold: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  textXlExtraBold: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  textXlBlack: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-2xl (24/32)
  // =====================
  text2Xl: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text2XlThin: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text2XlExtraLight: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text2XlLight: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text2XlRegular: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text2XlMedium: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text2XlSemiBold: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text2XlBold: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text2XlExtraBold: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text2XlBlack: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-3xl (30/36)
  // =====================
  text3Xl: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text3XlThin: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text3XlExtraLight: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text3XlLight: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text3XlRegular: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text3XlMedium: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text3XlSemiBold: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text3XlBold: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text3XlExtraBold: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text3XlBlack: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-4xl (36/40)
  // =====================
  text4Xl: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text4XlThin: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text4XlExtraLight: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text4XlLight: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text4XlRegular: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text4XlMedium: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text4XlSemiBold: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text4XlBold: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text4XlExtraBold: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text4XlBlack: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-5xl (48/52)
  // =====================
  text5Xl: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text5XlThin: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text5XlExtraLight: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text5XlLight: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text5XlRegular: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text5XlMedium: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text5XlSemiBold: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text5XlBold: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text5XlExtraBold: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text5XlBlack: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-6xl (60/64)
  // =====================
  text6Xl: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text6XlThin: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text6XlExtraLight: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text6XlLight: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text6XlRegular: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text6XlMedium: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text6XlSemiBold: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text6XlBold: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text6XlExtraBold: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text6XlBlack: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-7xl (72/76)
  // =====================
  text7Xl: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text7XlThin: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text7XlExtraLight: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text7XlLight: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text7XlRegular: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text7XlMedium: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text7XlSemiBold: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text7XlBold: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text7XlExtraBold: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text7XlBlack: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-8xl (96/100)
  // =====================
  text8Xl: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text8XlThin: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text8XlExtraLight: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text8XlLight: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text8XlRegular: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text8XlMedium: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text8XlSemiBold: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text8XlBold: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text8XlExtraBold: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text8XlBlack: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // text-9xl (128/132)
  // =====================
  text9Xl: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text9XlThin: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 100,
    fontFamily: FontFamily.body,
  },
  text9XlExtraLight: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 200,
    fontFamily: FontFamily.body,
  },
  text9XlLight: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 300,
    fontFamily: FontFamily.body,
  },
  text9XlRegular: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 400,
    fontFamily: FontFamily.body,
  },
  text9XlMedium: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 500,
    fontFamily: FontFamily.body,
  },
  text9XlSemiBold: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  },
  text9XlBold: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  },
  text9XlExtraBold: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 800,
    fontFamily: FontFamily.body,
  },
  text9XlBlack: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 900,
    fontFamily: FontFamily.body,
  },

  // =====================
  // Common semantic helpers (optional)
  // =====================
  // Paragraph presets
  leadingNormal: { lineHeight: 1.5 } as const,
  leadingRelaxed: { lineHeight: 1.625 } as const,

  // Buttons (most admin UIs)
  buttonSm: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  }, // 14/20/600
  buttonMd: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 700,
    fontFamily: FontFamily.body,
  }, // 14/20/700
  buttonLg: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    fontFamily: FontFamily.body,
  }, // 16/24/600
} as const
