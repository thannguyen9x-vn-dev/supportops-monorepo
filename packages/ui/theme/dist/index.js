import { createTheme, ThemeProvider as ThemeProvider$1 } from '@mui/material/styles';
import t, { useMemo } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';
import { CssBaseline, Button, alpha, Stack, Box } from '@mui/material';

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/constant/colors.ts
var colors_exports = {};
__export(colors_exports, {
  blue: () => blue,
  green: () => green,
  grey: () => grey,
  indigo: () => indigo,
  orange: () => orange,
  pink: () => pink,
  purple: () => purple,
  red: () => red,
  teal: () => teal,
  yellow: () => yellow
});
var grey = {
  50: "#FBFCFE",
  100: "#F0F4F8",
  200: "#DDE7EE",
  300: "#CDD7E1",
  400: "#9FA6AD",
  500: "#636B74",
  600: "#555E68",
  700: "#32383E",
  800: "#171A1C",
  900: "#0B0D0E"
};
var red = {
  50: "#FFF5F5",
  100: "#FFE3E3",
  200: "#FFC9C9",
  300: "#FFA8A8",
  400: "#FF8787",
  500: "#FF6B6B",
  600: "#FA5252",
  700: "#E03131",
  800: "#C92A2A",
  900: "#7A1F1F"
};
var orange = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12"
};
var yellow = {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  300: "#FCD34D",
  400: "#FBBF24",
  500: "#F59E0B",
  600: "#D97706",
  700: "#B45309",
  800: "#92400E",
  900: "#78350F"
};
var green = {
  50: "#ECFDF5",
  100: "#D1FAE5",
  200: "#A7F3D0",
  300: "#6EE7B7",
  400: "#34D399",
  500: "#10B981",
  600: "#059669",
  700: "#047857",
  800: "#065F46",
  900: "#064E3B"
};
var teal = {
  50: "#F0FDFA",
  100: "#CCFBF1",
  200: "#99F6E4",
  300: "#5EEAD4",
  400: "#2DD4BF",
  500: "#14B8A6",
  600: "#0D9488",
  700: "#0F766E",
  800: "#115E59",
  900: "#134E4A"
};
var blue = {
  50: "#EFF6FF",
  100: "#DBEAFE",
  200: "#BFDBFE",
  300: "#93C5FD",
  400: "#60A5FA",
  500: "#3B82F6",
  600: "#2563EB",
  700: "#1D4ED8",
  800: "#1E40AF",
  900: "#1E3A8A"
};
var indigo = {
  50: "#EEF2FF",
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",
  600: "#4F46E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81"
};
var purple = {
  50: "#FAF5FF",
  100: "#F3E8FF",
  200: "#E9D5FF",
  300: "#D8B4FE",
  400: "#C084FC",
  500: "#A855F7",
  600: "#9333EA",
  700: "#7E22CE",
  800: "#6B21A8",
  900: "#581C87"
};
var pink = {
  50: "#FDF2F8",
  100: "#FCE7F3",
  200: "#FBCFE8",
  300: "#F9A8D4",
  400: "#F472B6",
  500: "#EC4899",
  600: "#DB2777",
  700: "#BE185D",
  800: "#9D174D",
  900: "#831843"
};

// src/utils/paletteUtil.ts
var primary = blue;
var error = red;
var warning = orange;
var success = green;
var info = teal;
function getPaletteOptions(mode) {
  return {
    mode,
    common: {
      black: "#1A1A1A",
      white: "#FFFFFF"
    },
    action: {
      disabled: grey[300]
    },
    divider: grey[200],
    background: {
      paper: "#FFFFFF",
      default: grey[100]
    },
    grey: {
      ...grey,
      lighter: grey[50],
      light: grey[300],
      main: grey[500],
      dark: grey[600],
      darker: grey[700],
      contrastText: "#FFFFFF"
    },
    primary: {
      ...primary,
      lighter: primary[50],
      light: primary[300],
      main: primary[500],
      dark: primary[600],
      darker: primary[700],
      contrastText: "#FFFFFF"
    },
    error: {
      ...error,
      lighter: error[50],
      light: error[300],
      main: error[500],
      dark: error[600],
      darker: error[700],
      contrastText: "#FFFFFF"
    },
    warning: {
      ...warning,
      lighter: warning[50],
      light: warning[300],
      main: warning[500],
      dark: warning[600],
      darker: warning[700],
      contrastText: "#FFFFFF"
    },
    success: {
      ...success,
      lighter: success[50],
      light: success[300],
      main: success[500],
      dark: success[600],
      darker: success[700],
      contrastText: "#FFFFFF"
    },
    info: {
      ...info,
      lighter: info[50],
      light: info[300],
      main: info[500],
      dark: info[600],
      darker: info[700],
      contrastText: "#FFFFFF"
    }
  };
}

// src/constant/radius.ts
var radius = {
  sm: 6};

// src/constant/typographyConstant.ts
var FontFamily = {
  body: "Inter"
};
var typographyConstant = {
  // =====================
  // text-xs (12/16)
  // =====================
  textXs: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textXsThin: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  textXsExtraLight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  textXsLight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  textXsRegular: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  textXsMedium: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textXsSemiBold: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  textXsBold: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  textXsExtraBold: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  textXsBlack: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-sm (14/20)
  // =====================
  textSm: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textSmThin: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  textSmExtraLight: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  textSmLight: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  textSmRegular: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  textSmMedium: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textSmSemiBold: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  textSmBold: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  textSmExtraBold: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  textSmBlack: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-base (16/24)
  // =====================
  textBase: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textBaseThin: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  textBaseExtraLight: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  textBaseLight: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  textBaseRegular: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  textBaseMedium: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textBaseSemiBold: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  textBaseBold: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  textBaseExtraBold: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  textBaseBlack: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-lg (18/28)
  // =====================
  textLg: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textLgThin: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  textLgExtraLight: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  textLgLight: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  textLgRegular: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  textLgMedium: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textLgSemiBold: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  textLgBold: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  textLgExtraBold: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  textLgBlack: {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-xl (20/28)
  // =====================
  textXl: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textXlThin: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  textXlExtraLight: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  textXlLight: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  textXlRegular: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  textXlMedium: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  textXlSemiBold: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  textXlBold: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  textXlExtraBold: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  textXlBlack: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-2xl (24/32)
  // =====================
  text2Xl: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text2XlThin: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text2XlExtraLight: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text2XlLight: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text2XlRegular: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text2XlMedium: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text2XlSemiBold: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text2XlBold: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text2XlExtraBold: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text2XlBlack: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-3xl (30/36)
  // =====================
  text3Xl: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text3XlThin: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text3XlExtraLight: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text3XlLight: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text3XlRegular: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text3XlMedium: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text3XlSemiBold: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text3XlBold: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text3XlExtraBold: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text3XlBlack: {
    fontSize: "30px",
    lineHeight: "36px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-4xl (36/40)
  // =====================
  text4Xl: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text4XlThin: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text4XlExtraLight: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text4XlLight: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text4XlRegular: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text4XlMedium: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text4XlSemiBold: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text4XlBold: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text4XlExtraBold: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text4XlBlack: {
    fontSize: "36px",
    lineHeight: "40px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-5xl (48/52)
  // =====================
  text5Xl: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text5XlThin: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text5XlExtraLight: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text5XlLight: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text5XlRegular: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text5XlMedium: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text5XlSemiBold: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text5XlBold: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text5XlExtraBold: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text5XlBlack: {
    fontSize: "48px",
    lineHeight: "52px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-6xl (60/64)
  // =====================
  text6Xl: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text6XlThin: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text6XlExtraLight: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text6XlLight: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text6XlRegular: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text6XlMedium: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text6XlSemiBold: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text6XlBold: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text6XlExtraBold: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text6XlBlack: {
    fontSize: "60px",
    lineHeight: "64px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-7xl (72/76)
  // =====================
  text7Xl: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text7XlThin: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text7XlExtraLight: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text7XlLight: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text7XlRegular: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text7XlMedium: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text7XlSemiBold: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text7XlBold: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text7XlExtraBold: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text7XlBlack: {
    fontSize: "72px",
    lineHeight: "76px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-8xl (96/100)
  // =====================
  text8Xl: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text8XlThin: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text8XlExtraLight: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text8XlLight: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text8XlRegular: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text8XlMedium: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text8XlSemiBold: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text8XlBold: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text8XlExtraBold: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text8XlBlack: {
    fontSize: "96px",
    lineHeight: "100px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // text-9xl (128/132)
  // =====================
  text9Xl: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text9XlThin: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 100,
    fontFamily: FontFamily.body
  },
  text9XlExtraLight: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 200,
    fontFamily: FontFamily.body
  },
  text9XlLight: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 300,
    fontFamily: FontFamily.body
  },
  text9XlRegular: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 400,
    fontFamily: FontFamily.body
  },
  text9XlMedium: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 500,
    fontFamily: FontFamily.body
  },
  text9XlSemiBold: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  text9XlBold: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  text9XlExtraBold: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 800,
    fontFamily: FontFamily.body
  },
  text9XlBlack: {
    fontSize: "128px",
    lineHeight: "132px",
    fontWeight: 900,
    fontFamily: FontFamily.body
  },
  // =====================
  // Common semantic helpers (optional)
  // =====================
  // Paragraph presets
  leadingNormal: { lineHeight: 1.5 },
  leadingRelaxed: { lineHeight: 1.625 },
  // Buttons (most admin UIs)
  buttonSm: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  },
  // 14/20/600
  buttonMd: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 700,
    fontFamily: FontFamily.body
  },
  // 14/20/700
  buttonLg: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    fontFamily: FontFamily.body
  }
  // 16/24/600
};

// src/utils/typographyUtil.ts
function getTypographyVariantOptions() {
  return {
    htmlFontSize: 16,
    fontSize: 16,
    allVariants: {
      fontSize: "16px",
      lineHeight: "24px"
    },
    fontFamily: "Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Noto Sans,Ubuntu,Cantarell,Helvetica Neue,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    ...typographyConstant,
    button: {
      textTransform: "none"
    }
  };
}
var f1 = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" }));
var J1 = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" }));
var r2 = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" }));
var P7 = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z" }));
var hF = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M4.83582 12L11.0429 18.2071L12.4571 16.7929L7.66424 12L12.4571 7.20712L11.0429 5.79291L4.83582 12ZM10.4857 12L16.6928 18.2071L18.107 16.7929L13.3141 12L18.107 7.20712L16.6928 5.79291L10.4857 12Z" }));
var VF = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M19.1642 12L12.9571 5.79291L11.5429 7.20712L16.3358 12L11.5429 16.7929L12.9571 18.2071L19.1642 12ZM13.5143 12L7.30722 5.79291L5.89301 7.20712L10.6859 12L5.89301 16.7929L7.30722 18.2071L13.5143 12Z" }));
var fS = ({ color: C = "currentColor", size: e = 24, className: l, ...i }) => t.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: e, height: e, fill: C, ...i, className: "remixicon " + (l || "") }, t.createElement("path", { d: "M18.2072 9.0428 12.0001 2.83569 5.793 9.0428 7.20721 10.457 12.0001 5.66412 16.793 10.457 18.2072 9.0428ZM5.79285 14.9572 12 21.1643 18.2071 14.9572 16.7928 13.543 12 18.3359 7.20706 13.543 5.79285 14.9572Z" }));
function OverrideAutocomplete() {
  return {
    defaultProps: {
      popupIcon: /* @__PURE__ */ jsx(fS, {})
    },
    styleOverrides: {
      popper: {
        boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08);"
      },
      listbox: {
        padding: 0,
        ".MuiAutocomplete-option": {
          paddingTop: "4px",
          paddingBottom: "4px",
          background: "#FFF"
        }
      },
      root: {
        ".MuiOutlinedInput-root": {
          padding: "0",
          minHeight: "40px",
          ".MuiAutocomplete-input": {
            padding: "8px 12px"
          },
          "&.MuiInputBase-sizeSmall": {
            paddingTop: "0",
            paddingBottom: "0",
            paddingLeft: "0",
            minHeight: "32px",
            ".MuiAutocomplete-input": {
              padding: "8px 12px"
            }
          },
          ".MuiChip-root.MuiAutocomplete-tag": {
            height: "24px"
          }
        }
      },
      paper: {
        fontSize: "16px",
        lineHeight: "24px"
      }
    }
  };
}

// src/components/OverrideBadge.ts
function OverrideBadge(theme) {
  const { primary: primary2, grey: grey2, success: success2, error: error2, warning: warning2, info: info2 } = theme.palette;
  return {
    defaultProps: {
      variant: "standard",
      color: "error"
    },
    styleOverrides: {
      badge: {
        padding: "0px 3px",
        fontSize: "8px",
        lineHeight: "12px",
        height: "12px",
        fontWeight: 500
      }
    },
    variants: [
      {
        props: { variant: "standard", color: "primary" },
        style: {
          color: primary2["contrastText"]
        }
      },
      {
        props: { variant: "standard", color: "grey" },
        style: {
          color: grey2["contrastText"]
        }
      },
      {
        props: { variant: "standard", color: "success" },
        style: {
          color: success2["contrastText"]
        }
      },
      {
        props: { variant: "standard", color: "error" },
        style: {
          color: error2["contrastText"]
        }
      },
      {
        props: { variant: "standard", color: "warning" },
        style: {
          color: warning2["contrastText"]
        }
      },
      {
        props: { variant: "standard", color: "info" },
        style: {
          color: info2["contrastText"]
        }
      }
    ]
  };
}

// src/components/OverrideBreadcrumbs.ts
function OverrideBreadcrumbs() {
  return {
    styleOverrides: {}
  };
}

// src/styles/baseButtonStyles.ts
var baseButtonStyles = (theme) => ({
  minWidth: 0,
  display: "flex",
  flexDirection: "row",
  borderRadius: theme.radius.xs,
  ".MuiButton-startIcon, .MuiButton-endIcon": {
    margin: 0
  },
  "& svg.remixicon": {
    width: 16,
    height: 16
  }
});

// src/components/OverrideButton.ts
var iconStyle = {
  "&>*:nth-of-type(1)": { fontSize: "inherit" }
};
var focusRing = (color) => ({
  "&::after": {
    boxShadow: `0 0 0 4px ${alpha(color, 0.25)}`
  },
  "&:active::after": {
    boxShadow: "none"
  },
  "&:focus-visible": {
    outline: `2px solid ${color}`,
    outlineOffset: 2
  }
});
function OverrideButton(theme) {
  const { primary: primary2, grey: grey2, common, success: success2, error: error2, warning: warning2, info: info2 } = theme.palette;
  const white = common.white;
  return {
    defaultProps: {
      disableElevation: true,
      size: "medium",
      variant: "contained",
      color: "primary"
    },
    styleOverrides: {
      root: baseButtonStyles(theme),
      startIcon: iconStyle,
      endIcon: iconStyle
    },
    variants: [
      // =====================
      // SIZES
      // =====================
      {
        props: { size: "xs" },
        style: {
          height: 28,
          minHeight: 28,
          padding: "4px 12px",
          fontSize: 12,
          lineHeight: "20px",
          borderRadius: 6,
          "& .MuiButton-startIcon": {
            marginRight: 4,
            "&>*:nth-of-type(1)": { fontSize: 14 }
          },
          "& .MuiButton-endIcon": {
            marginLeft: 4,
            "&>*:nth-of-type(1)": { fontSize: 14 }
          }
        }
      },
      {
        props: { size: "small" },
        style: {
          height: 32,
          minHeight: 32,
          padding: "6px 14px",
          fontSize: 13,
          lineHeight: "20px",
          borderRadius: 6,
          "& .MuiButton-startIcon": {
            marginRight: 6,
            "&>*:nth-of-type(1)": { fontSize: 16 }
          },
          "& .MuiButton-endIcon": {
            marginLeft: 6,
            "&>*:nth-of-type(1)": { fontSize: 16 }
          }
        }
      },
      {
        props: { size: "medium" },
        style: {
          height: 40,
          minHeight: 40,
          padding: "10px 16px",
          fontSize: 14,
          lineHeight: "20px",
          borderRadius: 8,
          "& .MuiButton-startIcon": {
            marginRight: 8,
            "&>*:nth-of-type(1)": { fontSize: 18 }
          },
          "& .MuiButton-endIcon": {
            marginLeft: 8,
            "&>*:nth-of-type(1)": { fontSize: 18 }
          }
        }
      },
      {
        props: { size: "large" },
        style: {
          height: 48,
          minHeight: 48,
          padding: "12px 20px",
          fontSize: 16,
          lineHeight: "24px",
          borderRadius: 10,
          "& .MuiButton-startIcon": {
            marginRight: 8,
            "&>*:nth-of-type(1)": { fontSize: 20 }
          },
          "& .MuiButton-endIcon": {
            marginLeft: 8,
            "&>*:nth-of-type(1)": { fontSize: 20 }
          }
        }
      },
      {
        props: { size: "xl" },
        style: {
          height: 56,
          minHeight: 56,
          padding: "14px 24px",
          fontSize: 18,
          lineHeight: "28px",
          borderRadius: 12,
          "& .MuiButton-startIcon": {
            marginRight: 10,
            "&>*:nth-of-type(1)": { fontSize: 22 }
          },
          "& .MuiButton-endIcon": {
            marginLeft: 10,
            "&>*:nth-of-type(1)": { fontSize: 22 }
          }
        }
      },
      // =====================
      // PRIMARY (Blue)
      // =====================
      {
        props: { variant: "contained", color: "primary" },
        style: {
          backgroundColor: primary2[500],
          color: white,
          "&:hover": {
            backgroundColor: primary2[600]
          },
          "&:active": {
            backgroundColor: primary2[700]
          },
          "&.active": {
            backgroundColor: primary2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: primary2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing(primary2[500])
        }
      },
      {
        props: { variant: "soft", color: "primary" },
        style: {
          backgroundColor: primary2[50],
          color: primary2[600],
          "&:hover": {
            backgroundColor: primary2[100],
            color: primary2[700]
          },
          "&:active": {
            backgroundColor: primary2[200],
            color: primary2[800]
          },
          "&.active": {
            backgroundColor: primary2[200],
            color: primary2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: primary2[50],
            color: primary2[300]
          },
          ...focusRing(primary2[200])
        }
      },
      {
        props: { variant: "outlined", color: "primary" },
        style: {
          backgroundColor: "transparent",
          color: primary2[500],
          borderColor: primary2[500],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: primary2[50],
            borderColor: primary2[600],
            color: primary2[600]
          },
          "&:active": {
            backgroundColor: primary2[100],
            borderColor: primary2[700],
            color: primary2[700]
          },
          "&.active": {
            backgroundColor: primary2[100],
            borderColor: primary2[700],
            color: primary2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: primary2[200],
            color: primary2[200]
          },
          ...focusRing(primary2[200])
        }
      },
      {
        props: { variant: "text", color: "primary" },
        style: {
          backgroundColor: "transparent",
          color: primary2[500],
          "&:hover": {
            backgroundColor: primary2[50],
            color: primary2[600]
          },
          "&:active": {
            backgroundColor: primary2[100],
            color: primary2[700]
          },
          "&.active": {
            backgroundColor: primary2[100],
            color: primary2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: primary2[200]
          },
          ...focusRing(primary2[100])
        }
      },
      // =====================
      // SECONDARY / NEUTRAL (Grey)
      // =====================
      {
        props: { variant: "contained", color: "secondary" },
        style: {
          backgroundColor: grey2[700],
          color: white,
          "&:hover": {
            backgroundColor: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[900]
          },
          "&.active": {
            backgroundColor: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[300],
            color: grey2[500]
          },
          ...focusRing(grey2[600])
        }
      },
      {
        props: { variant: "soft", color: "secondary" },
        style: {
          backgroundColor: grey2[100],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[200],
            color: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[300],
            color: grey2[900]
          },
          "&.active": {
            backgroundColor: grey2[300],
            color: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          ...focusRing(grey2[200])
        }
      },
      {
        props: { variant: "outlined", color: "secondary" },
        style: {
          backgroundColor: "transparent",
          color: grey2[600],
          borderColor: grey2[300],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: grey2[50],
            borderColor: grey2[400],
            color: grey2[700]
          },
          "&:active": {
            backgroundColor: grey2[100],
            borderColor: grey2[500],
            color: grey2[800]
          },
          "&.active": {
            backgroundColor: grey2[100],
            borderColor: grey2[500],
            color: grey2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: grey2[200],
            color: grey2[300]
          },
          ...focusRing(grey2[200])
        }
      },
      {
        props: { variant: "text", color: "secondary" },
        style: {
          backgroundColor: "transparent",
          color: grey2[600],
          "&:hover": {
            backgroundColor: grey2[100],
            color: grey2[700]
          },
          "&:active": {
            backgroundColor: grey2[200],
            color: grey2[800]
          },
          "&.active": {
            backgroundColor: grey2[200],
            color: grey2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[300]
          },
          ...focusRing(grey2[100])
        }
      },
      // =====================
      // SUCCESS (Green)
      // =====================
      {
        props: { variant: "contained", color: "success" },
        style: {
          backgroundColor: success2[500],
          color: white,
          "&:hover": {
            backgroundColor: success2[600]
          },
          "&:active": {
            backgroundColor: success2[700]
          },
          "&.active": {
            backgroundColor: success2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: success2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing(success2[500])
        }
      },
      {
        props: { variant: "soft", color: "success" },
        style: {
          backgroundColor: success2[50],
          color: success2[600],
          "&:hover": {
            backgroundColor: success2[100],
            color: success2[700]
          },
          "&:active": {
            backgroundColor: success2[200],
            color: success2[800]
          },
          "&.active": {
            backgroundColor: success2[200],
            color: success2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: success2[50],
            color: success2[300]
          },
          ...focusRing(success2[200])
        }
      },
      {
        props: { variant: "outlined", color: "success" },
        style: {
          backgroundColor: "transparent",
          color: success2[500],
          borderColor: success2[500],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: success2[50],
            borderColor: success2[600],
            color: success2[600]
          },
          "&:active": {
            backgroundColor: success2[100],
            borderColor: success2[700],
            color: success2[700]
          },
          "&.active": {
            backgroundColor: success2[100],
            borderColor: success2[700],
            color: success2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: success2[200],
            color: success2[200]
          },
          ...focusRing(success2[200])
        }
      },
      {
        props: { variant: "text", color: "success" },
        style: {
          backgroundColor: "transparent",
          color: success2[500],
          "&:hover": {
            backgroundColor: success2[50],
            color: success2[600]
          },
          "&:active": {
            backgroundColor: success2[100],
            color: success2[700]
          },
          "&.active": {
            backgroundColor: success2[100],
            color: success2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: success2[200]
          },
          ...focusRing(success2[100])
        }
      },
      // =====================
      // ERROR (Red)
      // =====================
      {
        props: { variant: "contained", color: "error" },
        style: {
          backgroundColor: error2[500],
          color: white,
          "&:hover": {
            backgroundColor: error2[600]
          },
          "&:active": {
            backgroundColor: error2[700]
          },
          "&.active": {
            backgroundColor: error2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: error2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing(error2[500])
        }
      },
      {
        props: { variant: "soft", color: "error" },
        style: {
          backgroundColor: error2[50],
          color: error2[600],
          "&:hover": {
            backgroundColor: error2[100],
            color: error2[700]
          },
          "&:active": {
            backgroundColor: error2[200],
            color: error2[800]
          },
          "&.active": {
            backgroundColor: error2[200],
            color: error2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: error2[50],
            color: error2[300]
          },
          ...focusRing(error2[200])
        }
      },
      {
        props: { variant: "outlined", color: "error" },
        style: {
          backgroundColor: "transparent",
          color: error2[500],
          borderColor: error2[500],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: error2[50],
            borderColor: error2[600],
            color: error2[600]
          },
          "&:active": {
            backgroundColor: error2[100],
            borderColor: error2[700],
            color: error2[700]
          },
          "&.active": {
            backgroundColor: error2[100],
            borderColor: error2[700],
            color: error2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: error2[200],
            color: error2[200]
          },
          ...focusRing(error2[200])
        }
      },
      {
        props: { variant: "text", color: "error" },
        style: {
          backgroundColor: "transparent",
          color: error2[500],
          "&:hover": {
            backgroundColor: error2[50],
            color: error2[600]
          },
          "&:active": {
            backgroundColor: error2[100],
            color: error2[700]
          },
          "&.active": {
            backgroundColor: error2[100],
            color: error2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: error2[200]
          },
          ...focusRing(error2[100])
        }
      },
      // =====================
      // WARNING (Yellow/Orange)
      // =====================
      {
        props: { variant: "contained", color: "warning" },
        style: {
          backgroundColor: warning2[400],
          color: grey2[900],
          "&:hover": {
            backgroundColor: warning2[500]
          },
          "&:active": {
            backgroundColor: warning2[600]
          },
          "&.active": {
            backgroundColor: warning2[600]
          },
          "&.Mui-disabled": {
            backgroundColor: warning2[200],
            color: grey2[400]
          },
          ...focusRing(warning2[400])
        }
      },
      {
        props: { variant: "soft", color: "warning" },
        style: {
          backgroundColor: warning2[50],
          color: warning2[700],
          "&:hover": {
            backgroundColor: warning2[100],
            color: warning2[800]
          },
          "&:active": {
            backgroundColor: warning2[200],
            color: warning2[900]
          },
          "&.active": {
            backgroundColor: warning2[200],
            color: warning2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: warning2[50],
            color: warning2[300]
          },
          ...focusRing(warning2[200])
        }
      },
      {
        props: { variant: "outlined", color: "warning" },
        style: {
          backgroundColor: "transparent",
          color: warning2[600],
          borderColor: warning2[400],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: warning2[50],
            borderColor: warning2[500],
            color: warning2[700]
          },
          "&:active": {
            backgroundColor: warning2[100],
            borderColor: warning2[600],
            color: warning2[800]
          },
          "&.active": {
            backgroundColor: warning2[100],
            borderColor: warning2[600],
            color: warning2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: warning2[200],
            color: warning2[200]
          },
          ...focusRing(warning2[200])
        }
      },
      {
        props: { variant: "text", color: "warning" },
        style: {
          backgroundColor: "transparent",
          color: warning2[600],
          "&:hover": {
            backgroundColor: warning2[50],
            color: warning2[700]
          },
          "&:active": {
            backgroundColor: warning2[100],
            color: warning2[800]
          },
          "&.active": {
            backgroundColor: warning2[100],
            color: warning2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: warning2[200]
          },
          ...focusRing(warning2[100])
        }
      },
      // =====================
      // INFO (Teal)
      // =====================
      {
        props: { variant: "contained", color: "info" },
        style: {
          backgroundColor: info2[500],
          color: white,
          "&:hover": {
            backgroundColor: info2[600]
          },
          "&:active": {
            backgroundColor: info2[700]
          },
          "&.active": {
            backgroundColor: info2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: info2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing(info2[500])
        }
      },
      {
        props: { variant: "soft", color: "info" },
        style: {
          backgroundColor: info2[50],
          color: info2[600],
          "&:hover": {
            backgroundColor: info2[100],
            color: info2[700]
          },
          "&:active": {
            backgroundColor: info2[200],
            color: info2[800]
          },
          "&.active": {
            backgroundColor: info2[200],
            color: info2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: info2[50],
            color: info2[300]
          },
          ...focusRing(info2[200])
        }
      },
      {
        props: { variant: "outlined", color: "info" },
        style: {
          backgroundColor: "transparent",
          color: info2[500],
          borderColor: info2[500],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: info2[50],
            borderColor: info2[600],
            color: info2[600]
          },
          "&:active": {
            backgroundColor: info2[100],
            borderColor: info2[700],
            color: info2[700]
          },
          "&.active": {
            backgroundColor: info2[100],
            borderColor: info2[700],
            color: info2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: info2[200],
            color: info2[200]
          },
          ...focusRing(info2[200])
        }
      },
      {
        props: { variant: "text", color: "info" },
        style: {
          backgroundColor: "transparent",
          color: info2[500],
          "&:hover": {
            backgroundColor: info2[50],
            color: info2[600]
          },
          "&:active": {
            backgroundColor: info2[100],
            color: info2[700]
          },
          "&.active": {
            backgroundColor: info2[100],
            color: info2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: info2[200]
          },
          ...focusRing(info2[100])
        }
      },
      // =====================
      // NEUTRAL (Grey - alternative name)
      // =====================
      {
        props: { variant: "contained", color: "neutral" },
        style: {
          backgroundColor: grey2[700],
          color: white,
          "&:hover": {
            backgroundColor: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[900]
          },
          "&.active": {
            backgroundColor: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[300],
            color: grey2[500]
          },
          ...focusRing(grey2[600])
        }
      },
      {
        props: { variant: "soft", color: "neutral" },
        style: {
          backgroundColor: grey2[100],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[200],
            color: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[300],
            color: grey2[900]
          },
          "&.active": {
            backgroundColor: grey2[300],
            color: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          ...focusRing(grey2[200])
        }
      },
      {
        props: { variant: "outlined", color: "neutral" },
        style: {
          backgroundColor: "transparent",
          color: grey2[700],
          borderColor: grey2[300],
          borderWidth: 1,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: grey2[50],
            borderColor: grey2[400]
          },
          "&:active": {
            backgroundColor: white,
            borderColor: grey2[700]
          },
          "&.active": {
            backgroundColor: white,
            borderColor: grey2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: grey2[200],
            color: grey2[400]
          },
          ...focusRing(grey2[200])
        }
      },
      {
        props: { variant: "text", color: "neutral" },
        style: {
          backgroundColor: "transparent",
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[100]
          },
          "&:active": {
            backgroundColor: grey2[200]
          },
          "&.active": {
            backgroundColor: grey2[200]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          ...focusRing(grey2[100])
        }
      }
    ]
  };
}

// src/components/OverrideCardContent.ts
function OverrideCardContent() {
  return {
    styleOverrides: {
      root: {
        padding: 20,
        "&:last-child": {
          paddingBottom: 20
        }
      }
    }
  };
}
var CheckboxIndeterminateIcon = () => {
  return /* @__PURE__ */ jsxs(Stack, { children: [
    /* @__PURE__ */ jsx(Stack, { className: "checkbox-indeterminate", children: /* @__PURE__ */ jsxs(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        children: [
          /* @__PURE__ */ jsxs("g", { clipPath: "url(#clip0_3824_2241)", children: [
            /* @__PURE__ */ jsx("rect", { width: "20", height: "20", rx: "4", fill: "#594DE8" }),
            /* @__PURE__ */ jsx("rect", { x: "5", y: "9", width: "10", height: "2", rx: "0.2", fill: "white" })
          ] }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "checkbox-indeterminate_clip0_3824_2241", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Box, { className: "checkbox-indeterminate-disable", sx: { display: "none" }, children: /* @__PURE__ */ jsxs(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        children: [
          /* @__PURE__ */ jsxs("g", { clipPath: "url(#clip0_3824_2241)", children: [
            /* @__PURE__ */ jsx("rect", { x: "0.5", y: "0.5", width: "19", height: "19", rx: "3.5", fill: "#F0F4F8", stroke: "#CDD7E1" }),
            /* @__PURE__ */ jsx("rect", { x: "5", y: "9", width: "10", height: "2", rx: "0.2", fill: "#CDD7E1" })
          ] }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "checkbox_indeterminate_disable_clip0_3824_2241", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
        ]
      }
    ) })
  ] });
};
var CheckboxCheckedIcon = () => {
  return /* @__PURE__ */ jsxs(Stack, { children: [
    /* @__PURE__ */ jsx(Stack, { className: "checkbox-checked", children: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: [
          /* @__PURE__ */ jsxs("g", { clipPath: "url(#clip0_3824_2208)", children: [
            /* @__PURE__ */ jsx("rect", { width: "20", height: "20", rx: "4", fill: "#594DE8" }),
            /* @__PURE__ */ jsx(
              "path",
              {
                d: "M14.2839 6.39844L15.1091 7.22363L15.197 7.3125L8.92163 13.5879L8.83276 13.6758L8.74487 13.5879L5.03198 9.87598L4.94409 9.78711L5.94604 8.78516L6.03394 8.87402L8.83276 11.6719L14.1072 6.39844L14.1951 6.31055L14.2839 6.39844Z",
                fill: "white",
                stroke: "white",
                strokeWidth: "0.25"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "checkbox_checked_clip0_3824_2208", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Box, { className: "checkbox-checked-disable", sx: { display: "none" }, children: /* @__PURE__ */ jsxs(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        children: [
          /* @__PURE__ */ jsxs("g", { clipPath: "url(#clip0_3824_2241)", children: [
            /* @__PURE__ */ jsx("rect", { x: "0.5", y: "0.5", width: "19", height: "19", rx: "3.5", fill: "#F0F4F8", stroke: "#CDD7E1" }),
            /* @__PURE__ */ jsx(
              "path",
              {
                d: "M14.2839 6.39844L15.1091 7.22363L15.197 7.3125L8.92163 13.5879L8.83276 13.6758L8.74487 13.5879L5.03198 9.87598L4.94409 9.78711L5.94604 8.78516L6.03394 8.87402L8.83276 11.6719L14.1072 6.39844L14.1951 6.31055L14.2839 6.39844Z",
                fill: "#CDD7E1",
                stroke: "#CDD7E1",
                strokeWidth: "0.25"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "checkbox_checked_disable_clip0_3824_2241", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
        ]
      }
    ) })
  ] });
};
var CheckboxDefaultIcon = () => {
  return /* @__PURE__ */ jsxs(Stack, { children: [
    /* @__PURE__ */ jsx(Stack, { className: "checkbox-default", children: /* @__PURE__ */ jsxs(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        children: [
          /* @__PURE__ */ jsx("g", { clipPath: "url(#clip0_3794_15414)", children: /* @__PURE__ */ jsx(
            "rect",
            {
              className: "checkbox-default",
              x: "0.5",
              y: "0.5",
              width: "19",
              height: "19",
              rx: "3.5",
              fill: "white",
              stroke: "#CDD7E1"
            }
          ) }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "checkbox_default_clip0_3794_15414", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Box, { className: "checkbox-default-disable", sx: { display: "none" }, children: /* @__PURE__ */ jsxs(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        children: [
          /* @__PURE__ */ jsx("g", { clipPath: "url(#clip0_3824_2241)", children: /* @__PURE__ */ jsx("rect", { x: "0.5", y: "0.5", width: "19", height: "19", rx: "3.5", fill: "#F0F4F8", stroke: "#CDD7E1" }) }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "checkbox_default_disable_clip0_3824_2241", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
        ]
      }
    ) })
  ] });
};
function OverrideCheckbox(theme) {
  const { grey: grey2, primary: primary2 } = theme.palette;
  return {
    defaultProps: {
      disableRipple: true,
      disableTouchRipple: true,
      disableFocusRipple: true,
      size: "medium",
      icon: /* @__PURE__ */ jsx(CheckboxDefaultIcon, {}),
      checkedIcon: /* @__PURE__ */ jsx(CheckboxCheckedIcon, {}),
      indeterminateIcon: /* @__PURE__ */ jsx(CheckboxIndeterminateIcon, {})
    },
    styleOverrides: {
      root: {
        borderRadius: "8px",
        color: grey2[300],
        // hover: default / circle-default
        "&:hover svg rect.checkbox-default": {
          fill: primary2[100],
          stroke: primary2[500]
        },
        "&:hover svg rect.checkbox-circle-default": {
          fill: primary2[100],
          stroke: primary2[500]
        },
        // disabled states
        "&.Mui-disabled": {
          ".checkbox-default-disable, .checkbox-indeterminate-disable, .checkbox-checked-disable, .checkbox-circle-default-disable, .checkbox-circle-checked-disable": {
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
          },
          ".checkbox-indeterminate, .checkbox-checked, .checkbox-default, .checkbox-circle-default, .checkbox-circle-checked": {
            display: "none"
          }
        },
        "&.MuiCheckbox-sizeSmall": {
          padding: "8px",
          ".MuiSvgIcon-root, .icon": {
            fontSize: "16px",
            width: "16px",
            height: "16px"
          }
        },
        "&.MuiCheckbox-sizeMedium": {
          padding: "8px",
          ".MuiSvgIcon-root, .icon": {
            fontSize: "24px",
            width: "24px",
            height: "24px"
          }
        },
        "&.MuiCheckbox-sizeLarge": {
          padding: "12px",
          ".MuiSvgIcon-root, .icon": {
            fontSize: "32px",
            width: "32px",
            height: "32px"
          }
        }
      }
    }
  };
}
function OverrideChip(theme) {
  const { grey: grey2, primary: primary2, success: success2, error: error2, warning: warning2, info: info2, common } = theme.palette;
  const white = common.white;
  return {
    defaultProps: {
      deleteIcon: /* @__PURE__ */ jsx(P7, { size: 16 }),
      variant: "filled",
      size: "medium",
      color: "primary"
    },
    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: 6,
        "& .MuiChip-deleteIcon": {
          fontSize: 16,
          margin: 0,
          marginLeft: 4
        },
        "& .MuiChip-icon": {
          marginLeft: 0,
          marginRight: 4
        }
      },
      sizeSmall: {
        height: 20,
        fontSize: 12,
        lineHeight: "16px",
        padding: "2px 8px",
        "& .MuiChip-label": {
          padding: 0
        },
        "& .MuiChip-icon": {
          fontSize: 14,
          width: 14,
          height: 14
        },
        "& .MuiChip-deleteIcon": {
          fontSize: 14,
          width: 14,
          height: 14,
          marginLeft: 4
        }
      },
      sizeMedium: {
        height: 24,
        fontSize: 13,
        lineHeight: "18px",
        padding: "3px 10px",
        "& .MuiChip-label": {
          padding: 0
        },
        "& .MuiChip-icon": {
          fontSize: 16,
          width: 16,
          height: 16
        },
        "& .MuiChip-deleteIcon": {
          fontSize: 16,
          width: 16,
          height: 16,
          marginLeft: 4
        }
      },
      label: {
        padding: 0
      }
    },
    variants: [
      // =====================
      // PRIMARY
      // =====================
      {
        props: { variant: "filled", color: "primary" },
        style: {
          backgroundColor: primary2[500],
          color: white,
          "&:hover": { backgroundColor: primary2[600] },
          "&:active": { backgroundColor: primary2[700] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: white,
            opacity: 0.8,
            "&:hover": {
              color: white,
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "primary" },
        style: {
          backgroundColor: primary2[50],
          color: primary2[700],
          "&:hover": { backgroundColor: primary2[100] },
          "&:active": { backgroundColor: primary2[200], color: primary2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: primary2[700],
            opacity: 0.7,
            "&:hover": {
              color: primary2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "primary" },
        style: {
          backgroundColor: "transparent",
          borderColor: primary2[300],
          color: primary2[600],
          "&:hover": {
            backgroundColor: primary2[50],
            borderColor: primary2[400]
          },
          "&:active": {
            backgroundColor: primary2[100],
            borderColor: primary2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: primary2[600],
            opacity: 0.7,
            "&:hover": {
              color: primary2[700],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "primary" },
        style: {
          backgroundColor: "transparent",
          color: primary2[600],
          "&:hover": { backgroundColor: primary2[50] },
          "&:active": { backgroundColor: primary2[100] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: primary2[600],
            opacity: 0.7,
            "&:hover": {
              color: primary2[700],
              opacity: 1
            }
          }
        }
      },
      // =====================
      // SECONDARY / NEUTRAL
      // =====================
      {
        props: { variant: "filled", color: "secondary" },
        style: {
          backgroundColor: grey2[700],
          color: white,
          "&:hover": { backgroundColor: grey2[800] },
          "&:active": { backgroundColor: grey2[900] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: white,
            opacity: 0.8,
            "&:hover": {
              color: white,
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "secondary" },
        style: {
          backgroundColor: grey2[100],
          color: grey2[700],
          "&:hover": { backgroundColor: grey2[200] },
          "&:active": { backgroundColor: grey2[300], color: grey2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[700],
            opacity: 0.7,
            "&:hover": {
              color: grey2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "secondary" },
        style: {
          backgroundColor: "transparent",
          borderColor: grey2[300],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[50],
            borderColor: grey2[400]
          },
          "&:active": {
            backgroundColor: grey2[100],
            borderColor: grey2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[700],
            opacity: 0.7,
            "&:hover": {
              color: grey2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "secondary" },
        style: {
          backgroundColor: "transparent",
          color: grey2[700],
          "&:hover": { backgroundColor: grey2[100] },
          "&:active": { backgroundColor: grey2[200] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[700],
            opacity: 0.7,
            "&:hover": {
              color: grey2[800],
              opacity: 1
            }
          }
        }
      },
      // =====================
      // NEUTRAL (Alternative)
      // =====================
      {
        props: { variant: "filled", color: "neutral" },
        style: {
          backgroundColor: grey2[700],
          color: white,
          "&:hover": { backgroundColor: grey2[800] },
          "&:active": { backgroundColor: grey2[900] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: white,
            opacity: 0.8,
            "&:hover": {
              color: white,
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "neutral" },
        style: {
          backgroundColor: grey2[100],
          color: grey2[700],
          "&:hover": { backgroundColor: grey2[200] },
          "&:active": { backgroundColor: grey2[300], color: grey2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[700],
            opacity: 0.7,
            "&:hover": {
              color: grey2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "neutral" },
        style: {
          backgroundColor: "transparent",
          borderColor: grey2[300],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[50],
            borderColor: grey2[400]
          },
          "&:active": {
            backgroundColor: grey2[100],
            borderColor: grey2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[700],
            opacity: 0.7,
            "&:hover": {
              color: grey2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "neutral" },
        style: {
          backgroundColor: "transparent",
          color: grey2[700],
          "&:hover": { backgroundColor: grey2[100] },
          "&:active": { backgroundColor: grey2[200] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[700],
            opacity: 0.7,
            "&:hover": {
              color: grey2[800],
              opacity: 1
            }
          }
        }
      },
      // =====================
      // SUCCESS
      // =====================
      {
        props: { variant: "filled", color: "success" },
        style: {
          backgroundColor: success2[500],
          color: white,
          "&:hover": { backgroundColor: success2[600] },
          "&:active": { backgroundColor: success2[700] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: white,
            opacity: 0.8,
            "&:hover": {
              color: white,
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "success" },
        style: {
          backgroundColor: success2[50],
          color: success2[700],
          "&:hover": { backgroundColor: success2[100] },
          "&:active": { backgroundColor: success2[200], color: success2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: success2[700],
            opacity: 0.7,
            "&:hover": {
              color: success2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "success" },
        style: {
          backgroundColor: "transparent",
          borderColor: success2[300],
          color: success2[600],
          "&:hover": {
            backgroundColor: success2[50],
            borderColor: success2[400]
          },
          "&:active": {
            backgroundColor: success2[100],
            borderColor: success2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: success2[600],
            opacity: 0.7,
            "&:hover": {
              color: success2[700],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "success" },
        style: {
          backgroundColor: "transparent",
          color: success2[600],
          "&:hover": { backgroundColor: success2[50] },
          "&:active": { backgroundColor: success2[100] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: success2[600],
            opacity: 0.7,
            "&:hover": {
              color: success2[700],
              opacity: 1
            }
          }
        }
      },
      // =====================
      // ERROR
      // =====================
      {
        props: { variant: "filled", color: "error" },
        style: {
          backgroundColor: error2[500],
          color: white,
          "&:hover": { backgroundColor: error2[600] },
          "&:active": { backgroundColor: error2[700] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: white,
            opacity: 0.8,
            "&:hover": {
              color: white,
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "error" },
        style: {
          backgroundColor: error2[50],
          color: error2[700],
          "&:hover": { backgroundColor: error2[100] },
          "&:active": { backgroundColor: error2[200], color: error2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: error2[700],
            opacity: 0.7,
            "&:hover": {
              color: error2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "error" },
        style: {
          backgroundColor: "transparent",
          borderColor: error2[300],
          color: error2[600],
          "&:hover": {
            backgroundColor: error2[50],
            borderColor: error2[400]
          },
          "&:active": {
            backgroundColor: error2[100],
            borderColor: error2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: error2[600],
            opacity: 0.7,
            "&:hover": {
              color: error2[700],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "error" },
        style: {
          backgroundColor: "transparent",
          color: error2[600],
          "&:hover": { backgroundColor: error2[50] },
          "&:active": { backgroundColor: error2[100] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: error2[600],
            opacity: 0.7,
            "&:hover": {
              color: error2[700],
              opacity: 1
            }
          }
        }
      },
      // =====================
      // WARNING
      // =====================
      {
        props: { variant: "filled", color: "warning" },
        style: {
          backgroundColor: warning2[400],
          color: grey2[900],
          "&:hover": { backgroundColor: warning2[500] },
          "&:active": { backgroundColor: warning2[600] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: grey2[900],
            opacity: 0.7,
            "&:hover": {
              color: grey2[900],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "warning" },
        style: {
          backgroundColor: warning2[50],
          color: warning2[700],
          "&:hover": { backgroundColor: warning2[100] },
          "&:active": { backgroundColor: warning2[200], color: warning2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: warning2[700],
            opacity: 0.7,
            "&:hover": {
              color: warning2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "warning" },
        style: {
          backgroundColor: "transparent",
          borderColor: warning2[300],
          color: warning2[600],
          "&:hover": {
            backgroundColor: warning2[50],
            borderColor: warning2[400]
          },
          "&:active": {
            backgroundColor: warning2[100],
            borderColor: warning2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: warning2[600],
            opacity: 0.7,
            "&:hover": {
              color: warning2[700],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "warning" },
        style: {
          backgroundColor: "transparent",
          color: warning2[600],
          "&:hover": { backgroundColor: warning2[50] },
          "&:active": { backgroundColor: warning2[100] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: warning2[600],
            opacity: 0.7,
            "&:hover": {
              color: warning2[700],
              opacity: 1
            }
          }
        }
      },
      // =====================
      // INFO
      // =====================
      {
        props: { variant: "filled", color: "info" },
        style: {
          backgroundColor: info2[500],
          color: white,
          "&:hover": { backgroundColor: info2[600] },
          "&:active": { backgroundColor: info2[700] },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: white,
            opacity: 0.8,
            "&:hover": {
              color: white,
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "soft", color: "info" },
        style: {
          backgroundColor: info2[50],
          color: info2[700],
          "&:hover": { backgroundColor: info2[100] },
          "&:active": { backgroundColor: info2[200], color: info2[800] },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: info2[700],
            opacity: 0.7,
            "&:hover": {
              color: info2[800],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "outlined", color: "info" },
        style: {
          backgroundColor: "transparent",
          borderColor: info2[300],
          color: info2[600],
          "&:hover": {
            backgroundColor: info2[50],
            borderColor: info2[400]
          },
          "&:active": {
            backgroundColor: info2[100],
            borderColor: info2[500]
          },
          "&.Mui-disabled": {
            borderColor: grey2[200],
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: info2[600],
            opacity: 0.7,
            "&:hover": {
              color: info2[700],
              opacity: 1
            }
          }
        }
      },
      {
        props: { variant: "text", color: "info" },
        style: {
          backgroundColor: "transparent",
          color: info2[600],
          "&:hover": { backgroundColor: info2[50] },
          "&:active": { backgroundColor: info2[100] },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: grey2[400]
          },
          "& .MuiChip-deleteIcon": {
            color: info2[600],
            opacity: 0.7,
            "&:hover": {
              color: info2[700],
              opacity: 1
            }
          }
        }
      }
    ]
  };
}

// src/components/OverrideFormControlLabel.ts
function OverrideFormControlLabel(theme) {
  return {
    styleOverrides: {
      root: {
        "&.with-checkbox": {
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: theme.palette.grey[100]
          },
          "&.checked": {
            backgroundColor: theme.palette.primary[100]
          }
        }
      }
    }
  };
}

// src/components/OverrideFormHelperText.ts
function OverrideFormHelperText(theme) {
  return {
    styleOverrides: {
      root: {
        ...theme.typography.textXs
      }
    }
  };
}

// src/components/OverrideFormLabel.ts
function OverrideFormLabel() {
  return {
    styleOverrides: {
      root: {
        "&.Mui-required": {
          position: "relative",
          paddingLeft: "8px",
          ".MuiFormLabel-asterisk": {
            position: "absolute",
            left: 0
          }
        }
      }
    }
  };
}
var focusRing2 = (color) => ({
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    boxShadow: `0 0 0 4px ${alpha(color, 0.25)}`,
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 0.2s"
  },
  "&:focus-visible::after": {
    opacity: 1
  },
  "&:active::after": {
    opacity: 0
  }
});
function OverrideIconButton(theme) {
  const { grey: grey2, primary: primary2, common, success: success2, error: error2, warning: warning2, info: info2 } = theme.palette;
  const white = common.white;
  return {
    defaultProps: {
      color: "primary",
      size: "medium"
    },
    styleOverrides: {
      root: {
        position: "relative",
        padding: 0,
        minWidth: "auto",
        overflow: "hidden",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "transparent",
        borderRadius: 8,
        transition: "all 0.2s ease-in-out"
      }
    },
    variants: [
      // =====================
      // SIZES
      // =====================
      {
        props: { size: "xs" },
        style: {
          width: 28,
          height: 28,
          borderRadius: 6,
          "& .MuiSvgIcon-root": {
            fontSize: 16
          }
        }
      },
      {
        props: { size: "small" },
        style: {
          width: 32,
          height: 32,
          borderRadius: 6,
          "& .MuiSvgIcon-root": {
            fontSize: 18
          }
        }
      },
      {
        props: { size: "medium" },
        style: {
          width: 40,
          height: 40,
          borderRadius: 8,
          "& .MuiSvgIcon-root": {
            fontSize: 20
          }
        }
      },
      {
        props: { size: "large" },
        style: {
          width: 48,
          height: 48,
          borderRadius: 10,
          "& .MuiSvgIcon-root": {
            fontSize: 24
          }
        }
      },
      {
        props: { size: "xl" },
        style: {
          width: 56,
          height: 56,
          borderRadius: 12,
          "& .MuiSvgIcon-root": {
            fontSize: 28
          }
        }
      },
      // =====================
      // PRIMARY - CONTAINED (Default)
      // =====================
      {
        props: { color: "primary" },
        style: {
          backgroundColor: primary2[500],
          color: white,
          "&:hover": {
            backgroundColor: primary2[600]
          },
          "&:active": {
            backgroundColor: primary2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: primary2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(primary2[500])
        }
      },
      {
        props: { color: "primary", variant: "contained" },
        style: {
          backgroundColor: primary2[500],
          color: white,
          "&:hover": {
            backgroundColor: primary2[600]
          },
          "&:active": {
            backgroundColor: primary2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: primary2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(primary2[500])
        }
      },
      {
        props: { color: "primary", variant: "soft" },
        style: {
          backgroundColor: primary2[50],
          color: primary2[600],
          "&:hover": {
            backgroundColor: primary2[100],
            color: primary2[700]
          },
          "&:active": {
            backgroundColor: primary2[200],
            color: primary2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: primary2[50],
            color: primary2[300]
          },
          ...focusRing2(primary2[200])
        }
      },
      {
        props: { color: "primary", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: primary2[500],
          borderColor: primary2[500],
          "&:hover": {
            backgroundColor: primary2[50],
            borderColor: primary2[600],
            color: primary2[600]
          },
          "&:active": {
            backgroundColor: primary2[100],
            borderColor: primary2[700],
            color: primary2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: primary2[200],
            color: primary2[200]
          },
          ...focusRing2(primary2[200])
        }
      },
      // =====================
      // SECONDARY - CONTAINED
      // =====================
      {
        props: { color: "secondary" },
        style: {
          backgroundColor: grey2[700],
          color: white,
          "&:hover": {
            backgroundColor: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[300],
            color: grey2[500]
          },
          ...focusRing2(grey2[600])
        }
      },
      {
        props: { color: "secondary", variant: "contained" },
        style: {
          backgroundColor: grey2[700],
          color: white,
          "&:hover": {
            backgroundColor: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[300],
            color: grey2[500]
          },
          ...focusRing2(grey2[600])
        }
      },
      {
        props: { color: "secondary", variant: "soft" },
        style: {
          backgroundColor: grey2[100],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[200],
            color: grey2[800]
          },
          "&:active": {
            backgroundColor: grey2[300],
            color: grey2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          ...focusRing2(grey2[200])
        }
      },
      {
        props: { color: "secondary", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: grey2[600],
          borderColor: grey2[300],
          "&:hover": {
            backgroundColor: grey2[50],
            borderColor: grey2[400],
            color: grey2[700]
          },
          "&:active": {
            backgroundColor: grey2[100],
            borderColor: grey2[500],
            color: grey2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: grey2[200],
            color: grey2[300]
          },
          ...focusRing2(grey2[200])
        }
      },
      // =====================
      // NEUTRAL (Light grey)
      // =====================
      {
        props: { color: "neutral" },
        style: {
          backgroundColor: grey2[200],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[300]
          },
          "&:active": {
            backgroundColor: grey2[400]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          ...focusRing2(grey2[300])
        }
      },
      {
        props: { color: "neutral", variant: "contained" },
        style: {
          backgroundColor: grey2[200],
          color: grey2[700],
          "&:hover": {
            backgroundColor: grey2[300]
          },
          "&:active": {
            backgroundColor: grey2[400]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[100],
            color: grey2[400]
          },
          ...focusRing2(grey2[300])
        }
      },
      {
        props: { color: "neutral", variant: "soft" },
        style: {
          backgroundColor: grey2[50],
          color: grey2[600],
          "&:hover": {
            backgroundColor: grey2[100],
            color: grey2[700]
          },
          "&:active": {
            backgroundColor: grey2[200],
            color: grey2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: grey2[50],
            color: grey2[300]
          },
          ...focusRing2(grey2[100])
        }
      },
      {
        props: { color: "neutral", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: grey2[600],
          borderColor: grey2[200],
          "&:hover": {
            backgroundColor: grey2[50],
            borderColor: grey2[300]
          },
          "&:active": {
            backgroundColor: grey2[100],
            borderColor: grey2[400]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: grey2[100],
            color: grey2[300]
          },
          ...focusRing2(grey2[100])
        }
      },
      // =====================
      // SUCCESS (Green)
      // =====================
      {
        props: { color: "success" },
        style: {
          backgroundColor: success2[500],
          color: white,
          "&:hover": {
            backgroundColor: success2[600]
          },
          "&:active": {
            backgroundColor: success2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: success2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(success2[500])
        }
      },
      {
        props: { color: "success", variant: "contained" },
        style: {
          backgroundColor: success2[500],
          color: white,
          "&:hover": {
            backgroundColor: success2[600]
          },
          "&:active": {
            backgroundColor: success2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: success2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(success2[500])
        }
      },
      {
        props: { color: "success", variant: "soft" },
        style: {
          backgroundColor: success2[50],
          color: success2[600],
          "&:hover": {
            backgroundColor: success2[100],
            color: success2[700]
          },
          "&:active": {
            backgroundColor: success2[200],
            color: success2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: success2[50],
            color: success2[300]
          },
          ...focusRing2(success2[200])
        }
      },
      {
        props: { color: "success", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: success2[500],
          borderColor: success2[500],
          "&:hover": {
            backgroundColor: success2[50],
            borderColor: success2[600],
            color: success2[600]
          },
          "&:active": {
            backgroundColor: success2[100],
            borderColor: success2[700],
            color: success2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: success2[200],
            color: success2[200]
          },
          ...focusRing2(success2[200])
        }
      },
      // =====================
      // ERROR (Red)
      // =====================
      {
        props: { color: "error" },
        style: {
          backgroundColor: error2[500],
          color: white,
          "&:hover": {
            backgroundColor: error2[600]
          },
          "&:active": {
            backgroundColor: error2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: error2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(error2[500])
        }
      },
      {
        props: { color: "error", variant: "contained" },
        style: {
          backgroundColor: error2[500],
          color: white,
          "&:hover": {
            backgroundColor: error2[600]
          },
          "&:active": {
            backgroundColor: error2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: error2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(error2[500])
        }
      },
      {
        props: { color: "error", variant: "soft" },
        style: {
          backgroundColor: error2[50],
          color: error2[600],
          "&:hover": {
            backgroundColor: error2[100],
            color: error2[700]
          },
          "&:active": {
            backgroundColor: error2[200],
            color: error2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: error2[50],
            color: error2[300]
          },
          ...focusRing2(error2[200])
        }
      },
      {
        props: { color: "error", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: error2[500],
          borderColor: error2[500],
          "&:hover": {
            backgroundColor: error2[50],
            borderColor: error2[600],
            color: error2[600]
          },
          "&:active": {
            backgroundColor: error2[100],
            borderColor: error2[700],
            color: error2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: error2[200],
            color: error2[200]
          },
          ...focusRing2(error2[200])
        }
      },
      // =====================
      // WARNING (Yellow)
      // =====================
      {
        props: { color: "warning" },
        style: {
          backgroundColor: warning2[400],
          color: grey2[900],
          "&:hover": {
            backgroundColor: warning2[500]
          },
          "&:active": {
            backgroundColor: warning2[600]
          },
          "&.Mui-disabled": {
            backgroundColor: warning2[200],
            color: grey2[400]
          },
          ...focusRing2(warning2[400])
        }
      },
      {
        props: { color: "warning", variant: "contained" },
        style: {
          backgroundColor: warning2[400],
          color: grey2[900],
          "&:hover": {
            backgroundColor: warning2[500]
          },
          "&:active": {
            backgroundColor: warning2[600]
          },
          "&.Mui-disabled": {
            backgroundColor: warning2[200],
            color: grey2[400]
          },
          ...focusRing2(warning2[400])
        }
      },
      {
        props: { color: "warning", variant: "soft" },
        style: {
          backgroundColor: warning2[50],
          color: warning2[700],
          "&:hover": {
            backgroundColor: warning2[100],
            color: warning2[800]
          },
          "&:active": {
            backgroundColor: warning2[200],
            color: warning2[900]
          },
          "&.Mui-disabled": {
            backgroundColor: warning2[50],
            color: warning2[300]
          },
          ...focusRing2(warning2[200])
        }
      },
      {
        props: { color: "warning", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: warning2[600],
          borderColor: warning2[400],
          "&:hover": {
            backgroundColor: warning2[50],
            borderColor: warning2[500],
            color: warning2[700]
          },
          "&:active": {
            backgroundColor: warning2[100],
            borderColor: warning2[600],
            color: warning2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: warning2[200],
            color: warning2[200]
          },
          ...focusRing2(warning2[200])
        }
      },
      // =====================
      // INFO (Teal)
      // =====================
      {
        props: { color: "info" },
        style: {
          backgroundColor: info2[500],
          color: white,
          "&:hover": {
            backgroundColor: info2[600]
          },
          "&:active": {
            backgroundColor: info2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: info2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(info2[500])
        }
      },
      {
        props: { color: "info", variant: "contained" },
        style: {
          backgroundColor: info2[500],
          color: white,
          "&:hover": {
            backgroundColor: info2[600]
          },
          "&:active": {
            backgroundColor: info2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: info2[200],
            color: white,
            opacity: 0.7
          },
          ...focusRing2(info2[500])
        }
      },
      {
        props: { color: "info", variant: "soft" },
        style: {
          backgroundColor: info2[50],
          color: info2[600],
          "&:hover": {
            backgroundColor: info2[100],
            color: info2[700]
          },
          "&:active": {
            backgroundColor: info2[200],
            color: info2[800]
          },
          "&.Mui-disabled": {
            backgroundColor: info2[50],
            color: info2[300]
          },
          ...focusRing2(info2[200])
        }
      },
      {
        props: { color: "info", variant: "outlined" },
        style: {
          backgroundColor: "transparent",
          color: info2[500],
          borderColor: info2[500],
          "&:hover": {
            backgroundColor: info2[50],
            borderColor: info2[600],
            color: info2[600]
          },
          "&:active": {
            backgroundColor: info2[100],
            borderColor: info2[700],
            color: info2[700]
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            borderColor: info2[200],
            color: info2[200]
          },
          ...focusRing2(info2[200])
        }
      }
    ]
  };
}

// src/components/OverrideInputLabel.ts
function OverrideInputLabel(theme) {
  return {
    styleOverrides: {
      root: {
        fontSize: "12px",
        lineHeight: "15px",
        color: theme.palette.grey[500],
        transform: "none",
        marginBottom: "4px"
      }
    }
  };
}

// src/components/OverrideLinearProgress.ts
function OverrideLinearProgress(theme) {
  return {
    styleOverrides: {
      root: {
        height: 6,
        borderRadius: 100,
        backgroundColor: theme.palette.grey[200]
      },
      bar: {
        borderRadius: 100
      }
    }
  };
}

// src/components/OverrideLink.ts
function OverrideLink() {
  return {
    defaultProps: {
      underline: "none"
    },
    styleOverrides: {
      root: {
        cursor: "pointer"
      }
    }
  };
}

// src/components/OverrideListItemIcon.ts
function OverrideListItemIcon() {
  return {
    styleOverrides: {
      root: {
        minWidth: 24
      }
    }
  };
}

// src/components/OverrideMenuItem.ts
function OverrideMenuItem() {
  return {
    styleOverrides: {
      root: {
        fontSize: "inherit",
        minHeight: "40px"
      }
    }
  };
}

// src/components/OverrideMuiSelect.ts
function OverrideMuiSelect() {
  return {
    defaultProps: {
      IconComponent: f1
    }
  };
}

// src/components/OverrideOutlinedInput.ts
function OverrideOutlinedInput(theme) {
  function baseInputStyle() {
    const { textSm: fontStyleBodySm } = theme.typography;
    const { grey: grey2, error: error2, primary: primary2, background } = theme.palette;
    const { sm: radiusSm } = theme.radius;
    const { focusPrimary100, focusError100 } = theme.shadowCustom;
    const inputBackgroundColor = background.paper;
    return {
      ...fontStyleBodySm,
      fontWeight: 500,
      color: grey2[700],
      ":not(.Mui-error):not(.Mui-readOnly):hover, &.Mui-focused": {
        input: {
          "&::placeholder": {
            color: grey2[700]
          }
        },
        textarea: {
          "&::placeholder": {
            color: grey2[700]
          }
        },
        fieldset: {
          borderColor: `${grey2[200]}`
        }
      },
      input: {
        backgroundColor: inputBackgroundColor,
        borderRadius: radiusSm,
        padding: "10px 16px",
        "&::placeholder": {
          ...fontStyleBodySm,
          color: grey2[500],
          opacity: 1
        }
      },
      textarea: {
        backgroundColor: inputBackgroundColor,
        borderRadius: radiusSm,
        padding: "10px 16px",
        "&::placeholder": {
          ...fontStyleBodySm,
          color: grey2[500],
          opacity: 1
        }
      },
      fieldset: {
        border: "1px solid",
        borderColor: grey2[200],
        borderRadius: radiusSm
      },
      "&.Mui-error": {
        fieldset: {
          borderColor: `${error2[300]}`
        },
        svg: {
          color: `${error2[500]}`
        }
      },
      "&.Mui-focused.Mui-error": {
        fieldset: {
          borderColor: `${error2[300]}`,
          borderWidth: "1px ",
          boxShadow: focusError100
        },
        svg: {
          color: `${error2[500]}`
        }
      },
      '&.Mui-focused:not(.Mui-readOnly) input[aria-invalid="false"] ~ fieldset': {
        borderColor: `${primary2[300]}`,
        borderWidth: "1px",
        boxShadow: focusPrimary100
      },
      '&.Mui-focused:not(.Mui-readOnly) textarea[aria-invalid="false"] ~ fieldset': {
        borderColor: `${primary2[300]}`,
        borderWidth: "1px ",
        boxShadow: focusPrimary100
      },
      "&.Mui-readOnly, &.Mui-readOnly.Mui-focused": {
        backgroundColor: `${grey2[100]}`,
        input: {
          backgroundColor: `${grey2[100]}`
        },
        textarea: {
          backgroundColor: `${grey2[100]}`
        },
        fieldset: {
          borderColor: `${grey2[200]}`,
          borderWidth: "1px"
        }
      }
    };
  }
  function textAreaStyle() {
    return {
      "&.MuiInputBase-multiline": {
        padding: 0
      }
    };
  }
  return {
    styleOverrides: {
      root: {
        ...baseInputStyle(),
        ...textAreaStyle()
      }
    }
  };
}

// src/components/OverridePagination.ts
function OverridePagination(theme) {
  const { grey: grey2, common } = theme.palette;
  const white = common.white;
  const typographyVariants = theme.typography;
  return {
    styleOverrides: {
      root: {
        fontSize: "14px",
        lineHeight: "20px",
        ".MuiPagination-ul": {
          flexDirection: "row",
          gap: "6px"
        },
        ".MuiPaginationItem-root.Mui-selected": {
          backgroundColor: `${grey2[700]} !important`,
          color: `${white} !important`,
          minWidth: "26px !important",
          height: "26px !important",
          justifyContent: "center !important",
          alignItems: "center !important",
          borderRadius: "4px !important",
          border: "1px solid !important",
          borderColor: `${grey2[700]} !important`,
          padding: "2px !important"
        },
        ".MuiPaginationItem-root:not(.Mui-selected ):not(.MuiPaginationItem-ellipsis):not(.MuiPaginationItem-previousNext)": {
          backgroundColor: `${white} !important`,
          color: `${grey2[700]} !important`,
          minWidth: "26px !important",
          height: "26px !important",
          border: `1px solid ${grey2[100]} !important`,
          borderRadius: "4px !important",
          padding: "2px !important",
          "&:hover": {
            backgroundColor: `${grey2[700]} !important`,
            color: `${white} !important`,
            borderColor: `${grey2[700]} !important`
          }
        },
        ".MuiPaginationItem-previousNext": {
          minWidth: "26px !important",
          height: "26px !important",
          borderRadius: "4px !important",
          "&:hover": {
            backgroundColor: `${grey2[700]} !important`,
            color: `${white} !important`,
            borderColor: `${grey2[700]} !important`
          }
        },
        ".MuiPaginationItem-root.MuiPaginationItem-ellipsis.MuiPaginationItem-circular": {
          padding: "0px 3px !important",
          minWidth: "26px !important",
          height: "26px !important",
          textAlign: "center",
          lineHeight: 1,
          color: `${grey2[500]} !important`
        },
        ".MuiTablePagination-selectLabel": {
          ...typographyVariants.textSm
        },
        ".MuiTablePagination-select": {
          ...typographyVariants.textSm
        },
        ".MuiTablePagination-displayedRows": {
          ...typographyVariants.textSm
        }
      }
    }
  };
}

// src/components/OverridePaper.ts
function OverridePaper() {
  return {
    defaultProps: {
      elevation: 3
    },
    styleOverrides: {
      root: {
        boxShadow: "none"
      }
    }
  };
}
var RadioDefaultIcon = () => {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", children: [
    /* @__PURE__ */ jsx("g", { clipPath: "url(#clip0_3824_2261)", children: /* @__PURE__ */ jsx("rect", { x: "0.5", y: "0.5", width: "19", height: "19", rx: "9.5", fill: "white", stroke: "#CDD7E1" }) }),
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_3824_2261", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
  ] });
};
var RadioCheckedIcon = () => {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", children: [
    /* @__PURE__ */ jsx("g", { clipPath: "url(#clip0_3824_2263)", children: /* @__PURE__ */ jsx(
      "path",
      {
        d: "M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 12.7614 12.7614 15 10 15Z",
        fill: "#594DE8"
      }
    ) }),
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_3824_2263", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
  ] });
};
function OverrideRadio(theme) {
  const { palette } = theme;
  return {
    defaultProps: {
      disableRipple: true,
      disableTouchRipple: true,
      disableFocusRipple: true,
      size: "medium",
      icon: /* @__PURE__ */ jsx(RadioDefaultIcon, {}),
      checkedIcon: /* @__PURE__ */ jsx(RadioCheckedIcon, {})
    },
    styleOverrides: {
      root: {
        borderRadius: "8px",
        color: palette.grey[300],
        "&:hover svg rect.radio-default": {
          fill: "#DDDBF9",
          stroke: "#594DE8"
        },
        "&.Mui-disabled .radio-default-disable": {
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        },
        "&.Mui-disabled .radio-checked-disable": {
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        },
        "&.Mui-disabled .radio-default": {
          display: "none"
        },
        "&.Mui-disabled .radio-checked": {
          display: "none"
        },
        "&.MuiRadio-sizeSmall": {
          padding: "8px",
          ".MuiSvgIcon-root, .icon": {
            fontSize: "16px",
            width: "16px",
            height: "16px"
          }
        },
        "&.MuiRadio-sizeMedium": {
          padding: "8px",
          ".MuiSvgIcon-root, .icon": {
            fontSize: "24px",
            width: "24px",
            height: "24px"
          }
        },
        "&.MuiRadio-sizeLarge": {
          padding: "12px",
          ".MuiSvgIcon-root, .icon": {
            fontSize: "32px",
            width: "32px",
            height: "32px"
          }
        }
      }
    }
  };
}

// src/components/OverrideStepper.ts
function OverrideStepper() {
  return {
    styleOverrides: {
      root: {
        ".MuiStepLabel-iconContainer": {
          ".MuiStepIcon-text": {
            fontSize: "12px"
          },
          ".Mui-completed": {
            width: "22px",
            height: "22px"
          }
        }
      }
    }
  };
}

// src/components/OverrideSwitch.tsx
function OverrideSwitch(theme) {
  return {
    styleOverrides: {
      root: {
        width: 36,
        height: 20,
        padding: 0,
        borderRadius: 12,
        display: "flex",
        position: "relative",
        "&:has(.MuiSwitch-switchBase.Mui-disabled)": {
          pointerEvents: "none"
        },
        "&:active": {
          "& .MuiSwitch-thumb": {
            width: 18
          },
          "& .MuiSwitch-switchBase.Mui-checked": {
            transform: "translateX(16px)"
          }
        },
        "& .MuiSwitch-switchBase": {
          padding: 2,
          "&.Mui-checked": {
            transform: "translateX(16px)",
            color: "#fff",
            "&.Mui-disabled": {
              color: "#fff"
            },
            "& + .MuiSwitch-track": {
              opacity: 1,
              backgroundColor: theme.palette.primary["500"],
              ...theme.applyStyles("dark", {
                backgroundColor: theme.palette.grey["300"]
              })
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              backgroundColor: theme.palette.grey["200"]
            }
          },
          "&.Mui-disabled": {
            color: theme.palette.grey[200],
            "& + .MuiSwitch-track": {
              backgroundColor: theme.palette.grey[200],
              opacity: 1
            }
          }
        },
        "& .MuiSwitch-thumb": {
          boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
          width: 16,
          height: 16,
          borderRadius: 16,
          transition: theme.transitions.create(["width"], {
            duration: 200
          })
        },
        "& .MuiSwitch-track": {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor: theme.palette.grey["100"],
          boxSizing: "border-box",
          ...theme.applyStyles("dark", {
            backgroundColor: "rgba(255,255,255,.35)"
          })
        }
      }
    }
  };
}

// src/components/OverrideTab.ts
function OverrideTab(theme) {
  return {
    styleOverrides: {
      root: {
        padding: "4px 8px",
        minHeight: "auto",
        borderRadius: "6px 6px 0 0",
        zIndex: 1,
        fontSize: "14px",
        lineHeight: "20px",
        minWidth: "fit-content",
        "&.Mui-selected": {
          fontWeight: "700",
          backgroundColor: "rgba(89,77,232, 0.1)",
          borderBottom: `2px solid ${theme.palette.primary["500"]}`
        }
      }
    }
  };
}

// src/components/OverrideTableCell.ts
function OverrideTableCell(theme) {
  return {
    styleOverrides: {
      root: {
        fontSize: "14px",
        lineHeight: "20px",
        padding: "10px 8px",
        borderColor: theme.palette.divider,
        "&.cell-right": {
          justifyContent: "flex-end",
          textAlign: "right",
          "& > *": {
            justifyContent: "flex-end",
            margin: "0 0 0 auto"
          },
          "& .MuiOutlinedInput-input": {
            textAlign: "right"
          }
        },
        "&.cell-center": {
          justifyContent: "center",
          textAlign: "center",
          "& > *": {
            justifyContent: "center",
            margin: "0 auto"
          }
        }
      },
      sizeSmall: {
        padding: "8px"
      },
      head: {
        fontSize: "0.75rem",
        fontWeight: 700
      },
      footer: {
        fontSize: "0.75rem",
        textTransform: "uppercase"
      }
    }
  };
}

// src/components/OverrideTableHead.ts
function OverrideTableHead(theme) {
  return {
    styleOverrides: {
      root: {
        textWrap: "nowrap",
        backgroundColor: theme.palette.grey["50"],
        fontWeight: 600,
        "& tr th:first-of-type": {
          borderRadius: "4px 0 0 0"
        },
        "& tr th:last-of-type": {
          borderRadius: "0 4px 0 0"
        }
      }
    }
  };
}
function OverrideTablePagination(theme) {
  const { grey: grey2 } = theme.palette;
  const typographyVariants = theme.typography;
  return {
    defaultProps: {
      slots: {
        actions: {
          firstButton: Button,
          lastButton: Button,
          nextButton: Button,
          previousButton: Button
        }
      },
      slotProps: {
        actions: {
          firstButtonIcon: {
            component: hF
          },
          lastButtonIcon: {
            component: VF
          },
          nextButtonIcon: {
            component: r2
          },
          previousButtonIcon: {
            component: J1
          },
          firstButton: {
            size: "small"
          },
          lastButton: {
            size: "small"
          },
          nextButton: {
            size: "small"
          },
          previousButton: {
            size: "small"
          }
        }
      }
    },
    styleOverrides: {
      root: {
        fontSize: "14px",
        lineHeight: "20px",
        ".MuiTablePagination-selectLabel": {
          ...typographyVariants.textSm
        },
        ".MuiTablePagination-select": {
          ...typographyVariants.textSm
        },
        ".MuiTablePagination-displayedRows": {
          ...typographyVariants.textSm
        },
        ".MuiTablePagination-actions": {
          display: "none"
        }
      },
      menuItem: {
        ...typographyVariants.textSm
      },
      actions: {
        ".MuiButtonBase-root": {}
      },
      selectIcon: {
        top: "calc(50% - 11px)",
        left: "calc(50% + 2px)",
        width: "24px",
        height: "24px",
        position: "absolute",
        color: `${grey2[700]} !important`
      }
    }
  };
}

// src/components/OverrideTableRow.ts
function OverrideTableRow(theme) {
  return {
    styleOverrides: {
      root: {
        "&.MuiTableRow-hover:hover": {
          backgroundColor: theme.palette.grey[100]
        }
      }
    }
  };
}

// src/components/OverrideTabs.ts
function OverrideTabs(theme) {
  return {
    styleOverrides: {
      vertical: {
        overflow: "visible"
      },
      root: {
        minHeight: "auto",
        position: "relative",
        "&:after": {
          content: '""',
          display: "block",
          width: "100%",
          borderBottom: `1px solid ${theme.palette.grey[300]}`,
          position: "absolute",
          bottom: 0,
          left: 0
        }
      }
    }
  };
}

// src/components/OverrideTextField.ts
function OverrideTextField() {
  return {
    styleOverrides: {
      root: {
        "& .MuiInputAdornment-positionStart.startAdornmentCustom + .MuiInputBase-input": {
          paddingLeft: 0
        }
      }
    }
  };
}

// src/utils/createComponent.ts
function createComponents(theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontWeight: 500
        }
      }
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
    MuiFormLabel: OverrideFormLabel(),
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
    MuiTextField: OverrideTextField()
  };
}

// src/createAppTheme.ts
function createAppTheme() {
  const palette = getPaletteOptions("light");
  const shadowCustomInput = {
    none: "none",
    xs: "0px 1px 2px 0px rgba(21, 21, 21, 0.05)",
    sm: "0px 1px 2px 0px rgba(21, 21, 21, 0.08), 0px 2px 8px 0px rgba(144, 139, 164, 0.08)",
    md: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
    lg: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 12px 16px -4px rgba(144, 139, 164, 0.08)",
    xl: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
    focusPrimary100: "0px 0px 0px 4px #EEEDFD",
    focusGray100: "0px 0px 0px 4px #F2F3F5",
    focusError100: "0px 0px 0px 4px #FEE4E2",
    focusSuccess100: "0px 0px 0px 4px #D1FADF"
  };
  const radiusInput = {
    none: 0,
    xxs: 4,
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24
  };
  const spacerInput = {
    0: 0,
    50: 2,
    100: 4,
    150: 6,
    200: 8,
    300: 12,
    400: 16,
    500: 20,
    600: 24,
    800: 32,
    1e3: 40,
    1200: 48,
    1400: 56,
    1600: 64,
    1800: 72,
    2e3: 80,
    2400: 96,
    4e3: 160,
    neg100: -4,
    neg200: -8,
    neg300: -12,
    neg400: -16,
    neg600: -24
  };
  const base = createTheme({
    cssVariables: true,
    shape: { borderRadius: radius.sm },
    spacer: spacerInput,
    radius: radiusInput,
    typography: getTypographyVariantOptions,
    shadowCustom: shadowCustomInput,
    palette,
    breakpoints: {
      values: {
        xs: 0,
        sm: 768,
        md: 1266,
        lg: 1440,
        xl: 1920
      }
    },
    direction: "ltr",
    mixins: {
      toolbar: {
        minHeight: 60,
        paddingTop: 8,
        paddingBottom: 8
      }
    },
    shadows: [
      "none",
      "0px 1px 2px 0px rgba(144, 139, 164, 0.25)",
      "0px 1px 2px 0px rgba(21, 21, 21, 0.08), 0px 2px 8px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 12px 16px -4px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)",
      "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)"
    ]
  });
  return createTheme(base, {
    components: {
      ...createComponents(base),
      MuiUseMediaQuery: {
        defaultProps: {
          noSsr: true
        }
      }
    }
  });
}
function ThemeProvider({ children }) {
  const theme = useMemo(() => createAppTheme(), []);
  return /* @__PURE__ */ jsxs(ThemeProvider$1, { theme, children: [
    /* @__PURE__ */ jsx(CssBaseline, {}),
    children
  ] });
}

export { ThemeProvider, colors_exports as colors, createAppTheme };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map