"use client";

import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import {
  alpha,
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

import { type DialogControl } from "./FormDialog";

export interface ConfirmDialogProps {
  /** Dialog open/close controller (e.g. from useDialog()) */
  dialog: DialogControl;
  /** Bold title shown inside the dialog */
  title: ReactNode;
  /** Optional descriptive text below the title */
  description?: ReactNode;
  /** Label for the confirm/action button (default: "Confirm") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Called when the user clicks the confirm button */
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
  /** Controls the accent color of the icon and confirm button (default: "error") */
  variant?: "error" | "warning" | "info";
  maxWidth?: DialogProps["maxWidth"];
}

const VARIANT_COLOR = {
  error: "error.main",
  warning: "warning.main",
  info: "info.main",
} as const;

export function ConfirmDialog({
  dialog,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmDisabled = false,
  variant = "error",
  maxWidth = "xs",
}: ConfirmDialogProps) {
  const accentColor = VARIANT_COLOR[variant];

  return (
    <Dialog
      fullWidth
      maxWidth={maxWidth}
      onClose={dialog.close}
      open={dialog.isOpen}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ position: "relative", pt: 4, pb: 0, textAlign: "center" }}>
        <IconButton
          aria-label="Close dialog"
          color="inherit"
          onClick={dialog.close}
          size="small"
          sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: (theme) =>
              alpha(
                variant === "error"
                  ? theme.palette.error.main
                  : variant === "warning"
                    ? theme.palette.warning.main
                    : theme.palette.info.main,
                0.12,
              ),
            mb: 2,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ color: accentColor, fontSize: 30 }} />
        </Box>

        <Typography sx={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", pt: 1.5, pb: 0 }}>
        {description ? (
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button fullWidth onClick={dialog.close} variant="outlined">
          {cancelLabel}
        </Button>
        <Button
          color={variant}
          disabled={confirmDisabled}
          fullWidth
          onClick={() => void onConfirm()}
          variant="contained"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
