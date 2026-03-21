'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { createAppTheme } from './createAppTheme';
export function ThemeProvider({ children }) {
    const theme = useMemo(() => createAppTheme(), []);
    return (_jsxs(MuiThemeProvider, { theme: theme, defaultMode: 'system', disableTransitionOnChange: true, children: [_jsx(CssBaseline, {}), children] }));
}
