'use strict';

var react = require('react');
var reactHookForm = require('react-hook-form');
var Autocomplete = require('@mui/material/Autocomplete');
var Box4 = require('@mui/material/Box');
var ClickAwayListener = require('@mui/material/ClickAwayListener');
var Divider2 = require('@mui/material/Divider');
var FormHelperText = require('@mui/material/FormHelperText');
var FormLabel = require('@mui/material/FormLabel');
var MenuItem2 = require('@mui/material/MenuItem');
var Paper = require('@mui/material/Paper');
var styles = require('@mui/material/styles');
var TextField = require('@mui/material/TextField');
var KeyboardArrowDownRoundedIcon = require('@mui/icons-material/KeyboardArrowDownRounded');
var jsxRuntime = require('react/jsx-runtime');
var IconButton = require('@mui/material/IconButton');
var InputAdornment = require('@mui/material/InputAdornment');
var CheckCircleOutlineIcon = require('@mui/icons-material/CheckCircleOutline');
var ErrorOutlineIcon = require('@mui/icons-material/ErrorOutline');
var VisibilityOffOutlinedIcon = require('@mui/icons-material/VisibilityOffOutlined');
var VisibilityOutlinedIcon = require('@mui/icons-material/VisibilityOutlined');
var Button = require('@mui/material/Button');
var Popover = require('@mui/material/Popover');
var Select = require('@mui/material/Select');
var Typography = require('@mui/material/Typography');
var CalendarMonthIcon = require('@mui/icons-material/CalendarMonth');
var CalendarTodayIcon = require('@mui/icons-material/CalendarToday');
var KeyboardArrowDownIcon = require('@mui/icons-material/KeyboardArrowDown');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Autocomplete__default = /*#__PURE__*/_interopDefault(Autocomplete);
var Box4__default = /*#__PURE__*/_interopDefault(Box4);
var ClickAwayListener__default = /*#__PURE__*/_interopDefault(ClickAwayListener);
var Divider2__default = /*#__PURE__*/_interopDefault(Divider2);
var FormHelperText__default = /*#__PURE__*/_interopDefault(FormHelperText);
var FormLabel__default = /*#__PURE__*/_interopDefault(FormLabel);
var MenuItem2__default = /*#__PURE__*/_interopDefault(MenuItem2);
var Paper__default = /*#__PURE__*/_interopDefault(Paper);
var TextField__default = /*#__PURE__*/_interopDefault(TextField);
var KeyboardArrowDownRoundedIcon__default = /*#__PURE__*/_interopDefault(KeyboardArrowDownRoundedIcon);
var IconButton__default = /*#__PURE__*/_interopDefault(IconButton);
var InputAdornment__default = /*#__PURE__*/_interopDefault(InputAdornment);
var CheckCircleOutlineIcon__default = /*#__PURE__*/_interopDefault(CheckCircleOutlineIcon);
var ErrorOutlineIcon__default = /*#__PURE__*/_interopDefault(ErrorOutlineIcon);
var VisibilityOffOutlinedIcon__default = /*#__PURE__*/_interopDefault(VisibilityOffOutlinedIcon);
var VisibilityOutlinedIcon__default = /*#__PURE__*/_interopDefault(VisibilityOutlinedIcon);
var Button__default = /*#__PURE__*/_interopDefault(Button);
var Popover__default = /*#__PURE__*/_interopDefault(Popover);
var Select__default = /*#__PURE__*/_interopDefault(Select);
var Typography__default = /*#__PURE__*/_interopDefault(Typography);
var CalendarMonthIcon__default = /*#__PURE__*/_interopDefault(CalendarMonthIcon);
var CalendarTodayIcon__default = /*#__PURE__*/_interopDefault(CalendarTodayIcon);
var KeyboardArrowDownIcon__default = /*#__PURE__*/_interopDefault(KeyboardArrowDownIcon);

// src/field/input/SelectOptionField.tsx
function getBorderRadiusPx(value) {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 8;
  return parsed;
}
var textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px"
};
var POPUP_OFFSET = [0, 8];
var StyledTextField = styles.styled(TextField__default.default)(({ theme }) => {
  const controlHeight = 40;
  const baseRadius = getBorderRadiusPx(theme.shape.borderRadius);
  const borderRadius = baseRadius * 3;
  const borderColor = theme.palette.grey[300];
  return {
    "& .MuiOutlinedInput-root": {
      minHeight: controlHeight,
      borderRadius,
      backgroundColor: theme.palette.grey[50],
      color: theme.palette.grey[700],
      transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
      "& fieldset": {
        borderColor,
        borderWidth: 1,
        inset: 0
      },
      "&:hover fieldset": {
        borderColor
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1
      },
      "&.Mui-focused": {
        boxShadow: "none"
      },
      '&.Mui-focused:not(.Mui-readOnly) input[aria-invalid="false"] ~ fieldset': {
        boxShadow: "none"
      },
      "& .MuiOutlinedInput-input": {
        ...textSmStyle,
        boxSizing: "border-box",
        height: controlHeight,
        padding: "10px 16px",
        color: theme.palette.grey[700],
        outline: "none",
        WebkitTextFillColor: theme.palette.grey[700],
        caretColor: theme.palette.grey[700],
        "&::placeholder": {
          color: theme.palette.grey[500],
          opacity: 1
        },
        "&:focus": {
          outline: "none"
        },
        "&:focus-visible": {
          outline: "none"
        }
      },
      "&.Mui-disabled": {
        backgroundColor: theme.palette.grey[50],
        color: theme.palette.grey[400],
        "& fieldset": {
          borderColor: theme.palette.grey[200]
        }
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        display: "none"
      },
      "& .MuiOutlinedInput-notchedOutline": {
        top: 0
      }
    }
  };
});
var StyledFieldLabel = styles.styled(FormLabel__default.default)(({ theme }) => ({
  ...textSmStyle,
  display: "block",
  color: theme.palette.grey[800],
  marginBottom: 6
}));
var StyledHelperText = styles.styled(FormHelperText__default.default)(({ theme }) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle,
  color: theme.palette.error.main,
  "& .helper-text-title": {
    fontWeight: 700,
    marginRight: 6
  }
}));
var popupPaperBorderStyles = {
  border: "1px solid var(--mui-palette-grey-300)",
  borderRadius: 3,
  boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
  overflow: "hidden"
};
function SelectOptionFieldInner(props) {
  const {
    name,
    control,
    rules,
    label,
    helperText,
    hideEmptyHelperText = false,
    options,
    searchable = false,
    searchInPopup = false,
    searchPlaceholder,
    noOptionsText,
    disableClearable = true,
    autocompleteProps,
    id,
    disabled,
    placeholder,
    ...textFieldProps
  } = props;
  const {
    field,
    fieldState: { error }
  } = reactHookForm.useController({
    name,
    control,
    rules
  });
  const helperTextContent = error?.message ?? helperText;
  const showHelper = !hideEmptyHelperText || helperTextContent;
  const inputId = id ?? String(name);
  const [open, setOpen] = react.useState(false);
  const [popupSearchValue, setPopupSearchValue] = react.useState("");
  const selectedOption = react.useMemo(() => {
    return options.find((option) => option.value === field.value) ?? null;
  }, [field.value, options]);
  const popupSearchText = popupSearchValue.trim().toLocaleLowerCase();
  const handleOpen = react.useCallback(() => {
    setOpen(true);
  }, []);
  const handleClose = react.useCallback(
    (event, reason) => {
      if (searchInPopup && reason === "blur") return;
      setOpen(false);
      setPopupSearchValue("");
      autocompleteProps?.onClose?.(
        event,
        reason
      );
    },
    [autocompleteProps, searchInPopup]
  );
  const handleClickAway = react.useCallback(() => {
    if (!searchInPopup) return;
    setOpen(false);
    setPopupSearchValue("");
  }, [searchInPopup]);
  const handleSelect = react.useCallback(
    (_, nextOption) => {
      if (!nextOption && disableClearable) return;
      field.onChange(nextOption?.value ?? "");
      if (searchInPopup) {
        setOpen(false);
        setPopupSearchValue("");
      }
    },
    [disableClearable, field, searchInPopup]
  );
  const mergedPopperSlotProps = react.useMemo(() => {
    const popperSlotProp = autocompleteProps?.slotProps?.popper;
    if (typeof popperSlotProp === "function") return popperSlotProp;
    const existingModifiers = Array.isArray(popperSlotProp?.modifiers) ? popperSlotProp.modifiers : [];
    return {
      ...popperSlotProp,
      modifiers: [
        ...existingModifiers,
        {
          name: "offset",
          enabled: true,
          options: {
            offset: POPUP_OFFSET
          }
        }
      ]
    };
  }, [autocompleteProps?.slotProps?.popper]);
  const PopupPaper = react.useCallback(
    (paperProps) => {
      const { children, ...rest } = paperProps;
      return /* @__PURE__ */ jsxRuntime.jsxs(
        Paper__default.default,
        {
          ...rest,
          sx: {
            ...popupPaperBorderStyles,
            paddingTop: searchInPopup ? 1 : 0
          },
          children: [
            searchInPopup ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { paddingX: 1, paddingBottom: 1 }, children: /* @__PURE__ */ jsxRuntime.jsx(
                TextField__default.default,
                {
                  autoFocus: true,
                  fullWidth: true,
                  onChange: (event) => {
                    setPopupSearchValue(event.target.value);
                  },
                  onKeyDown: (event) => {
                    event.stopPropagation();
                  },
                  onMouseDown: (event) => {
                    event.stopPropagation();
                  },
                  placeholder: searchPlaceholder,
                  size: "small",
                  value: popupSearchValue
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx(Divider2__default.default, {})
            ] }) : null,
            children
          ]
        }
      );
    },
    [popupSearchValue, searchInPopup, searchPlaceholder]
  );
  const autocompleteSx = {
    "& .MuiAutocomplete-inputRoot": {
      padding: "0 !important"
    },
    "& .MuiAutocomplete-input": {
      ...textSmStyle,
      boxSizing: "border-box",
      height: "40px !important",
      minWidth: 0,
      padding: "10px 16px !important"
    },
    "& .MuiAutocomplete-endAdornment": {
      right: 8
    },
    "& .MuiAutocomplete-popupIndicator": {
      width: 24,
      height: 24,
      minWidth: 24,
      border: 0,
      borderRadius: 6,
      backgroundColor: "transparent !important",
      boxShadow: "none",
      color: "var(--mui-palette-grey-500)",
      "&:hover": {
        backgroundColor: "transparent",
        color: "var(--mui-palette-grey-600)"
      },
      "& .MuiSvgIcon-root": {
        fontSize: 28
      }
    },
    "& .MuiAutocomplete-popupIndicator.Mui-focused": {
      backgroundColor: "transparent"
    },
    "& .MuiAutocomplete-listbox": {
      maxHeight: 320
    }
  };
  function PopupSearchAutocomplete() {
    return /* @__PURE__ */ jsxRuntime.jsx(ClickAwayListener__default.default, { onClickAway: handleClickAway, children: /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { width: "100%" }, children: /* @__PURE__ */ jsxRuntime.jsx(
      Autocomplete__default.default,
      {
        ...autocompleteProps,
        clearOnBlur: false,
        disableClearable,
        disabled,
        forcePopupIcon: true,
        fullWidth: true,
        getOptionDisabled: (option) => Boolean(option.disabled),
        getOptionKey: (option) => String(option.value),
        getOptionLabel: (option) => option.label,
        id: inputId,
        isOptionEqualToValue: (option, value) => option.value === value.value,
        noOptionsText,
        onBlur: field.onBlur,
        onChange: handleSelect,
        onClose: handleClose,
        onOpen: (event) => {
          handleOpen();
          autocompleteProps?.onOpen?.(event);
        },
        open,
        options,
        popupIcon: /* @__PURE__ */ jsxRuntime.jsx(KeyboardArrowDownRoundedIcon__default.default, {}),
        renderInput: (params) => /* @__PURE__ */ jsxRuntime.jsx(
          StyledTextField,
          {
            ...params,
            ...textFieldProps,
            error: Boolean(error),
            inputProps: {
              ...params.inputProps,
              readOnly: true
            },
            onClick: () => {
              setOpen((prev) => !prev);
            },
            placeholder,
            variant: "outlined"
          }
        ),
        filterOptions: (items) => {
          if (!popupSearchText) return items;
          return items.filter(
            (option) => option.label.toLocaleLowerCase().includes(popupSearchText)
          );
        },
        selectOnFocus: false,
        slotProps: {
          ...autocompleteProps?.slotProps,
          popupIndicator: {
            ...autocompleteProps?.slotProps?.popupIndicator ?? {},
            disableRipple: true
          },
          popper: mergedPopperSlotProps
        },
        slots: {
          ...autocompleteProps?.slots,
          paper: PopupPaper
        },
        sx: {
          ...autocompleteSx,
          "& .MuiAutocomplete-input": {
            ...autocompleteSx["& .MuiAutocomplete-input"],
            cursor: "pointer"
          }
        },
        value: selectedOption
      }
    ) }) });
  }
  function InlineSearchAutocomplete() {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Autocomplete__default.default,
      {
        ...autocompleteProps,
        clearOnBlur: false,
        disableClearable,
        disabled,
        forcePopupIcon: true,
        fullWidth: true,
        getOptionDisabled: (option) => Boolean(option.disabled),
        getOptionKey: (option) => String(option.value),
        getOptionLabel: (option) => option.label,
        id: inputId,
        isOptionEqualToValue: (option, value) => option.value === value.value,
        noOptionsText,
        onBlur: field.onBlur,
        onChange: handleSelect,
        options,
        popupIcon: /* @__PURE__ */ jsxRuntime.jsx(KeyboardArrowDownRoundedIcon__default.default, {}),
        renderInput: (params) => /* @__PURE__ */ jsxRuntime.jsx(
          StyledTextField,
          {
            ...params,
            ...textFieldProps,
            error: Boolean(error),
            placeholder: searchPlaceholder ?? placeholder,
            variant: "outlined"
          }
        ),
        selectOnFocus: false,
        slotProps: {
          ...autocompleteProps?.slotProps,
          popupIndicator: {
            ...autocompleteProps?.slotProps?.popupIndicator ?? {},
            disableRipple: true
          }
        },
        sx: autocompleteSx,
        value: selectedOption
      }
    );
  }
  function NativeSelectField() {
    return /* @__PURE__ */ jsxRuntime.jsx(
      StyledTextField,
      {
        ...textFieldProps,
        ...field,
        disabled,
        error: Boolean(error),
        fullWidth: true,
        id: inputId,
        select: true,
        value: field.value ?? "",
        variant: "outlined",
        children: options.map((option) => /* @__PURE__ */ jsxRuntime.jsx(MenuItem2__default.default, { disabled: option.disabled, value: option.value, children: option.label }, String(option.value)))
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsxRuntime.jsx(StyledFieldLabel, { htmlFor: inputId, children: label }) : null,
    searchable ? searchInPopup ? /* @__PURE__ */ jsxRuntime.jsx(PopupSearchAutocomplete, {}) : /* @__PURE__ */ jsxRuntime.jsx(InlineSearchAutocomplete, {}) : /* @__PURE__ */ jsxRuntime.jsx(NativeSelectField, {}),
    showHelper ? /* @__PURE__ */ jsxRuntime.jsx(StyledHelperText, { error: Boolean(error), children: error?.message ? /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { component: "span", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "helper-text-title", children: "Oh snap!" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: error.message })
    ] }) : helperTextContent }) : null
  ] });
}
var SelectOptionField = SelectOptionFieldInner;
function getBorderRadiusPx2(value) {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 8;
  return parsed;
}
var textSmStyle2 = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px"
};
var StyledTextField2 = styles.styled(TextField__default.default, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => {
  const controlHeight = 40;
  const baseRadius = getBorderRadiusPx2(theme.shape.borderRadius);
  const borderRadius = baseRadius * 3;
  const baseBorderColor = theme.palette.grey[300];
  const focusBorderColor = theme.palette.primary.main;
  const statusBorderColor = fieldStatus === "success" ? theme.palette.success.main : fieldStatus === "error" ? theme.palette.error.main : baseBorderColor;
  return {
    "& .MuiOutlinedInput-root": {
      height: controlHeight,
      minHeight: controlHeight,
      borderRadius,
      backgroundColor: theme.palette.grey[50],
      color: theme.palette.grey[700],
      transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
      "& fieldset": {
        borderColor: statusBorderColor,
        borderWidth: 1,
        inset: 0
      },
      "&:hover fieldset": {
        borderColor: fieldStatus === "default" ? baseBorderColor : statusBorderColor
      },
      "&.Mui-focused fieldset": {
        borderColor: fieldStatus === "default" ? focusBorderColor : statusBorderColor,
        borderWidth: 1
      },
      "&.Mui-focused": {
        boxShadow: "none"
      },
      '&.Mui-focused:not(.Mui-readOnly) input[aria-invalid="false"] ~ fieldset': {
        boxShadow: "none"
      },
      '&.Mui-focused:not(.Mui-readOnly) textarea[aria-invalid="false"] ~ fieldset': {
        boxShadow: "none"
      },
      "&.Mui-disabled": {
        backgroundColor: theme.palette.grey[50],
        color: theme.palette.grey[400],
        "& fieldset": {
          borderColor: theme.palette.grey[200]
        },
        "& .MuiOutlinedInput-input::placeholder": {
          color: theme.palette.grey[400]
        }
      },
      "& .MuiOutlinedInput-input": {
        ...textSmStyle2,
        boxSizing: "border-box",
        height: controlHeight,
        padding: "10px 16px",
        color: theme.palette.grey[700],
        outline: "none",
        WebkitTextFillColor: theme.palette.grey[700],
        caretColor: theme.palette.grey[700],
        "&::placeholder": {
          color: theme.palette.grey[400],
          fontWeight: 400,
          opacity: 1
        },
        "&:focus": {
          outline: "none"
        },
        "&:focus-visible": {
          outline: "none"
        },
        "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus": {
          WebkitTextFillColor: `${theme.palette.grey[700]} !important`,
          caretColor: theme.palette.grey[700],
          WebkitBoxShadow: `0 0 0 1000px ${theme.palette.grey[50]} inset`,
          boxShadow: `0 0 0 1000px ${theme.palette.grey[50]} inset`,
          borderRadius,
          transition: "background-color 99999s ease-out 0s"
        }
      },
      "& .MuiOutlinedInput-input.MuiInputBase-inputAdornedStart": {
        paddingLeft: 0
      },
      "& .MuiInputAdornment-root": {
        marginLeft: 12,
        marginRight: 8,
        color: fieldStatus === "default" ? theme.palette.grey[500] : statusBorderColor
      },
      "& .MuiSvgIcon-root": {
        fontSize: 22
      },
      "&.MuiInputBase-multiline": {
        minHeight: 180,
        alignItems: "flex-start",
        padding: 0
      },
      "& .MuiOutlinedInput-input.MuiInputBase-inputMultiline": {
        ...textSmStyle2,
        minHeight: 160,
        height: "auto",
        padding: "10px 16px",
        resize: "vertical"
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        display: "none"
      },
      "& .MuiOutlinedInput-notchedOutline": {
        top: 0
      }
    }
  };
});
var StyledFieldLabel2 = styles.styled(FormLabel__default.default)(({ theme }) => ({
  ...textSmStyle2,
  display: "block",
  color: theme.palette.grey[800],
  marginBottom: 6
}));
var StyledHelperText2 = styles.styled(FormHelperText__default.default, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle2,
  color: fieldStatus === "success" ? theme.palette.success.main : fieldStatus === "error" ? theme.palette.error.main : theme.palette.grey[500],
  "& .helper-text-title": {
    fontWeight: 700,
    marginRight: 6
  }
}));
function TextInputFieldInner(props) {
  const {
    name,
    control,
    rules,
    label,
    placeholder,
    helperText,
    successMessage,
    startIcon,
    endIcon,
    status: externalStatus,
    showSuccessState = false,
    successIcon = /* @__PURE__ */ jsxRuntime.jsx(CheckCircleOutlineIcon__default.default, { fontSize: "small" }),
    errorIcon = /* @__PURE__ */ jsxRuntime.jsx(ErrorOutlineIcon__default.default, { fontSize: "small" }),
    hideEmptyHelperText = false,
    inputType = "text",
    showPasswordToggle = true,
    id,
    disabled,
    ...textFieldProps
  } = props;
  const {
    field,
    fieldState: { error, isDirty, isTouched }
  } = reactHookForm.useController({
    name,
    control,
    rules
  });
  const fieldStatus = react.useMemo(() => {
    if (externalStatus) return externalStatus;
    if (error) return "error";
    if (showSuccessState && isTouched && isDirty && !error) return "success";
    return "default";
  }, [externalStatus, error, showSuccessState, isTouched, isDirty]);
  const helperTextContent = react.useMemo(() => {
    if (fieldStatus === "error" && error?.message) {
      return /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { component: "span", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "helper-text-title", children: "Oh snap!" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: error.message })
      ] });
    }
    if (fieldStatus === "success" && successMessage) {
      return /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { component: "span", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "helper-text-title", children: "Well done!" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: successMessage })
      ] });
    }
    return helperText;
  }, [error, fieldStatus, helperText, successMessage]);
  const configuredType = textFieldProps.type ?? inputType;
  const isPasswordField = configuredType === "password";
  const [isPasswordVisible, setIsPasswordVisible] = react.useState(false);
  const startAdornment = react.useMemo(() => {
    if (!startIcon && fieldStatus === "default") return void 0;
    const icon = fieldStatus === "success" ? successIcon : fieldStatus === "error" ? errorIcon : startIcon;
    if (!icon) return void 0;
    return /* @__PURE__ */ jsxRuntime.jsx(InputAdornment__default.default, { position: "start", children: icon });
  }, [errorIcon, fieldStatus, startIcon, successIcon]);
  const endAdornment = react.useMemo(() => {
    if (!startIcon && fieldStatus !== "default") return void 0;
    const passwordToggle = isPasswordField && showPasswordToggle ? /* @__PURE__ */ jsxRuntime.jsx(
      IconButton__default.default,
      {
        "aria-label": isPasswordVisible ? "Hide password" : "Show password",
        edge: "end",
        onClick: () => setIsPasswordVisible((prev) => !prev),
        size: "small",
        sx: {
          color: "grey.500",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "transparent" }
        },
        children: isPasswordVisible ? /* @__PURE__ */ jsxRuntime.jsx(VisibilityOutlinedIcon__default.default, { fontSize: "small" }) : /* @__PURE__ */ jsxRuntime.jsx(VisibilityOffOutlinedIcon__default.default, { fontSize: "small" })
      }
    ) : null;
    const resolvedEndIcon = endIcon ?? passwordToggle;
    if (!resolvedEndIcon) return void 0;
    return /* @__PURE__ */ jsxRuntime.jsx(InputAdornment__default.default, { position: "end", children: resolvedEndIcon });
  }, [endIcon, fieldStatus, isPasswordField, isPasswordVisible, showPasswordToggle, startIcon]);
  const showHelper = !hideEmptyHelperText || helperTextContent;
  const inputId = id ?? String(name);
  const renderedType = isPasswordField && showPasswordToggle && !endIcon ? isPasswordVisible ? "text" : "password" : configuredType;
  return /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsxRuntime.jsx(StyledFieldLabel2, { htmlFor: inputId, children: label }) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      StyledTextField2,
      {
        ...textFieldProps,
        ...field,
        disabled,
        error: fieldStatus === "error",
        fieldStatus,
        fullWidth: true,
        id: inputId,
        placeholder,
        slotProps: {
          input: {
            endAdornment,
            startAdornment,
            ...textFieldProps.slotProps?.input
          },
          ...textFieldProps.slotProps
        },
        type: renderedType,
        variant: "outlined"
      }
    ),
    showHelper ? /* @__PURE__ */ jsxRuntime.jsx(StyledHelperText2, { fieldStatus, children: helperTextContent }) : null
  ] });
}
var TextInputField = TextInputFieldInner;
function TextAreaField(props) {
  const { maxRows, minRows = 8, ...rest } = props;
  return /* @__PURE__ */ jsxRuntime.jsx(TextInputField, { ...rest, multiline: true, maxRows, minRows });
}
var textSmStyle3 = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px"
};
function PhoneNumberFieldInner(props) {
  const {
    control,
    countryName,
    phoneName,
    countryOptions,
    label,
    countryAriaLabel,
    phoneAriaLabel,
    phonePlaceholder,
    searchPlaceholder,
    noOptionsText,
    countryRules,
    phoneRules,
    countryWidthPx = 128,
    popupWidthPx = 340
  } = props;
  const { errors } = reactHookForm.useFormState({
    control,
    name: [countryName, phoneName]
  });
  const selectedCountry = reactHookForm.useWatch({ control, name: countryName });
  const selectedCountryOption = react.useMemo(
    () => countryOptions.find((option) => option.value === selectedCountry) ?? null,
    [countryOptions, selectedCountry]
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsxRuntime.jsx(
      FormLabel__default.default,
      {
        sx: {
          ...textSmStyle3,
          display: "block",
          color: "grey.800",
          mb: 0.75
        },
        children: label
      }
    ) : null,
    /* @__PURE__ */ jsxRuntime.jsxs(
      Box4__default.default,
      {
        sx: {
          display: "grid",
          gridTemplateColumns: `${countryWidthPx}px minmax(0, 1fr)`,
          gap: 0,
          border: "1px solid",
          borderColor: "var(--mui-palette-grey-300)",
          borderRadius: 1,
          bgcolor: "grey.50",
          overflow: "hidden",
          transition: "border-color 0.15s ease",
          "&:focus-within": {
            borderColor: "var(--mui-palette-primary-main)"
          },
          "&:has(.MuiAutocomplete-root.Mui-expanded)": {
            borderColor: "var(--mui-palette-primary-main)"
          },
          "& .phone-country-control": {
            position: "relative",
            borderRight: "1px solid",
            borderRightColor: "var(--mui-palette-grey-300)",
            minWidth: 0,
            transition: "border-right-color 0.15s ease"
          },
          "&:focus-within .phone-country-control": {
            borderRightColor: "var(--mui-palette-primary-main)"
          },
          "&:has(.MuiAutocomplete-root.Mui-expanded) .phone-country-control": {
            borderRightColor: "var(--mui-palette-primary-main)"
          },
          "& .phone-number-control": {
            minWidth: 0
          },
          "& .phone-country-value-overlay": {
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            pl: 1.75,
            pr: 4.25,
            pointerEvents: "none",
            zIndex: 1
          },
          "& .phone-country-flag": {
            fontSize: 20,
            lineHeight: 1
          },
          "& .phone-country-dial": {
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1,
            color: "grey.700"
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            backgroundColor: "transparent",
            outline: "none !important"
          },
          "& .MuiOutlinedInput-root fieldset, & .MuiOutlinedInput-root:hover fieldset, & .MuiOutlinedInput-root.Mui-focused fieldset": {
            border: "none"
          },
          "& .MuiOutlinedInput-root.Mui-focused": {
            boxShadow: "none",
            outline: "none !important"
          },
          "& .MuiInputBase-root:focus-within": {
            boxShadow: "none !important",
            outline: "none !important"
          },
          "& .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible": {
            outline: "none !important",
            boxShadow: "none !important"
          },
          "& .MuiAutocomplete-root:focus-within": {
            outline: "none !important",
            boxShadow: "none !important"
          },
          "& .MuiAutocomplete-popupIndicator": {
            mr: "6px !important"
          },
          "& .phone-country-control .MuiAutocomplete-input": {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "clip",
            paddingRight: "0 !important",
            textAlign: "left",
            color: "transparent !important",
            WebkitTextFillColor: "transparent !important",
            caretColor: "transparent !important",
            textShadow: "none !important"
          },
          "& .phone-country-control .MuiAutocomplete-endAdornment": {
            right: "4px !important"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { className: "phone-country-control", children: [
            selectedCountryOption ? /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { "aria-hidden": true, className: "phone-country-value-overlay", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "phone-country-flag", children: selectedCountryOption.flag }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "phone-country-dial", children: `(+${selectedCountryOption.dialingCode})` })
            ] }) : null,
            /* @__PURE__ */ jsxRuntime.jsx(
              SelectOptionField,
              {
                "aria-label": countryAriaLabel,
                control,
                hideEmptyHelperText: true,
                name: countryName,
                noOptionsText,
                options: countryOptions,
                rules: countryRules,
                searchable: true,
                searchInPopup: true,
                searchPlaceholder,
                autocompleteProps: {
                  slotProps: {
                    popper: {
                      placement: "bottom-start",
                      modifiers: [
                        {
                          name: "flip",
                          enabled: false
                        },
                        {
                          name: "preventOverflow",
                          options: {
                            altAxis: false
                          }
                        }
                      ],
                      sx: {
                        width: `${popupWidthPx}px !important`,
                        left: "0 !important"
                      }
                    }
                  },
                  renderOption: (renderProps, option) => {
                    const typedOption = option;
                    return /* @__PURE__ */ react.createElement("li", { ...renderProps, key: String(typedOption.value) }, `${typedOption.flag} ${typedOption.countryName} (+${typedOption.dialingCode})`);
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { className: "phone-number-control", children: /* @__PURE__ */ jsxRuntime.jsx(
            TextInputField,
            {
              "aria-label": phoneAriaLabel,
              control,
              hideEmptyHelperText: true,
              name: phoneName,
              placeholder: phonePlaceholder,
              rules: phoneRules,
              status: "default"
            }
          ) })
        ]
      }
    ),
    errors[phoneName]?.message || errors[countryName]?.message ? /* @__PURE__ */ jsxRuntime.jsx(
      FormHelperText__default.default,
      {
        error: true,
        sx: {
          ml: 0,
          mt: 1,
          ...textSmStyle3
        },
        children: errors[phoneName]?.message ?? errors[countryName]?.message
      }
    ) : null
  ] });
}
var PhoneNumberField = PhoneNumberFieldInner;
function isoToDate(iso) {
  const parts = iso.split("-");
  const y = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 1);
  const d = Number(parts[2] ?? 1);
  return new Date(y, m - 1, d);
}
function dateToIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatDisplayDate(iso, locale) {
  const parts = iso.split("-");
  const y = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 1);
  const d = Number(parts[2] ?? 1);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(y, m - 1, d));
}
function getMonthNames(locale) {
  return Array.from(
    { length: 12 },
    (_, i) => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2e3, i, 1))
  );
}
function getDayHeaders(locale) {
  const sunday = new Date(2023, 0, 1);
  return Array.from(
    { length: 7 },
    (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i)).replace(".", "")
  );
}
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const grid = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const overflowMonth = month === 0 ? 11 : month - 1;
    const overflowYear = month === 0 ? year - 1 : year;
    grid.push({ day: daysInPrevMonth - i, month: overflowMonth, year: overflowYear, overflow: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ day: d, month, year, overflow: false });
  }
  const trailing = 42 - grid.length;
  for (let d = 1; d <= trailing; d++) {
    const overflowMonth = month === 11 ? 0 : month + 1;
    const overflowYear = month === 11 ? year + 1 : year;
    grid.push({ day: d, month: overflowMonth, year: overflowYear, overflow: true });
  }
  return grid;
}
function isSameDay(cell, date) {
  if (!date) return false;
  return cell.day === date.getDate() && cell.month === date.getMonth() && cell.year === date.getFullYear();
}
function isToday(cell) {
  const today = /* @__PURE__ */ new Date();
  return cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
}
var YEAR_OPTIONS = Array.from({ length: 201 }, (_, i) => 1900 + i);
var DEFAULT_TEXTS = {
  monthLabel: "Month",
  yearLabel: "Year",
  todayLabel: "Today",
  clearLabel: "Clear",
  keyboardHint: "Cursor keys can navigate dates",
  selectMonthAriaLabel: "Select month",
  selectYearAriaLabel: "Select year"
};
var textSmStyle4 = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px"
};
function getBorderRadiusPx3(value) {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 8;
  return parsed;
}
var StyledTextField3 = styles.styled(TextField__default.default, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => {
  const controlHeight = 40;
  const baseRadius = getBorderRadiusPx3(theme.shape.borderRadius);
  const borderRadius = baseRadius * 3;
  const baseBorderColor = theme.palette.grey[300];
  const focusBorderColor = theme.palette.primary.main;
  const statusBorderColor = fieldStatus === "error" ? theme.palette.error.main : baseBorderColor;
  return {
    "& .MuiOutlinedInput-root": {
      height: controlHeight,
      minHeight: controlHeight,
      borderRadius,
      backgroundColor: theme.palette.grey[50],
      color: theme.palette.grey[700],
      transition: theme.transitions.create(["border-color", "background-color"]),
      cursor: "pointer",
      "& fieldset": {
        borderColor: statusBorderColor,
        borderWidth: 1,
        inset: 0
      },
      "&:hover fieldset": {
        borderColor: fieldStatus === "default" ? baseBorderColor : statusBorderColor
      },
      "&.Mui-focused fieldset": {
        borderColor: fieldStatus === "default" ? focusBorderColor : statusBorderColor,
        borderWidth: 1,
        boxShadow: "none !important"
      },
      "&.Mui-focused input ~ fieldset": {
        boxShadow: "none !important"
      },
      "&.Mui-disabled": {
        backgroundColor: theme.palette.grey[50],
        cursor: "default",
        "& fieldset": {
          borderColor: theme.palette.grey[200]
        }
      },
      "& .MuiOutlinedInput-input": {
        ...textSmStyle4,
        boxSizing: "border-box",
        height: controlHeight,
        padding: "10px 16px",
        color: theme.palette.grey[700],
        outline: "none",
        cursor: "pointer",
        "&::placeholder": {
          color: theme.palette.grey[400],
          fontWeight: 400,
          opacity: 1
        },
        "&:focus": { outline: "none" },
        "&:focus-visible": { outline: "none" }
      },
      "& .MuiInputAdornment-root": {
        marginLeft: 12,
        marginRight: 8,
        color: fieldStatus === "error" ? theme.palette.error.main : theme.palette.grey[500]
      },
      "& .MuiSvgIcon-root": {
        fontSize: 22
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        display: "none"
      },
      "& .MuiOutlinedInput-notchedOutline": {
        top: 0
      }
    }
  };
});
var StyledFieldLabel3 = styles.styled(FormLabel__default.default)(({ theme }) => ({
  ...textSmStyle4,
  display: "block",
  color: theme.palette.grey[800],
  marginBottom: 6
}));
var StyledHelperText3 = styles.styled(FormHelperText__default.default, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle4,
  color: fieldStatus === "error" ? theme.palette.error.main : theme.palette.grey[500],
  "& .helper-text-title": {
    fontWeight: 700,
    marginRight: 6
  }
}));
var StyledCompactSelect = styles.styled(Select__default.default)(({ theme }) => ({
  minWidth: 0,
  "& .MuiSelect-select": {
    ...textSmStyle4,
    color: theme.palette.grey[800],
    padding: 0,
    lineHeight: "24px",
    minHeight: "24px !important",
    borderRadius: 0,
    backgroundColor: "transparent !important"
  },
  "& .MuiSelect-select:focus": {
    backgroundColor: "transparent !important",
    outline: "none !important"
  },
  "& .MuiSelect-select:focus-visible": {
    backgroundColor: "transparent !important",
    outline: "none !important"
  },
  "& .MuiSelect-select.Mui-focusVisible": {
    backgroundColor: "transparent !important",
    outline: "none !important"
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none !important",
    boxShadow: "none !important"
  },
  "& fieldset": {
    border: "none !important",
    boxShadow: "none !important"
  }
}));
function SelectDateFieldInner(props) {
  const {
    name,
    control,
    rules,
    label,
    placeholder,
    hideEmptyHelperText = false,
    disabled,
    locale,
    texts,
    "aria-label": ariaLabel
  } = props;
  const {
    field,
    fieldState: { error }
  } = reactHookForm.useController({ name, control, rules });
  const [anchorEl, setAnchorEl] = react.useState(null);
  const [viewYear, setViewYear] = react.useState(() => (/* @__PURE__ */ new Date()).getFullYear());
  const [viewMonth, setViewMonth] = react.useState(() => (/* @__PURE__ */ new Date()).getMonth());
  const [focusedDate, setFocusedDate] = react.useState(null);
  const gridRef = react.useRef(null);
  const open = Boolean(anchorEl);
  const selectedDate = react.useMemo(() => {
    const val = field.value;
    if (!val) return null;
    return isoToDate(val);
  }, [field.value]);
  const displayValue = react.useMemo(() => {
    const val = field.value;
    if (!val) return "";
    return formatDisplayDate(val, locale);
  }, [field.value, locale]);
  const monthNames = react.useMemo(() => getMonthNames(locale), [locale]);
  const dayHeaders = react.useMemo(() => texts?.dayHeaders ?? getDayHeaders(locale), [locale, texts]);
  const uiTexts = react.useMemo(
    () => ({
      ...DEFAULT_TEXTS,
      ...texts
    }),
    [texts]
  );
  const selectMenuProps = react.useMemo(
    () => ({
      PaperProps: {
        sx: {
          mt: "4px",
          maxHeight: "40vh",
          overflowY: "auto",
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 3,
          boxShadow: 4
        }
      }
    }),
    []
  );
  const calendarGrid = react.useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const fieldStatus = error ? "error" : "default";
  react.useEffect(() => {
    if (!open || !focusedDate) return;
    const iso = dateToIso(focusedDate);
    const btn = gridRef.current?.querySelector(`[data-date="${iso}"]`);
    btn?.focus();
  }, [focusedDate, open]);
  const handleOpen = react.useCallback(
    (event) => {
      if (disabled) return;
      const date = selectedDate ?? /* @__PURE__ */ new Date();
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
      setFocusedDate(selectedDate);
      setAnchorEl(event.currentTarget);
    },
    [disabled, selectedDate]
  );
  const handleClose = react.useCallback(() => {
    setAnchorEl(null);
    setFocusedDate(null);
  }, []);
  const handleDaySelect = react.useCallback(
    (cell) => {
      const date = new Date(cell.year, cell.month, cell.day);
      field.onChange(dateToIso(date));
      setAnchorEl(null);
      setFocusedDate(null);
    },
    [field]
  );
  const handleToday = react.useCallback(() => {
    const today = /* @__PURE__ */ new Date();
    field.onChange(dateToIso(today));
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setAnchorEl(null);
    setFocusedDate(null);
  }, [field]);
  const handleClear = react.useCallback(() => {
    field.onChange("");
    setAnchorEl(null);
    setFocusedDate(null);
  }, [field]);
  const handlePrevMonth = react.useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);
  const handleNextMonth = react.useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);
  const handleGridKeyDown = react.useCallback(
    (e) => {
      const base = focusedDate ?? selectedDate ?? new Date(viewYear, viewMonth, 1);
      const delta = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7
      };
      if (e.key in delta) {
        e.preventDefault();
        const next = new Date(base);
        next.setDate(next.getDate() + (delta[e.key] ?? 0));
        setFocusedDate(next);
        if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
          setViewMonth(next.getMonth());
          setViewYear(next.getFullYear());
        }
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const target = focusedDate ?? base;
        handleDaySelect({
          day: target.getDate(),
          month: target.getMonth(),
          year: target.getFullYear(),
          overflow: false
        });
        return;
      }
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key === "PageUp") {
        e.preventDefault();
        handlePrevMonth();
        return;
      }
      if (e.key === "PageDown") {
        e.preventDefault();
        handleNextMonth();
      }
    },
    [
      focusedDate,
      selectedDate,
      viewYear,
      viewMonth,
      handleDaySelect,
      handleClose,
      handlePrevMonth,
      handleNextMonth
    ]
  );
  const inputId = String(name);
  const showHelper = !hideEmptyHelperText || error?.message;
  const helperContent = error?.message ? /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { component: "span", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "helper-text-title", children: "Oh snap!" }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { children: error.message })
  ] }) : null;
  return /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsxRuntime.jsx(StyledFieldLabel3, { htmlFor: inputId, children: label }) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      StyledTextField3,
      {
        disabled,
        error: Boolean(error),
        fieldStatus,
        fullWidth: true,
        id: inputId,
        inputProps: {
          readOnly: true,
          "aria-label": ariaLabel,
          style: { cursor: disabled ? "default" : "pointer" }
        },
        onClick: disabled ? void 0 : handleOpen,
        placeholder,
        slotProps: {
          input: {
            endAdornment: /* @__PURE__ */ jsxRuntime.jsx(InputAdornment__default.default, { position: "end", children: /* @__PURE__ */ jsxRuntime.jsx(
              IconButton__default.default,
              {
                "aria-hidden": true,
                disabled,
                onClick: disabled ? void 0 : handleOpen,
                size: "small",
                sx: {
                  color: "grey.500",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "transparent" }
                },
                tabIndex: -1,
                children: /* @__PURE__ */ jsxRuntime.jsx(CalendarMonthIcon__default.default, { fontSize: "small" })
              }
            ) })
          }
        },
        value: displayValue,
        variant: "outlined"
      }
    ),
    showHelper ? /* @__PURE__ */ jsxRuntime.jsx(StyledHelperText3, { fieldStatus, children: helperContent }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs(
      Popover__default.default,
      {
        anchorEl,
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        onClose: handleClose,
        open,
        slotProps: {
          paper: {
            sx: {
              mt: "4px",
              width: 320,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 4
            }
          }
        },
        transformOrigin: { vertical: "top", horizontal: "left" },
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            Box4__default.default,
            {
              sx: {
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                px: 1.5,
                pt: 1.5,
                pb: 1,
                gap: 0
              },
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }, children: /* @__PURE__ */ jsxRuntime.jsxs(
                  Box4__default.default,
                  {
                    sx: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "fit-content"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        Typography__default.default,
                        {
                          sx: { fontSize: 10, color: "grey.500", lineHeight: 1, mb: 0.25, textAlign: "center" },
                          variant: "caption",
                          children: uiTexts.monthLabel
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsxs(
                        Box4__default.default,
                        {
                          sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" },
                          children: [
                            /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                              StyledCompactSelect,
                              {
                                IconComponent: () => null,
                                MenuProps: selectMenuProps,
                                inputProps: { "aria-label": uiTexts.selectMonthAriaLabel },
                                onChange: (e) => setViewMonth(Number(e.target.value)),
                                size: "small",
                                value: viewMonth,
                                variant: "outlined",
                                children: monthNames.map((name2, idx) => /* @__PURE__ */ jsxRuntime.jsx(MenuItem2__default.default, { value: idx, children: name2 }, idx))
                              }
                            ) }),
                            /* @__PURE__ */ jsxRuntime.jsx(
                              KeyboardArrowDownIcon__default.default,
                              {
                                sx: { fontSize: 24, color: "grey.500", pointerEvents: "none" }
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }, children: /* @__PURE__ */ jsxRuntime.jsxs(
                  Box4__default.default,
                  {
                    sx: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "fit-content"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        Typography__default.default,
                        {
                          sx: { fontSize: 10, color: "grey.500", lineHeight: 1, mb: 0.25, textAlign: "center" },
                          variant: "caption",
                          children: uiTexts.yearLabel
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsxs(
                        Box4__default.default,
                        {
                          sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" },
                          children: [
                            /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                              StyledCompactSelect,
                              {
                                IconComponent: () => null,
                                MenuProps: selectMenuProps,
                                inputProps: { "aria-label": uiTexts.selectYearAriaLabel },
                                onChange: (e) => setViewYear(Number(e.target.value)),
                                size: "small",
                                value: viewYear,
                                variant: "outlined",
                                children: YEAR_OPTIONS.map((y) => /* @__PURE__ */ jsxRuntime.jsx(MenuItem2__default.default, { value: y, children: y }, y))
                              }
                            ) }),
                            /* @__PURE__ */ jsxRuntime.jsx(
                              KeyboardArrowDownIcon__default.default,
                              {
                                sx: { fontSize: 24, color: "grey.500", pointerEvents: "none" }
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(Divider2__default.default, {}),
          /* @__PURE__ */ jsxRuntime.jsxs(Box4__default.default, { onKeyDown: handleGridKeyDown, ref: gridRef, role: "grid", sx: { px: 1.5, py: 1 }, children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Box4__default.default,
              {
                sx: {
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  mb: 0.5
                },
                children: dayHeaders.map((h, idx) => /* @__PURE__ */ jsxRuntime.jsx(
                  Box4__default.default,
                  {
                    sx: {
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "grey.500",
                      py: 0.5
                    },
                    children: h
                  },
                  `${idx}-${h}`
                ))
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Box4__default.default,
              {
                sx: {
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.25
                },
                children: calendarGrid.map((cell, idx) => {
                  const selected = isSameDay(cell, selectedDate);
                  const focused = isSameDay(cell, focusedDate);
                  const today = isToday(cell);
                  const iso = dateToIso(new Date(cell.year, cell.month, cell.day));
                  return /* @__PURE__ */ jsxRuntime.jsx(
                    Box4__default.default,
                    {
                      "aria-label": iso,
                      "aria-pressed": selected,
                      "aria-selected": selected,
                      component: "button",
                      "data-date": iso,
                      onClick: () => handleDaySelect(cell),
                      role: "gridcell",
                      tabIndex: focused ? 0 : -1,
                      sx: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        border: today && !selected ? "1.5px solid" : "none",
                        borderColor: "primary.main",
                        background: selected ? "primary.main" : "transparent",
                        bgcolor: selected ? "primary.main" : "transparent",
                        color: selected ? "primary.contrastText" : cell.overflow ? "grey.400" : "grey.700",
                        fontSize: 13,
                        fontWeight: selected ? 700 : 400,
                        cursor: "pointer",
                        outline: focused ? "2px solid" : "none",
                        outlineColor: "primary.main",
                        outlineOffset: 1,
                        transition: "background-color 0.15s",
                        "&:hover": {
                          bgcolor: selected ? "primary.dark" : "grey.100"
                        }
                      },
                      children: cell.day
                    },
                    idx
                  );
                })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Divider2__default.default, {}),
          /* @__PURE__ */ jsxRuntime.jsxs(
            Box4__default.default,
            {
              sx: {
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              },
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  Button__default.default,
                  {
                    onClick: handleToday,
                    size: "small",
                    startIcon: /* @__PURE__ */ jsxRuntime.jsx(CalendarTodayIcon__default.default, { sx: { fontSize: "16px !important" } }),
                    variant: "text",
                    children: uiTexts.todayLabel
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(Button__default.default, { onClick: handleClear, size: "small", sx: { color: "grey.500" }, variant: "text", children: uiTexts.clearLabel })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(Box4__default.default, { sx: { px: 1.5, pb: 1.5 }, children: /* @__PURE__ */ jsxRuntime.jsx(Typography__default.default, { sx: { fontSize: 11, color: "grey.400" }, children: uiTexts.keyboardHint }) })
        ]
      }
    )
  ] });
}
var SelectDateField = SelectDateFieldInner;

exports.PhoneNumberField = PhoneNumberField;
exports.SelectDateField = SelectDateField;
exports.SelectOptionField = SelectOptionField;
exports.TextAreaField = TextAreaField;
exports.TextInputField = TextInputField;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map