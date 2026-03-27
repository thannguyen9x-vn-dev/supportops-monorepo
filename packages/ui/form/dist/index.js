import { useState, useMemo, useCallback, createElement, useRef, useEffect } from 'react';
import { useController, useFormState, useWatch } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import Box4 from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider2 from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem2 from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// src/field/input/SelectOptionField.tsx
var textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px"
};
var POPUP_OFFSET = [0, 8];
var StyledTextField = styled(TextField)(({ theme }) => {
  const controlHeight = 40;
  const borderRadius = 8;
  const innerRadius = Math.max(borderRadius - 2, 0);
  const varsPalette = theme.vars?.palette;
  const borderColor = varsPalette?.divider ?? theme.palette.divider;
  const backgroundPaper = varsPalette?.background.paper ?? theme.palette.background.paper;
  const textPrimary = varsPalette?.text.primary ?? theme.palette.text.primary;
  const textSecondary = varsPalette?.text.secondary ?? theme.palette.text.secondary;
  const textDisabled = varsPalette?.text.disabled ?? theme.palette.text.disabled;
  const disabledBackground = varsPalette?.action.disabledBackground ?? theme.palette.action.disabledBackground;
  return {
    "& .MuiOutlinedInput-root": {
      minHeight: controlHeight,
      borderRadius,
      overflow: "hidden",
      backgroundColor: backgroundPaper,
      color: textPrimary,
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
        color: textPrimary,
        outline: "none",
        WebkitTextFillColor: textPrimary,
        caretColor: textPrimary,
        "&::placeholder": {
          color: textSecondary,
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
        backgroundColor: disabledBackground,
        color: textDisabled,
        "& fieldset": {
          borderColor
        }
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        display: "none"
      },
      "& .MuiOutlinedInput-notchedOutline": {
        top: 0,
        borderRadius: "inherit"
      },
      "& .MuiSelect-select": {
        ...textSmStyle,
        boxSizing: "border-box",
        minHeight: `${controlHeight - 4}px !important`,
        height: `${controlHeight - 4}px !important`,
        width: "calc(100% - 4px)",
        margin: "2px",
        display: "flex",
        alignItems: "center",
        padding: "10px 38px 10px 14px !important",
        color: textPrimary,
        WebkitTextFillColor: textPrimary,
        backgroundColor: `${backgroundPaper} !important`,
        borderRadius: `${innerRadius}px`
      },
      "& .MuiSelect-select:focus": {
        backgroundColor: `${backgroundPaper} !important`
      },
      "& .MuiSelect-select.Mui-disabled": {
        color: textDisabled,
        WebkitTextFillColor: textDisabled
      },
      // Neutralize global MuiOutlinedInput input background/radius on select display
      "& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input": {
        backgroundColor: `${backgroundPaper} !important`,
        borderRadius: `${innerRadius}px`,
        boxShadow: "none !important"
      },
      "& .MuiSelect-nativeInput": {
        inset: 0,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        backgroundColor: "transparent !important",
        borderRadius: 0
      },
      "& .MuiSelect-icon": {
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        marginTop: 0,
        fontSize: 24
      }
    }
  };
});
var StyledFieldLabel = styled(FormLabel)(({ theme }) => ({
  ...textSmStyle,
  display: "block",
  color: theme.palette.text.secondary,
  marginBottom: 6
}));
var StyledHelperText = styled(FormHelperText)(({ theme }) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle,
  color: theme.palette.text.secondary,
  "&.Mui-error": {
    color: theme.palette.error.main
  }
}));
var popupPaperBorderStyles = {
  border: "1px solid var(--mui-palette-divider)",
  borderRadius: "8px",
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
  } = useController({
    name,
    control,
    rules
  });
  const helperTextContent = error?.message ?? helperText;
  const showHelper = !hideEmptyHelperText || helperTextContent;
  const inputId = id ?? String(name);
  const [open, setOpen] = useState(false);
  const [popupSearchValue, setPopupSearchValue] = useState("");
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === field.value) ?? null;
  }, [field.value, options]);
  const popupSearchText = popupSearchValue.trim().toLocaleLowerCase();
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const handleClose = useCallback(
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
  const handleClickAway = useCallback(() => {
    if (!searchInPopup) return;
    setOpen(false);
    setPopupSearchValue("");
  }, [searchInPopup]);
  const handleSelect = useCallback(
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
  const mergedPopperSlotProps = useMemo(() => {
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
  const PopupPaper = useCallback(
    (paperProps) => {
      const { children, ...rest } = paperProps;
      return /* @__PURE__ */ jsxs(
        Paper,
        {
          ...rest,
          sx: {
            ...popupPaperBorderStyles,
            paddingTop: searchInPopup ? 1 : 0
          },
          children: [
            searchInPopup ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Box4, { sx: { paddingX: 1, paddingBottom: 1 }, children: /* @__PURE__ */ jsx(
                TextField,
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
              /* @__PURE__ */ jsx(Divider2, {})
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
      top: "50%",
      transform: "translateY(-50%)",
      right: 8,
      display: "flex",
      alignItems: "center"
    },
    "& .MuiAutocomplete-popupIndicator": {
      width: 24,
      height: 24,
      minWidth: 24,
      border: 0,
      borderRadius: 6,
      backgroundColor: "transparent !important",
      boxShadow: "none",
      color: "var(--mui-palette-text-secondary)",
      padding: 0,
      "&:hover": {
        backgroundColor: "transparent",
        color: "var(--mui-palette-text-primary)"
      },
      "& .MuiSvgIcon-root": {
        fontSize: 24
      }
    },
    "& .MuiAutocomplete-popupIndicator.Mui-focused": {
      backgroundColor: "transparent"
    },
    "& .MuiAutocomplete-clearIndicator": {
      width: 20,
      height: 20,
      minWidth: 20,
      border: 0,
      borderRadius: 4,
      backgroundColor: "transparent !important",
      boxShadow: "none",
      color: "var(--mui-palette-text-secondary)",
      padding: 0,
      "&:hover": {
        backgroundColor: "transparent !important",
        color: "var(--mui-palette-text-primary)"
      },
      "& .MuiSvgIcon-root": {
        fontSize: 16
      }
    },
    "& .MuiAutocomplete-listbox": {
      maxHeight: 320
    }
  };
  const nativeSelectMenuProps = {
    PaperProps: {
      sx: {
        ...popupPaperBorderStyles,
        mt: "4px",
        bgcolor: "background.paper",
        "& .MuiMenuItem-root": {
          ...textSmStyle,
          color: "text.primary"
        },
        "& .MuiMenuItem-root:hover": {
          bgcolor: "action.hover"
        },
        "& .MuiMenuItem-root.Mui-selected": {
          bgcolor: "action.selected"
        },
        "& .MuiMenuItem-root.Mui-selected:hover": {
          bgcolor: "action.selected"
        },
        "& .MuiMenuItem-root.Mui-disabled": {
          color: "text.disabled"
        }
      }
    }
  };
  function PopupSearchAutocomplete() {
    return /* @__PURE__ */ jsx(ClickAwayListener, { onClickAway: handleClickAway, children: /* @__PURE__ */ jsx(Box4, { sx: { width: "100%" }, children: /* @__PURE__ */ jsx(
      Autocomplete,
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
        popupIcon: /* @__PURE__ */ jsx(KeyboardArrowDownRoundedIcon, {}),
        renderInput: (params) => /* @__PURE__ */ jsx(
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
          clearIndicator: {
            ...autocompleteProps?.slotProps?.clearIndicator ?? {},
            disableRipple: true,
            sx: {
              color: "text.secondary",
              backgroundColor: "transparent !important",
              "&:hover": { backgroundColor: "transparent !important", color: "text.primary" },
              "& .MuiSvgIcon-root": { fontSize: 16 }
            }
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
    return /* @__PURE__ */ jsx(
      Autocomplete,
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
        popupIcon: /* @__PURE__ */ jsx(KeyboardArrowDownRoundedIcon, {}),
        renderInput: (params) => /* @__PURE__ */ jsx(
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
          },
          clearIndicator: {
            ...autocompleteProps?.slotProps?.clearIndicator ?? {},
            disableRipple: true,
            sx: {
              color: "text.secondary",
              backgroundColor: "transparent !important",
              "&:hover": { backgroundColor: "transparent !important", color: "text.primary" },
              "& .MuiSvgIcon-root": { fontSize: 16 }
            }
          },
          popper: mergedPopperSlotProps
        },
        sx: autocompleteSx,
        value: selectedOption
      }
    );
  }
  function NativeSelectField() {
    return /* @__PURE__ */ jsx(
      StyledTextField,
      {
        ...textFieldProps,
        ...field,
        disabled,
        error: Boolean(error),
        fullWidth: true,
        id: inputId,
        SelectProps: {
          MenuProps: nativeSelectMenuProps,
          displayEmpty: true,
          renderValue: (selected) => {
            if (selected === "" || selected === null || selected === void 0) {
              return /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    color: "var(--mui-palette-text-secondary)",
                    WebkitTextFillColor: "var(--mui-palette-text-secondary)",
                    fontWeight: 400
                  },
                  children: placeholder ?? "Select"
                }
              );
            }
            return /* @__PURE__ */ jsx("span", { children: options.find((o) => o.value === selected)?.label ?? String(selected) });
          }
        },
        select: true,
        value: field.value ?? "",
        variant: "outlined",
        children: options.map((option) => /* @__PURE__ */ jsx(MenuItem2, { disabled: option.disabled, value: option.value, children: option.label }, String(option.value)))
      }
    );
  }
  return /* @__PURE__ */ jsxs(Box4, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsx(StyledFieldLabel, { htmlFor: inputId, children: label }) : null,
    searchable ? searchInPopup ? PopupSearchAutocomplete() : InlineSearchAutocomplete() : NativeSelectField(),
    showHelper ? /* @__PURE__ */ jsx(StyledHelperText, { error: Boolean(error), children: helperTextContent }) : null
  ] });
}
var SelectOptionField = SelectOptionFieldInner;
function getBorderRadiusPx(value) {
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
var StyledTextField2 = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => {
  const controlHeight = 40;
  const baseRadius = getBorderRadiusPx(theme.shape.borderRadius);
  const borderRadius = baseRadius * 3;
  const varsPalette = theme.vars?.palette;
  const baseBorderColor = varsPalette?.divider ?? theme.palette.divider;
  const focusBorderColor = varsPalette?.primary.main ?? theme.palette.primary.main;
  const backgroundPaper = varsPalette?.background.paper ?? theme.palette.background.paper;
  const textPrimary = varsPalette?.text.primary ?? theme.palette.text.primary;
  const textSecondary = varsPalette?.text.secondary ?? theme.palette.text.secondary;
  const textDisabled = varsPalette?.text.disabled ?? theme.palette.text.disabled;
  const disabledBackground = varsPalette?.action.disabledBackground ?? theme.palette.action.disabledBackground;
  const statusBorderColor = fieldStatus === "success" ? varsPalette?.success.main ?? theme.palette.success.main : fieldStatus === "error" ? varsPalette?.error.main ?? theme.palette.error.main : baseBorderColor;
  return {
    "& .MuiOutlinedInput-root": {
      height: controlHeight,
      minHeight: controlHeight,
      borderRadius,
      backgroundColor: backgroundPaper,
      color: textPrimary,
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
        backgroundColor: disabledBackground,
        color: textDisabled,
        "& fieldset": {
          borderColor: baseBorderColor
        },
        "& .MuiOutlinedInput-input::placeholder": {
          color: textDisabled
        }
      },
      "& .MuiOutlinedInput-input": {
        ...textSmStyle2,
        boxSizing: "border-box",
        height: controlHeight,
        padding: "10px 16px",
        color: `${textPrimary} !important`,
        outline: "none",
        WebkitTextFillColor: `${textPrimary} !important`,
        caretColor: textPrimary,
        opacity: 1,
        "&::placeholder": {
          color: textSecondary,
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
          WebkitTextFillColor: `${textPrimary} !important`,
          caretColor: textPrimary,
          WebkitBoxShadow: `0 0 0 1000px ${backgroundPaper} inset`,
          boxShadow: `0 0 0 1000px ${backgroundPaper} inset`,
          borderRadius,
          transition: "background-color 99999s ease-out 0s"
        }
      },
      "& .MuiOutlinedInput-input.MuiInputBase-inputAdornedStart": {
        paddingLeft: 0
      },
      "& .MuiInputAdornment-root": {
        color: fieldStatus === "default" ? textSecondary : statusBorderColor
      },
      "& .MuiInputAdornment-positionStart": {
        marginLeft: 12,
        marginRight: 8
      },
      "& .MuiInputAdornment-positionEnd": {
        marginLeft: 8,
        marginRight: 12,
        alignSelf: "center",
        backgroundColor: "transparent"
      },
      "&.MuiInputBase-multiline .MuiInputAdornment-positionEnd": {
        marginTop: 0
      },
      "& .MuiSvgIcon-root": {
        fontSize: 22
      },
      "& .field-status-overlay-icon": {
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        display: "inline-flex",
        alignItems: "center",
        pointerEvents: "none",
        backgroundColor: "transparent",
        zIndex: 1
      },
      "& .field-status-overlay-icon.field-status-overlay-icon-with-end": {
        right: 52
      },
      "&.MuiInputBase-multiline": {
        height: "auto",
        minHeight: "unset",
        alignItems: "flex-start",
        padding: 0
      },
      "& .MuiOutlinedInput-input.MuiInputBase-inputMultiline": {
        ...textSmStyle2,
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
var StyledFieldLabel2 = styled(FormLabel)(({ theme }) => ({
  ...textSmStyle2,
  display: "block",
  color: theme.palette.text.secondary,
  marginBottom: 6
}));
var StyledHelperText2 = styled(FormHelperText, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle2,
  color: fieldStatus === "success" ? theme.palette.success.main : fieldStatus === "error" ? theme.palette.error.main : theme.palette.text.secondary
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
    successIcon = /* @__PURE__ */ jsx(CheckCircleOutlineIcon, { fontSize: "small" }),
    errorIcon = /* @__PURE__ */ jsx(ErrorOutlineIcon, { fontSize: "small" }),
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
  } = useController({
    name,
    control,
    rules
  });
  const fieldStatus = useMemo(() => {
    if (externalStatus) return externalStatus;
    if (error) return "error";
    if (showSuccessState && isTouched && isDirty && !error) return "success";
    return "default";
  }, [externalStatus, error, showSuccessState, isTouched, isDirty]);
  const helperTextContent = useMemo(() => {
    if (fieldStatus === "error" && error?.message) {
      return error.message;
    }
    if (fieldStatus === "success" && successMessage) {
      return /* @__PURE__ */ jsxs(Box4, { component: "span", children: [
        /* @__PURE__ */ jsx("span", { className: "helper-text-title", children: "Well done!" }),
        /* @__PURE__ */ jsx("span", { children: successMessage })
      ] });
    }
    return helperText;
  }, [error, fieldStatus, helperText, successMessage]);
  const configuredType = textFieldProps.type ?? inputType;
  const isPasswordField = configuredType === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const startAdornment = useMemo(() => {
    if (!startIcon) return void 0;
    return /* @__PURE__ */ jsx(InputAdornment, { position: "start", children: startIcon });
  }, [startIcon]);
  const endAdornment = useMemo(() => {
    const passwordToggle = isPasswordField && showPasswordToggle ? /* @__PURE__ */ jsx(
      IconButton,
      {
        "aria-label": isPasswordVisible ? "Hide password" : "Show password",
        edge: "end",
        onClick: () => setIsPasswordVisible((prev) => !prev),
        size: "small",
        sx: {
          color: "text.secondary",
          bgcolor: "transparent",
          width: 28,
          height: 28,
          p: 0,
          "&:hover": { bgcolor: "transparent" }
        },
        children: isPasswordVisible ? /* @__PURE__ */ jsx(VisibilityOutlinedIcon, { fontSize: "small" }) : /* @__PURE__ */ jsx(VisibilityOffOutlinedIcon, { fontSize: "small" })
      }
    ) : null;
    const statusIcon = fieldStatus === "success" ? successIcon : fieldStatus === "error" ? errorIcon : null;
    const resolvedEndIcon = endIcon ?? passwordToggle;
    if (!statusIcon && !resolvedEndIcon) return void 0;
    const statusOverlay = statusIcon ? /* @__PURE__ */ jsx(
      Box4,
      {
        "aria-hidden": true,
        className: `field-status-overlay-icon${resolvedEndIcon ? " field-status-overlay-icon-with-end" : ""}`,
        children: statusIcon
      }
    ) : null;
    if (!resolvedEndIcon) {
      return statusOverlay;
    }
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      statusOverlay,
      /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(Box4, { sx: { display: "inline-flex", alignItems: "center" }, children: resolvedEndIcon }) })
    ] });
  }, [
    endIcon,
    errorIcon,
    fieldStatus,
    isPasswordField,
    isPasswordVisible,
    showPasswordToggle,
    successIcon
  ]);
  const showHelper = !hideEmptyHelperText || helperTextContent;
  const inputId = id ?? String(name);
  const renderedType = isPasswordField && showPasswordToggle && !endIcon ? isPasswordVisible ? "text" : "password" : configuredType;
  return /* @__PURE__ */ jsxs(Box4, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsx(StyledFieldLabel2, { htmlFor: inputId, children: label }) : null,
    /* @__PURE__ */ jsx(
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
    showHelper ? /* @__PURE__ */ jsx(StyledHelperText2, { fieldStatus, children: helperTextContent }) : null
  ] });
}
var TextInputField = TextInputFieldInner;
function TextAreaField(props) {
  const { maxRows, minRows = 4, ...rest } = props;
  return /* @__PURE__ */ jsx(TextInputField, { ...rest, multiline: true, maxRows, minRows });
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
  const { errors } = useFormState({
    control,
    name: [countryName, phoneName]
  });
  const selectedCountry = useWatch({ control, name: countryName });
  const selectedCountryOption = useMemo(
    () => countryOptions.find((option) => option.value === selectedCountry) ?? null,
    [countryOptions, selectedCountry]
  );
  return /* @__PURE__ */ jsxs(Box4, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsx(
      FormLabel,
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
    /* @__PURE__ */ jsxs(
      Box4,
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
          /* @__PURE__ */ jsxs(Box4, { className: "phone-country-control", children: [
            selectedCountryOption ? /* @__PURE__ */ jsxs(Box4, { "aria-hidden": true, className: "phone-country-value-overlay", children: [
              /* @__PURE__ */ jsx("span", { className: "phone-country-flag", children: selectedCountryOption.flag }),
              /* @__PURE__ */ jsx("span", { className: "phone-country-dial", children: `(+${selectedCountryOption.dialingCode})` })
            ] }) : null,
            /* @__PURE__ */ jsx(
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
                    return /* @__PURE__ */ createElement("li", { ...renderProps, key: String(typedOption.value) }, `${typedOption.flag} ${typedOption.countryName} (+${typedOption.dialingCode})`);
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Box4, { className: "phone-number-control", children: /* @__PURE__ */ jsx(
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
    errors[phoneName]?.message || errors[countryName]?.message ? /* @__PURE__ */ jsx(
      FormHelperText,
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
function getBorderRadiusPx2(value) {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 8;
  return parsed;
}
var StyledTextField3 = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => {
  const controlHeight = 40;
  const baseRadius = getBorderRadiusPx2(theme.shape.borderRadius);
  const borderRadius = baseRadius * 3;
  const baseBorderColor = theme.palette.divider;
  const focusBorderColor = theme.palette.primary.main;
  const statusBorderColor = fieldStatus === "error" ? theme.palette.error.main : baseBorderColor;
  return {
    "& .MuiOutlinedInput-root": {
      height: controlHeight,
      minHeight: controlHeight,
      borderRadius,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
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
        backgroundColor: theme.palette.action.disabledBackground,
        cursor: "default",
        "& fieldset": {
          borderColor: theme.palette.divider
        }
      },
      "& .MuiOutlinedInput-input": {
        ...textSmStyle4,
        boxSizing: "border-box",
        height: controlHeight,
        padding: "10px 16px",
        color: theme.palette.text.primary,
        outline: "none",
        cursor: "pointer",
        "&::placeholder": {
          color: theme.palette.text.secondary,
          fontWeight: 400,
          opacity: 1
        },
        "&:focus": { outline: "none" },
        "&:focus-visible": { outline: "none" }
      },
      "& .MuiInputAdornment-root": {
        marginLeft: 12,
        marginRight: 8,
        color: fieldStatus === "error" ? theme.palette.error.main : theme.palette.text.secondary
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
var StyledFieldLabel3 = styled(FormLabel)(({ theme }) => ({
  ...textSmStyle4,
  display: "block",
  color: theme.palette.text.secondary,
  marginBottom: 6
}));
var StyledHelperText3 = styled(FormHelperText, {
  shouldForwardProp: (prop) => prop !== "fieldStatus"
})(({ theme, fieldStatus = "default" }) => ({
  marginLeft: 0,
  marginTop: 8,
  ...textSmStyle4,
  color: fieldStatus === "error" ? theme.palette.error.main : theme.palette.text.secondary
}));
var StyledCompactSelect = styled(Select)(({ theme }) => ({
  minWidth: 0,
  "& .MuiSelect-select": {
    ...textSmStyle4,
    color: theme.palette.text.primary,
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
  } = useController({ name, control, rules });
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewYear, setViewYear] = useState(() => (/* @__PURE__ */ new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (/* @__PURE__ */ new Date()).getMonth());
  const [focusedDate, setFocusedDate] = useState(null);
  const gridRef = useRef(null);
  const open = Boolean(anchorEl);
  const selectedDate = useMemo(() => {
    const val = field.value;
    if (!val) return null;
    return isoToDate(val);
  }, [field.value]);
  const displayValue = useMemo(() => {
    const val = field.value;
    if (!val) return "";
    return formatDisplayDate(val, locale);
  }, [field.value, locale]);
  const monthNames = useMemo(() => getMonthNames(locale), [locale]);
  const dayHeaders = useMemo(() => texts?.dayHeaders ?? getDayHeaders(locale), [locale, texts]);
  const uiTexts = useMemo(
    () => ({
      ...DEFAULT_TEXTS,
      ...texts
    }),
    [texts]
  );
  const selectMenuProps = useMemo(
    () => ({
      PaperProps: {
        sx: {
          mt: "4px",
          maxHeight: "40vh",
          overflowY: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          boxShadow: 4
        }
      }
    }),
    []
  );
  const calendarGrid = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const fieldStatus = error ? "error" : "default";
  useEffect(() => {
    if (!open || !focusedDate) return;
    const iso = dateToIso(focusedDate);
    const btn = gridRef.current?.querySelector(`[data-date="${iso}"]`);
    btn?.focus();
  }, [focusedDate, open]);
  const handleOpen = useCallback(
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
  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setFocusedDate(null);
  }, []);
  const handleDaySelect = useCallback(
    (cell) => {
      const date = new Date(cell.year, cell.month, cell.day);
      field.onChange(dateToIso(date));
      setAnchorEl(null);
      setFocusedDate(null);
    },
    [field]
  );
  const handleToday = useCallback(() => {
    const today = /* @__PURE__ */ new Date();
    field.onChange(dateToIso(today));
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setAnchorEl(null);
    setFocusedDate(null);
  }, [field]);
  const handleClear = useCallback(() => {
    field.onChange("");
    setAnchorEl(null);
    setFocusedDate(null);
  }, [field]);
  const handlePrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);
  const handleNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);
  const handleGridKeyDown = useCallback(
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
  const helperContent = error?.message ?? null;
  return /* @__PURE__ */ jsxs(Box4, { sx: { width: "100%" }, children: [
    label ? /* @__PURE__ */ jsx(StyledFieldLabel3, { htmlFor: inputId, children: label }) : null,
    /* @__PURE__ */ jsx(
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
            endAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx(
              IconButton,
              {
                "aria-hidden": true,
                disabled,
                onClick: disabled ? void 0 : handleOpen,
                size: "small",
                sx: {
                  color: "text.secondary",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "transparent" }
                },
                tabIndex: -1,
                children: /* @__PURE__ */ jsx(CalendarMonthIcon, { fontSize: "small" })
              }
            ) })
          }
        },
        value: displayValue,
        variant: "outlined"
      }
    ),
    showHelper ? /* @__PURE__ */ jsx(StyledHelperText3, { fieldStatus, children: helperContent }) : null,
    /* @__PURE__ */ jsxs(
      Popover,
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
              borderColor: "divider",
              bgcolor: "background.paper",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 4
            }
          }
        },
        transformOrigin: { vertical: "top", horizontal: "left" },
        children: [
          /* @__PURE__ */ jsxs(
            Box4,
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
                /* @__PURE__ */ jsx(Box4, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }, children: /* @__PURE__ */ jsxs(
                  Box4,
                  {
                    sx: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "fit-content"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          sx: { fontSize: 10, color: "text.secondary", lineHeight: 1, mb: 0.25, textAlign: "center" },
                          variant: "caption",
                          children: uiTexts.monthLabel
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        Box4,
                        {
                          sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" },
                          children: [
                            /* @__PURE__ */ jsx(Box4, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsx(
                              StyledCompactSelect,
                              {
                                IconComponent: () => null,
                                MenuProps: selectMenuProps,
                                inputProps: { "aria-label": uiTexts.selectMonthAriaLabel },
                                onChange: (e) => setViewMonth(Number(e.target.value)),
                                size: "small",
                                value: viewMonth,
                                variant: "outlined",
                                children: monthNames.map((name2, idx) => /* @__PURE__ */ jsx(MenuItem2, { value: idx, children: name2 }, idx))
                              }
                            ) }),
                            /* @__PURE__ */ jsx(
                              KeyboardArrowDownIcon,
                              {
                                sx: { fontSize: 24, color: "text.secondary", pointerEvents: "none" }
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(Box4, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }, children: /* @__PURE__ */ jsxs(
                  Box4,
                  {
                    sx: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "fit-content"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          sx: { fontSize: 10, color: "text.secondary", lineHeight: 1, mb: 0.25, textAlign: "center" },
                          variant: "caption",
                          children: uiTexts.yearLabel
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        Box4,
                        {
                          sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" },
                          children: [
                            /* @__PURE__ */ jsx(Box4, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsx(
                              StyledCompactSelect,
                              {
                                IconComponent: () => null,
                                MenuProps: selectMenuProps,
                                inputProps: { "aria-label": uiTexts.selectYearAriaLabel },
                                onChange: (e) => setViewYear(Number(e.target.value)),
                                size: "small",
                                value: viewYear,
                                variant: "outlined",
                                children: YEAR_OPTIONS.map((y) => /* @__PURE__ */ jsx(MenuItem2, { value: y, children: y }, y))
                              }
                            ) }),
                            /* @__PURE__ */ jsx(
                              KeyboardArrowDownIcon,
                              {
                                sx: { fontSize: 24, color: "text.secondary", pointerEvents: "none" }
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
          /* @__PURE__ */ jsx(Divider2, {}),
          /* @__PURE__ */ jsxs(Box4, { onKeyDown: handleGridKeyDown, ref: gridRef, role: "grid", sx: { px: 1.5, py: 1 }, children: [
            /* @__PURE__ */ jsx(
              Box4,
              {
                sx: {
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  mb: 0.5
                },
                children: dayHeaders.map((h, idx) => /* @__PURE__ */ jsx(
                  Box4,
                  {
                    sx: {
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "text.secondary",
                      py: 0.5
                    },
                    children: h
                  },
                  `${idx}-${h}`
                ))
              }
            ),
            /* @__PURE__ */ jsx(
              Box4,
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
                  return /* @__PURE__ */ jsx(
                    Box4,
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
                        color: selected ? "primary.contrastText" : cell.overflow ? "text.disabled" : "text.primary",
                        fontSize: 13,
                        fontWeight: selected ? 700 : 400,
                        cursor: "pointer",
                        outline: focused ? "2px solid" : "none",
                        outlineColor: "primary.main",
                        outlineOffset: 1,
                        transition: "background-color 0.15s",
                        "&:hover": {
                          bgcolor: selected ? "primary.dark" : "action.hover"
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
          /* @__PURE__ */ jsx(Divider2, {}),
          /* @__PURE__ */ jsxs(
            Box4,
            {
              sx: {
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              },
              children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: handleToday,
                    size: "small",
                    startIcon: /* @__PURE__ */ jsx(CalendarTodayIcon, { sx: { fontSize: "16px !important" } }),
                    variant: "text",
                    children: uiTexts.todayLabel
                  }
                ),
                /* @__PURE__ */ jsx(Button, { onClick: handleClear, size: "small", sx: { color: "text.secondary" }, variant: "text", children: uiTexts.clearLabel })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Box4, { sx: { px: 1.5, pb: 1.5 }, children: /* @__PURE__ */ jsx(Typography, { sx: { fontSize: 11, color: "text.disabled" }, children: uiTexts.keyboardHint }) })
        ]
      }
    )
  ] });
}
var SelectDateField = SelectDateFieldInner;
var textSmStyle5 = {
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
var StyledFieldLabel4 = styled(FormLabel)(({ theme }) => ({
  ...textSmStyle5,
  display: "block",
  color: theme.palette.text.secondary,
  marginBottom: 6
}));
var StyledTextField4 = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: getBorderRadiusPx3(theme.shape.borderRadius) * 3
  },
  "& .MuiOutlinedInput-input": {
    ...textSmStyle5,
    padding: "10px 16px",
    "&::placeholder": {
      color: theme.palette.text.secondary,
      fontWeight: 400,
      opacity: 1
    }
  }
}));
function DurationMinutesInput({
  label,
  value,
  onChange,
  min = 1,
  step = 1,
  max,
  fullWidth = true,
  ...rest
}) {
  return /* @__PURE__ */ jsxs(Box4, { sx: { width: fullWidth ? "100%" : void 0 }, children: [
    /* @__PURE__ */ jsx(StyledFieldLabel4, { children: label }),
    /* @__PURE__ */ jsx(
      StyledTextField4,
      {
        ...rest,
        fullWidth,
        onChange: (event) => onChange(event.target.value),
        slotProps: {
          htmlInput: {
            inputMode: "numeric",
            min,
            max,
            step
          }
        },
        type: "number",
        value,
        variant: "outlined"
      }
    )
  ] });
}

export { DurationMinutesInput, PhoneNumberField, SelectDateField, SelectOptionField, TextAreaField, TextInputField };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map