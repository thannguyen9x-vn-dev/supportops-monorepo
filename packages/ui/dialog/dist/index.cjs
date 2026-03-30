'use strict';

var CloseIcon = require('@mui/icons-material/Close');
var ErrorOutlineRoundedIcon = require('@mui/icons-material/ErrorOutlineRounded');
var material = require('@mui/material');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var CloseIcon__default = /*#__PURE__*/_interopDefault(CloseIcon);
var ErrorOutlineRoundedIcon__default = /*#__PURE__*/_interopDefault(ErrorOutlineRoundedIcon);

// src/ConfirmDialog.tsx
var VARIANT_COLOR = {
  error: "error.main",
  warning: "warning.main",
  info: "info.main"
};
function ConfirmDialog({
  dialog,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmDisabled = false,
  variant = "error",
  maxWidth = "xs"
}) {
  const accentColor = VARIANT_COLOR[variant];
  return /* @__PURE__ */ jsxRuntime.jsxs(
    material.Dialog,
    {
      fullWidth: true,
      maxWidth,
      onClose: dialog.close,
      open: dialog.isOpen,
      slotProps: {
        paper: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3
          }
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(material.DialogTitle, { sx: { position: "relative", pt: 4, pb: 0, textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            material.IconButton,
            {
              "aria-label": "Close dialog",
              color: "inherit",
              onClick: dialog.close,
              size: "small",
              sx: { position: "absolute", top: 12, right: 12, color: "text.secondary" },
              children: /* @__PURE__ */ jsxRuntime.jsx(CloseIcon__default.default, { fontSize: "small" })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            material.Box,
            {
              sx: {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: (theme) => material.alpha(
                  variant === "error" ? theme.palette.error.main : variant === "warning" ? theme.palette.warning.main : theme.palette.info.main,
                  0.12
                ),
                mb: 2
              },
              children: /* @__PURE__ */ jsxRuntime.jsx(ErrorOutlineRoundedIcon__default.default, { sx: { color: accentColor, fontSize: 30 } })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(material.Typography, { sx: { fontSize: "18px", fontWeight: 700, lineHeight: 1.3 }, children: title })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(material.DialogContent, { sx: { textAlign: "center", pt: 1.5, pb: 0 }, children: description ? /* @__PURE__ */ jsxRuntime.jsx(material.Typography, { color: "text.secondary", variant: "body2", children: description }) : null }),
        /* @__PURE__ */ jsxRuntime.jsxs(material.DialogActions, { sx: { px: 3, py: 2.5, gap: 1.5 }, children: [
          /* @__PURE__ */ jsxRuntime.jsx(material.Button, { fullWidth: true, onClick: dialog.close, variant: "outlined", children: cancelLabel }),
          /* @__PURE__ */ jsxRuntime.jsx(
            material.Button,
            {
              color: variant,
              disabled: confirmDisabled,
              fullWidth: true,
              onClick: () => void onConfirm(),
              variant: "contained",
              children: confirmLabel
            }
          )
        ] })
      ]
    }
  );
}
function FormDialog({
  dialog,
  title,
  children,
  formId,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitDisabled = false,
  maxWidth = "sm",
  fullWidth = true
}) {
  const titleContent = typeof title === "string" || typeof title === "number" ? /* @__PURE__ */ jsxRuntime.jsx(
    material.Typography,
    {
      className: "form-dialog-title-text",
      component: "span",
      sx: { fontSize: "20px", fontWeight: 600, lineHeight: 1.25 },
      children: title
    }
  ) : /* @__PURE__ */ jsxRuntime.jsx(material.Box, { className: "form-dialog-title-text", component: "span", children: title });
  return /* @__PURE__ */ jsxRuntime.jsxs(
    material.Dialog,
    {
      fullWidth,
      maxWidth,
      onClick: (event) => {
        event.stopPropagation();
      },
      onMouseDown: (event) => {
        event.stopPropagation();
      },
      onClose: dialog.close,
      open: dialog.isOpen,
      slotProps: {
        paper: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider"
          }
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          material.DialogTitle,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pr: 1.5,
              "& .form-dialog-title-text": {
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: 1.25
              }
            },
            children: [
              titleContent,
              /* @__PURE__ */ jsxRuntime.jsx(material.IconButton, { "aria-label": "Close dialog", onClick: dialog.close, size: "small", children: /* @__PURE__ */ jsxRuntime.jsx(CloseIcon__default.default, { fontSize: "small" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          material.DialogContent,
          {
            dividers: true,
            sx: {
              bgcolor: "background.paper",
              borderColor: "divider"
            },
            children
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(material.DialogActions, { sx: { px: 3, py: 2, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider" }, children: [
          /* @__PURE__ */ jsxRuntime.jsx(material.Button, { onClick: dialog.close, variant: "outlined", children: cancelLabel }),
          /* @__PURE__ */ jsxRuntime.jsx(
            material.Button,
            {
              disabled: submitDisabled,
              form: formId,
              onClick: formId ? void 0 : onSubmit,
              type: formId ? "submit" : "button",
              variant: "contained",
              children: submitLabel
            }
          )
        ] })
      ]
    }
  );
}

exports.ConfirmDialog = ConfirmDialog;
exports.FormDialog = FormDialog;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map