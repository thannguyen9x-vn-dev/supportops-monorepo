"use client";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { alpha, Box, IconButton, Paper, Snackbar, Stack, Typography } from "@mui/material";
import type { AlertColor } from "@mui/material";
import type { SnackbarCloseReason } from "@mui/material/Snackbar";

type AppToastProps = {
  autoHideDuration?: number;
  message: string;
  onClose: () => void;
  open: boolean;
  severity: AlertColor;
  toastKey?: number;
};

const VARIANT_CONFIG = {
  error: {
    Icon: ErrorOutlineRoundedIcon,
    color: "error.main",
    paletteKey: "error" as const,
  },
  success: {
    Icon: CheckCircleOutlineRoundedIcon,
    color: "success.main",
    paletteKey: "success" as const,
  },
  info: {
    Icon: InfoOutlinedIcon,
    color: "info.main",
    paletteKey: "info" as const,
  },
  warning: {
    Icon: WarningAmberRoundedIcon,
    color: "warning.main",
    paletteKey: "warning" as const,
  },
} as const;

export function AppToast({
  autoHideDuration = 3000,
  message,
  onClose,
  open,
  severity,
  toastKey,
}: AppToastProps) {
  const handleClose = (_event: unknown, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") return;
    onClose();
  };

  const { Icon, color, paletteKey } = VARIANT_CONFIG[severity];

  return (
    <Snackbar
      anchorOrigin={{ horizontal: "center", vertical: "top" }}
      autoHideDuration={autoHideDuration}
      key={toastKey}
      onClose={handleClose}
      open={open}
      sx={{ top: { xs: 16, sm: 24 } }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          minWidth: { xs: 280, sm: 400 },
          maxWidth: { xs: "calc(100vw - 32px)", sm: 520 },
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: alpha(theme.palette[paletteKey].main, 0.4),
          bgcolor: "background.paper",
          backgroundImage: `linear-gradient(${alpha(theme.palette[paletteKey].main, 0.07)}, ${alpha(theme.palette[paletteKey].main, 0.07)})`,
          boxShadow: `0 4px 16px ${alpha(theme.palette[paletteKey].main, 0.14)}`,
        })}
      >
        {/* Icon circle */}
        <Box
          sx={(theme) => ({
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette[paletteKey].main, 0.14),
          })}
        >
          <Icon sx={{ color, fontSize: 20 }} />
        </Box>

        {/* Message */}
        <Stack flexGrow={1} spacing={0}>
          <Typography
            sx={(theme) => ({
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "20px",
              color: theme.palette[paletteKey].dark ?? theme.palette[paletteKey].main,
            })}
          >
            {message}
          </Typography>
        </Stack>

        {/* Close button */}
        <IconButton
          aria-label="Close notification"
          color="inherit"
          onClick={onClose}
          size="small"
          sx={{ flexShrink: 0, color: "text.secondary", ml: 0.5 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Snackbar>
  );
}
