import * as _mui_material from '@mui/material';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { PropsWithChildren } from 'react';

declare function createAppTheme(): _mui_material.Theme;

declare function ThemeProvider({ children }: PropsWithChildren): react_jsx_runtime.JSX.Element;

declare const grey: {
    readonly 50: "#FBFCFE";
    readonly 100: "#F0F4F8";
    readonly 200: "#DDE7EE";
    readonly 300: "#CDD7E1";
    readonly 400: "#9FA6AD";
    readonly 500: "#636B74";
    readonly 600: "#555E68";
    readonly 700: "#32383E";
    readonly 800: "#171A1C";
    readonly 900: "#0B0D0E";
};
declare const red: {
    readonly 50: "#FFF5F5";
    readonly 100: "#FFE3E3";
    readonly 200: "#FFC9C9";
    readonly 300: "#FFA8A8";
    readonly 400: "#FF8787";
    readonly 500: "#FF6B6B";
    readonly 600: "#FA5252";
    readonly 700: "#E03131";
    readonly 800: "#C92A2A";
    readonly 900: "#7A1F1F";
};
declare const orange: {
    readonly 50: "#FFF7ED";
    readonly 100: "#FFEDD5";
    readonly 200: "#FED7AA";
    readonly 300: "#FDBA74";
    readonly 400: "#FB923C";
    readonly 500: "#F97316";
    readonly 600: "#EA580C";
    readonly 700: "#C2410C";
    readonly 800: "#9A3412";
    readonly 900: "#7C2D12";
};
declare const yellow: {
    readonly 50: "#FFFBEB";
    readonly 100: "#FEF3C7";
    readonly 200: "#FDE68A";
    readonly 300: "#FCD34D";
    readonly 400: "#FBBF24";
    readonly 500: "#F59E0B";
    readonly 600: "#D97706";
    readonly 700: "#B45309";
    readonly 800: "#92400E";
    readonly 900: "#78350F";
};
declare const green: {
    readonly 50: "#ECFDF5";
    readonly 100: "#D1FAE5";
    readonly 200: "#A7F3D0";
    readonly 300: "#6EE7B7";
    readonly 400: "#34D399";
    readonly 500: "#10B981";
    readonly 600: "#059669";
    readonly 700: "#047857";
    readonly 800: "#065F46";
    readonly 900: "#064E3B";
};
declare const teal: {
    readonly 50: "#F0FDFA";
    readonly 100: "#CCFBF1";
    readonly 200: "#99F6E4";
    readonly 300: "#5EEAD4";
    readonly 400: "#2DD4BF";
    readonly 500: "#14B8A6";
    readonly 600: "#0D9488";
    readonly 700: "#0F766E";
    readonly 800: "#115E59";
    readonly 900: "#134E4A";
};
declare const blue: {
    readonly 50: "#EFF6FF";
    readonly 100: "#DBEAFE";
    readonly 200: "#BFDBFE";
    readonly 300: "#93C5FD";
    readonly 400: "#60A5FA";
    readonly 500: "#3B82F6";
    readonly 600: "#2563EB";
    readonly 700: "#1D4ED8";
    readonly 800: "#1E40AF";
    readonly 900: "#1E3A8A";
};
declare const indigo: {
    readonly 50: "#EEF2FF";
    readonly 100: "#E0E7FF";
    readonly 200: "#C7D2FE";
    readonly 300: "#A5B4FC";
    readonly 400: "#818CF8";
    readonly 500: "#6366F1";
    readonly 600: "#4F46E5";
    readonly 700: "#4338CA";
    readonly 800: "#3730A3";
    readonly 900: "#312E81";
};
declare const purple: {
    readonly 50: "#FAF5FF";
    readonly 100: "#F3E8FF";
    readonly 200: "#E9D5FF";
    readonly 300: "#D8B4FE";
    readonly 400: "#C084FC";
    readonly 500: "#A855F7";
    readonly 600: "#9333EA";
    readonly 700: "#7E22CE";
    readonly 800: "#6B21A8";
    readonly 900: "#581C87";
};
declare const pink: {
    readonly 50: "#FDF2F8";
    readonly 100: "#FCE7F3";
    readonly 200: "#FBCFE8";
    readonly 300: "#F9A8D4";
    readonly 400: "#F472B6";
    readonly 500: "#EC4899";
    readonly 600: "#DB2777";
    readonly 700: "#BE185D";
    readonly 800: "#9D174D";
    readonly 900: "#831843";
};

declare const colors_blue: typeof blue;
declare const colors_green: typeof green;
declare const colors_grey: typeof grey;
declare const colors_indigo: typeof indigo;
declare const colors_orange: typeof orange;
declare const colors_pink: typeof pink;
declare const colors_purple: typeof purple;
declare const colors_red: typeof red;
declare const colors_teal: typeof teal;
declare const colors_yellow: typeof yellow;
declare namespace colors {
  export { colors_blue as blue, colors_green as green, colors_grey as grey, colors_indigo as indigo, colors_orange as orange, colors_pink as pink, colors_purple as purple, colors_red as red, colors_teal as teal, colors_yellow as yellow };
}

export { ThemeProvider, colors, createAppTheme };
