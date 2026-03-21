"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useDialog } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";

import type { TableSelectOption } from "./QuickSelectPopupAction";

type ConfirmSelectPopupActionProps = {
  title: ReactNode;
  triggerLabel: ReactNode;
  value: string | string[];
  options: TableSelectOption[];
  onSubmit: (nextValue: string | string[]) => Promise<void> | void;
  multiple?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  triggerSx?: SxProps<Theme>;
};

export function ConfirmSelectPopupAction({
  title,
  triggerLabel,
  value,
  options,
  onSubmit,
  multiple = false,
  submitLabel = "Apply",
  cancelLabel = "Cancel",
  disabled = false,
  triggerSx,
}: ConfirmSelectPopupActionProps) {
  const dialog = useDialog();
  const id = useId();
  const [submitting, setSubmitting] = useState(false);
  const [singleValue, setSingleValue] = useState<string>("");
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const formId = `confirm-select-popup-form-${id}`;

  useEffect(() => {
    if (!dialog.isOpen) return;
    if (multiple) {
      setMultiValue(Array.isArray(value) ? value : []);
      return;
    }
    setSingleValue(Array.isArray(value) ? value[0] ?? "" : value);
  }, [dialog.isOpen, multiple, value]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (multiple) return multiValue.length > 0;
    return Boolean(singleValue);
  }, [multiple, multiValue.length, singleValue, submitting]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(multiple ? multiValue : singleValue);
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
          {options.map((option) => (
            <FormControlLabel
              control={
                multiple ? (
                  <Checkbox
                    checked={multiValue.includes(option.value)}
                    onChange={(_event, checked) => {
                      setMultiValue((current) => {
                        if (checked) return Array.from(new Set([...current, option.value]));
                        return current.filter((valueItem) => valueItem !== option.value);
                      });
                    }}
                  />
                ) : (
                  <Radio
                    checked={singleValue === option.value}
                    onChange={() => {
                      setSingleValue(option.value);
                    }}
                  />
                )
              }
              key={option.value}
              label={<Typography variant="body2">{option.label}</Typography>}
            />
          ))}
        </Stack>
      </FormDialog>
    </>
  );
}
