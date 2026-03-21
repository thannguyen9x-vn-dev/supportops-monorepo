"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useDialog } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";
import { Button, Stack, type SxProps, type Theme } from "@mui/material";
import { SelectOptionField } from "@supportops/ui-form";
import { useForm } from "react-hook-form";

type SelectOption = {
  label: string;
  value: string;
};

type FormValues = {
  value: string;
};

type ConfirmSelectOptionPopupActionProps = {
  title: ReactNode;
  triggerLabel: ReactNode;
  value?: string | null;
  options: SelectOption[];
  onSubmit: (nextValue: string) => Promise<void> | void;
  submitLabel?: string;
  cancelLabel?: string;
  label?: string;
  disabled?: boolean;
  triggerSx?: SxProps<Theme>;
};

export function ConfirmSelectOptionPopupAction({
  title,
  triggerLabel,
  value,
  options,
  onSubmit,
  submitLabel = "Apply",
  cancelLabel = "Cancel",
  label,
  disabled = false,
  triggerSx,
}: ConfirmSelectOptionPopupActionProps) {
  const dialog = useDialog();
  const id = useId();
  const [submitting, setSubmitting] = useState(false);
  const formId = `confirm-select-option-popup-form-${id}`;
  const normalizedValue = value ?? "";

  const {
    control,
    watch,
    reset,
    handleSubmit,
  } = useForm<FormValues>({
    defaultValues: {
      value: normalizedValue,
    },
  });

  useEffect(() => {
    if (!dialog.isOpen) return;
    reset({ value: normalizedValue });
  }, [dialog.isOpen, normalizedValue, reset]);

  const currentValue = watch("value");
  const canSubmit = useMemo(
    () => !submitting && Boolean(currentValue) && currentValue !== normalizedValue,
    [currentValue, normalizedValue, submitting],
  );

  const submitForm = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values.value);
      dialog.close();
    } finally {
      setSubmitting(false);
    }
  });

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
            void submitForm();
          }}
          spacing={1.25}
        >
          <SelectOptionField
            control={control}
            hideEmptyHelperText
            label={label}
            name="value"
            options={options}
            rules={{ required: true }}
          />
        </Stack>
      </FormDialog>
    </>
  );
}
