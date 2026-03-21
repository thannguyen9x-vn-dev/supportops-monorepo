import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { jsxs, jsx } from 'react/jsx-runtime';

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
  const titleContent = typeof title === "string" || typeof title === "number" ? /* @__PURE__ */ jsx(
    Typography,
    {
      className: "form-dialog-title-text",
      component: "span",
      sx: { fontSize: "20px", fontWeight: 600, lineHeight: 1.25 },
      children: title
    }
  ) : /* @__PURE__ */ jsx(Box, { className: "form-dialog-title-text", component: "span", children: title });
  return /* @__PURE__ */ jsxs(Dialog, { fullWidth, maxWidth, onClose: dialog.close, open: dialog.isOpen, children: [
    /* @__PURE__ */ jsxs(
      DialogTitle,
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
          /* @__PURE__ */ jsx(IconButton, { "aria-label": "Close dialog", onClick: dialog.close, size: "small", children: /* @__PURE__ */ jsx(CloseIcon, { fontSize: "small" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(DialogContent, { dividers: true, children }),
    /* @__PURE__ */ jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [
      /* @__PURE__ */ jsx(Button, { onClick: dialog.close, variant: "outlined", children: cancelLabel }),
      /* @__PURE__ */ jsx(
        Button,
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

export { FormDialog };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map