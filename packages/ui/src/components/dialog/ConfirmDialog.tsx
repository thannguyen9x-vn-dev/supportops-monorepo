"use client";

import { useCallback, useState, type ReactNode } from "react";

import type { UseDialogReturn } from "../../headless/use-dialog";
import { cn } from "../../utils/cn";
import { Dialog } from "./Dialog";

type ConfirmDialogLegacyProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  processingLabel?: string;
  confirmColor?: "default" | "error";
  isProcessing?: boolean;
  onConfirm: () => void | Promise<void>;
};

type ConfirmDialogHookProps = {
  dialog: UseDialogReturn;
  title: ReactNode;
  message: ReactNode;
  severity?: "info" | "warning" | "error" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  processingLabel?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

export type ConfirmDialogProps = ConfirmDialogLegacyProps | ConfirmDialogHookProps;

function resolveColor(props: ConfirmDialogProps): "default" | "error" {
  if ("dialog" in props) {
    return props.severity === "error" ? "error" : "default";
  }
  return props.confirmColor ?? "default";
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const confirmColor = resolveColor(props);
  const isHook = "dialog" in props;
  const externalProcessing = isHook ? false : props.isProcessing ?? false;
  const isProcessing = externalProcessing || loading;

  const onClose = isHook ? props.dialog.close : props.onClose;
  const open = isHook ? props.dialog.isOpen : props.open;
  const cancelLabel = isHook ? props.cancelLabel ?? "Cancel" : props.cancelLabel;
  const confirmLabel = isHook ? props.confirmLabel ?? "Confirm" : props.confirmLabel;
  const processingLabel = isHook ? props.processingLabel ?? "Processing..." : props.processingLabel;
  const description = isHook ? props.message : props.description;
  const confirmDisabled = isHook ? props.confirmDisabled ?? false : false;

  const handleCancel = useCallback(() => {
    if (isProcessing) return;
    if (isHook) {
      props.onCancel?.();
    }
    onClose();
  }, [isHook, isProcessing, onClose, props]);

  const handleConfirm = useCallback(async () => {
    if (isProcessing || confirmDisabled) return;

    if (!isHook && props.isProcessing !== undefined) {
      await props.onConfirm();
      return;
    }

    try {
      setLoading(true);
      await props.onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }, [confirmDisabled, isHook, isProcessing, onClose, props]);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title={props.title}
      footer={
        <>
          <button className="rounded border px-3 py-1.5 text-sm" onClick={handleCancel} type="button">
            {cancelLabel}
          </button>
          <button
            className={cn(
              "rounded px-3 py-1.5 text-sm text-white disabled:opacity-60",
              confirmColor === "error" ? "bg-red-600" : "bg-blue-600"
            )}
            disabled={isProcessing || confirmDisabled}
            onClick={() => {
              void handleConfirm();
            }}
            type="button"
          >
            {isProcessing ? processingLabel ?? confirmLabel : confirmLabel}
          </button>
        </>
      }
    >
      {description ? <div className="text-sm text-gray-600">{description}</div> : null}
    </Dialog>
  );
}
