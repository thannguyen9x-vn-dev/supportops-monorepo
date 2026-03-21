'use client';
import { createTheme } from '@mui/material/styles';
import { getPaletteOptions } from './utils/paletteUtil';
import { radius } from './constant/radius';
import { getTypographyVariantOptions } from './utils/typographyUtil';
import { createComponents } from './utils/createComponent';
export function createAppTheme() {
    const lightPalette = getPaletteOptions('light');
    const darkPalette = getPaletteOptions('dark');
    const shadowCustomInput = {
        none: 'none',
        xs: '0px 1px 2px 0px rgba(21, 21, 21, 0.05)',
        sm: '0px 1px 2px 0px rgba(21, 21, 21, 0.08), 0px 2px 8px 0px rgba(144, 139, 164, 0.08)',
        md: '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)',
        lg: '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 12px 16px -4px rgba(144, 139, 164, 0.08)',
        xl: '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
        focusPrimary100: '0px 0px 0px 4px #EEEDFD',
        focusGray100: '0px 0px 0px 4px #F2F3F5',
        focusError100: '0px 0px 0px 4px #FEE4E2',
        focusSuccess100: '0px 0px 0px 4px #D1FADF',
    };
    const radiusInput = {
        none: 0,
        xxs: 4,
        xs: 6,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
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
        1000: 40,
        1200: 48,
        1400: 56,
        1600: 64,
        1800: 72,
        2000: 80,
        2400: 96,
        4000: 160,
        neg100: -4,
        neg200: -8,
        neg300: -12,
        neg400: -16,
        neg600: -24,
    };
    const base = createTheme({
        cssVariables: {
            colorSchemeSelector: 'class',
        },
        shape: { borderRadius: radius.sm },
        spacer: spacerInput,
        radius: radiusInput,
        typography: getTypographyVariantOptions,
        shadowCustom: shadowCustomInput,
        colorSchemes: {
            light: {
                palette: lightPalette,
            },
            dark: {
                palette: darkPalette,
            },
        },
        breakpoints: {
            values: {
                xs: 0,
                sm: 768,
                md: 1266,
                lg: 1440,
                xl: 1920,
            },
        },
        direction: 'ltr',
        mixins: {
            toolbar: {
                minHeight: 60,
                paddingTop: 8,
                paddingBottom: 8,
            },
        },
        shadows: [
            'none',
            '0px 1px 2px 0px rgba(144, 139, 164, 0.25)',
            '0px 1px 2px 0px rgba(21, 21, 21, 0.08), 0px 2px 8px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 12px 16px -4px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
            '0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 20px 24px 0px rgba(144, 139, 164, 0.08)',
        ],
    });
    return createTheme(base, {
        components: {
            ...createComponents(base),
            MuiUseMediaQuery: {
                defaultProps: {
                    noSsr: true,
                },
            },
        },
    });
}
