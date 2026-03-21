export function OverrideOutlinedInput(theme) {
    function baseInputStyle() {
        const { textSm: fontStyleBodySm } = theme.typography;
        const { text, error, primary, background, divider, action } = theme.palette;
        const { sm: radiusSm } = theme.radius;
        const inputBackgroundColor = background.paper;
        const focusPrimaryRing = '0px 0px 0px 4px rgba(var(--mui-palette-primary-mainChannel) / 0.2)';
        const focusErrorRing = '0px 0px 0px 4px rgba(var(--mui-palette-error-mainChannel) / 0.2)';
        return {
            ...fontStyleBodySm,
            fontWeight: 500,
            color: text.primary,
            ':not(.Mui-error):not(.Mui-readOnly):hover, &.Mui-focused': {
                input: {
                    '&::placeholder': {
                        color: text.primary,
                    },
                },
                textarea: {
                    '&::placeholder': {
                        color: text.primary,
                    },
                },
                fieldset: {
                    borderColor: `${divider}`,
                },
            },
            input: {
                backgroundColor: inputBackgroundColor,
                borderRadius: radiusSm,
                padding: '10px 16px',
                '&::placeholder': {
                    ...fontStyleBodySm,
                    color: text.secondary,
                    opacity: 1,
                },
            },
            textarea: {
                backgroundColor: inputBackgroundColor,
                borderRadius: radiusSm,
                padding: '10px 16px',
                '&::placeholder': {
                    ...fontStyleBodySm,
                    color: text.secondary,
                    opacity: 1,
                },
            },
            fieldset: {
                border: '1px solid',
                borderColor: divider,
                borderRadius: radiusSm,
            },
            '&.Mui-error': {
                fieldset: {
                    borderColor: `${error.main}`,
                },
                svg: {
                    color: `${error.main}`,
                },
            },
            '&.Mui-focused.Mui-error': {
                fieldset: {
                    borderColor: `${error.main}`,
                    borderWidth: '1px ',
                    boxShadow: focusErrorRing,
                },
                svg: {
                    color: `${error.main}`,
                },
            },
            '&.Mui-focused:not(.Mui-readOnly) input[aria-invalid="false"] ~ fieldset': {
                borderColor: `${primary.main}`,
                borderWidth: '1px',
                boxShadow: focusPrimaryRing,
            },
            '&.Mui-focused:not(.Mui-readOnly) textarea[aria-invalid="false"] ~ fieldset': {
                borderColor: `${primary.main}`,
                borderWidth: '1px ',
                boxShadow: focusPrimaryRing,
            },
            '&.Mui-readOnly, &.Mui-readOnly.Mui-focused': {
                backgroundColor: action.hover,
                input: {
                    backgroundColor: action.hover,
                },
                textarea: {
                    backgroundColor: action.hover,
                },
                fieldset: {
                    borderColor: `${divider}`,
                    borderWidth: '1px',
                },
            },
        };
    }
    function textAreaStyle() {
        return {
            '&.MuiInputBase-multiline': {
                padding: 0,
            },
        };
    }
    return {
        styleOverrides: {
            root: {
                ...baseInputStyle(),
                ...textAreaStyle(),
            },
        },
    };
}
