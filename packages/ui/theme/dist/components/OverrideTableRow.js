export function OverrideTableRow(theme) {
    return {
        styleOverrides: {
            root: {
                '&.MuiTableRow-hover:hover': {
                    backgroundColor: theme.palette.action.hover,
                },
            },
        },
    };
}
