"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  type DialogProps,
} from "@mui/material";
import { type ReactNode } from "react";

/** Minimal shape required — compatible with useDialog() from @supportops/ui */
export type DialogControl = {
  isOpen: boolean;
  close: () => void;
};

export interface FormDialogProps {
  /** Dialog open/close controller (e.g. from useDialog()) */
  dialog: DialogControl;
  /** Dialog header title */
  title: ReactNode;
  /** Form content rendered inside the scrollable body */
  children: ReactNode;
  /**
   * When provided, the Submit button acts as `type="submit" form={formId}`.
   * Use this when the <form> lives inside children and owns its own submit handler.
   */
  formId?: string;
  /**
   * Called when the Submit button is clicked and no formId is provided.
   * Ignored when formId is set.
   */
  onSubmit?: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
}

export function FormDialog({
  dialog,
  title,
  children,
  formId,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitDisabled = false,
  maxWidth = "sm",
  fullWidth = true,
}: FormDialogProps) {
  const titleContent =
    typeof title === "string" || typeof title === "number" ? (
      <Typography
        className="form-dialog-title-text"
        component="span"
        sx={{ fontSize: "20px", fontWeight: 600, lineHeight: 1.25 }}
      >
        {title}
      </Typography>
    ) : (
      <Box className="form-dialog-title-text" component="span">
        {title}
      </Box>
    );

  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      onClose={dialog.close}
      open={dialog.isOpen}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1.5,
          "& .form-dialog-title-text": {
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: 1.25,
          },
        }}
      >
        {titleContent}
        <IconButton aria-label="Close dialog" onClick={dialog.close} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          bgcolor: "background.paper",
          borderColor: "divider",
        }}
      >
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={dialog.close} variant="outlined">
          {cancelLabel}
        </Button>
        <Button
          disabled={submitDisabled}
          form={formId}
          onClick={formId ? undefined : onSubmit}
          type={formId ? "submit" : "button"}
          variant="contained"
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
