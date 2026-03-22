"use client";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { ButtonBase, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CopyTextButtonProps {
  value: string;
  copiedMessage: string;
  copyErrorMessage?: string;
  label?: string;
}

async function writeToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyTextButton({ value, copiedMessage, copyErrorMessage = "Unable to copy", label }: CopyTextButtonProps) {
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showFeedback = useCallback((state: "success" | "error") => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    setFeedback(state);
    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      timeoutRef.current = null;
    }, 1400);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await writeToClipboard(value);
      showFeedback("success");
    } catch {
      showFeedback("error");
    }
  }, [showFeedback, value]);

  return (
    <Tooltip
      arrow
      disableFocusListener
      disableHoverListener
      disableTouchListener
      open={Boolean(feedback)}
      placement="top"
      title={feedback === "error" ? copyErrorMessage : copiedMessage}
      slotProps={{
        tooltip: {
          sx: {
            border: "1px solid var(--mui-palette-divider)",
            bgcolor: "background.paper",
            color: "text.primary",
            fontSize: 12,
            fontWeight: 600,
            boxShadow:
              "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
          },
        },
        arrow: {
          sx: {
            color: "background.paper",
            "&:before": {
              border: "1px solid var(--mui-palette-divider)",
              boxSizing: "border-box",
            },
          },
        },
      }}
    >
      <ButtonBase
        aria-label={label ?? "Copy text"}
        onClick={() => {
          void handleCopy();
        }}
        sx={{
          borderRadius: 1,
          color: "text.secondary",
          display: "inline-flex",
          gap: 0.75,
          justifyContent: "flex-start",
          px: 0.5,
          py: 0.25,
          width: "fit-content",
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: "24px" }} variant="inherit">
          {value}
        </Typography>
        <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
      </ButtonBase>
    </Tooltip>
  );
}
