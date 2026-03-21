"use client";

import { useCallback, useState, type ReactNode } from "react";

import type { UseDialogReturn } from "../../headless/use-dialog";
import { Dialog } from "./Dialog";

interface FormDialogProps {
  dialog: UseDialogReturn;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  onSubmit?: () => void | Promise<void>;
  formId?: string;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  maxWidthClassName?: string;
  dividers?: boolean;
}

export function FormDialog({
  dialog,
  title,
  subtitle,
  children,
  onSubmit,
  formId,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitDisabled = false,
  maxWidthClassName = "max-w-2xl",
  dividers = true
}: FormDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit || loading || submitDisabled) return;
    try {
      setLoading(true);
      await onSubmit();
      dialog.close();
    } finally {
      setLoading(false);
    }
  }, [dialog, loading, onSubmit, submitDisabled]);

  return (
    <Dialog
      actions={
        <>
          <button
            className="rounded border px-3 py-1.5 text-sm"
            disabled={loading}
            onClick={dialog.close}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
            disabled={loading || submitDisabled || (!onSubmit && !formId)}
            form={formId}
            onClick={
              onSubmit
                ? () => {
                    void handleSubmit();
                  }
                : undefined
            }
            type={formId ? "submit" : "button"}
          >
            {loading ? "Saving..." : submitLabel}
          </button>
        </>
      }
      dialog={dialog}
      dividers={dividers}
      maxWidthClassName={maxWidthClassName}
      showCloseButton
      subtitle={subtitle}
      title={title}
    >
      {children}
    </Dialog>
  );
}
