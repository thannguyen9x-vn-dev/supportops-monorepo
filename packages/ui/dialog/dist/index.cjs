'use strict';

var CloseIcon = require('@mui/icons-material/Close');
var material = require('@mui/material');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var CloseIcon__default = /*#__PURE__*/_interopDefault(CloseIcon);

// src/FormDialog.tsx
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
  return /* @__PURE__ */ jsxRuntime.jsxs(material.Dialog, { fullWidth, maxWidth, onClose: dialog.close, open: dialog.isOpen, children: [
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
    /* @__PURE__ */ jsxRuntime.jsx(material.DialogContent, { dividers: true, children }),
    /* @__PURE__ */ jsxRuntime.jsxs(material.DialogActions, { sx: { px: 3, py: 2 }, children: [
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
  ] });
}

exports.FormDialog = FormDialog;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map