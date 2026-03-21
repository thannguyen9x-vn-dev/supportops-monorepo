import { blue, green, grey, orange, red, teal } from '../constant/colors';
// Palette mapping follows a common convention (brand colors can override here).
const primary = blue;
const error = red;
const warning = orange;
const success = green;
const info = teal;
export function getPaletteOptions(mode) {
    const isDark = mode === 'dark';
    const commonContrastText = isDark ? '#0B0D0E' : '#FFFFFF';
    return {
        mode: mode,
        common: {
            black: '#1A1A1A',
            white: '#FFFFFF',
        },
        action: {
            active: isDark ? '#E7EDF3' : '#32383E',
            hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(26, 26, 26, 0.04)',
            selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(26, 26, 26, 0.08)',
            disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(26, 26, 26, 0.12)',
            focus: isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(26, 26, 26, 0.20)',
            disabled: isDark ? grey[500] : grey[300],
        },
        divider: isDark ? '#2A3138' : '#D0D7E2',
        background: {
            paper: isDark ? '#171A1C' : '#FFFFFF',
            default: isDark ? '#0B0D0E' : '#EEF2F7',
        },
        text: {
            primary: isDark ? '#E7EDF3' : '#32383E',
            secondary: isDark ? '#AAB4BE' : '#555E68',
            disabled: isDark ? '#6A7480' : '#9FA6AD',
        },
        grey: {
            ...grey,
            lighter: grey[50],
            light: grey[300],
            main: grey[500],
            dark: grey[600],
            darker: grey[700],
            contrastText: '#FFFFFF',
        },
        primary: {
            ...primary,
            lighter: primary[50],
            light: primary[300],
            main: isDark ? primary[400] : primary[500],
            dark: isDark ? primary[500] : primary[600],
            darker: primary[700],
            contrastText: commonContrastText,
        },
        error: {
            ...error,
            lighter: error[50],
            light: error[300],
            main: isDark ? error[400] : error[500],
            dark: isDark ? error[500] : error[600],
            darker: error[700],
            contrastText: commonContrastText,
        },
        warning: {
            ...warning,
            lighter: warning[50],
            light: warning[300],
            main: isDark ? warning[400] : warning[500],
            dark: isDark ? warning[500] : warning[600],
            darker: warning[700],
            contrastText: commonContrastText,
        },
        success: {
            ...success,
            lighter: success[50],
            light: success[300],
            main: isDark ? success[400] : success[500],
            dark: isDark ? success[500] : success[600],
            darker: success[700],
            contrastText: commonContrastText,
        },
        info: {
            ...info,
            lighter: info[50],
            light: info[300],
            main: isDark ? info[400] : info[500],
            dark: isDark ? info[500] : info[600],
            darker: info[700],
            contrastText: commonContrastText,
        },
    };
}
