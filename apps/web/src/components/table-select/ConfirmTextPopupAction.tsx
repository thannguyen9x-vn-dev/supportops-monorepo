"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useDialog } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";
import { Button, Stack, TextField, type SxProps, type Theme } from "@mui/material";

type ConfirmTextPopupActionProps = {
  title: ReactNode;
  triggerLabel: ReactNode;
  value?: string | null;
  onSubmit: (nextValue: string) => Promise<void> | void;
  submitLabel?: string;
  cancelLabel?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  triggerSx?: SxProps<Theme>;
};

export function ConfirmTextPopupAction({
  title,
  triggerLabel,
  value,
  onSubmit,
  submitLabel = "Apply",
  cancelLabel = "Cancel",
  label,
  placeholder,
  disabled = false,
  maxLength = 255,
  triggerSx,
}: ConfirmTextPopupActionProps) {
  const dialog = useDialog();
  const id = useId();
  const [submitting, setSubmitting] = useState(false);
  const [draftValue, setDraftValue] = useState("");
  const formId = `confirm-text-popup-form-${id}`;
  const normalizedValue = value ?? "";
  const canSubmit = !submitting && draftValue !== normalizedValue;

  useEffect(() => {
    if (!dialog.isOpen) return;
    setDraftValue(normalizedValue);
  }, [dialog.isOpen, normalizedValue]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(draftValue);
      dialog.close();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button disabled={disabled || submitting} onClick={dialog.open} size="small" sx={triggerSx} variant="outlined">
        {triggerLabel}
      </Button>

      <FormDialog
        cancelLabel={cancelLabel}
        dialog={dialog}
        formId={formId}
        submitDisabled={!canSubmit}
        submitLabel={submitLabel}
        title={title}
      >
        <Stack
          component="form"
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          spacing={1.25}
        >
          <TextField
            autoFocus
            fullWidth
            inputProps={{ maxLength }}
            label={label}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={placeholder}
            size="small"
            value={draftValue}
          />
        </Stack>
      </FormDialog>
    </>
  );
}
