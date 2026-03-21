export function OverrideTableHead(theme) {
    return {
        styleOverrides: {
            root: {
                textWrap: 'nowrap',
                backgroundColor: theme.palette.action.hover,
                fontWeight: 600,
                '& tr th:first-of-type': {
                    borderRadius: '4px 0 0 0',
                },
                '& tr th:last-of-type': {
                    borderRadius: '0 4px 0 0',
                },
            },
        },
    };
}
