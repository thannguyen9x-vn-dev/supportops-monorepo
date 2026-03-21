import { alpha } from '@mui/material/styles';
export function OverrideFormControlLabel(theme) {
    return {
        styleOverrides: {
            root: {
                '&.with-checkbox': {
                    borderRadius: '8px',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    '&.checked': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        ...theme.applyStyles('dark', {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        }),
                    },
                },
            },
        },
    };
}
