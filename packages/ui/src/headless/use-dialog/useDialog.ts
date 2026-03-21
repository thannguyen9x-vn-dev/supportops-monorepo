import { useCallback, useMemo, useState } from "react";

import type { UseDialogOptions, UseDialogReturn } from "./types";

export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const {
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    onClose,
    disableEscapeKeyClose = false,
    disableBackdropClose = false
  } = options;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (nextValue: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(nextValue);
      }
      onOpenChange?.(nextValue);
    },
    [controlledOpen, onOpenChange]
  );

  const open = useCallback(() => setOpen(true), [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose, setOpen]);

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  const handleDialogClose = useCallback(
    (_event: unknown, reason: "backdropClick" | "escapeKeyDown") => {
      if (reason === "escapeKeyDown" && disableEscapeKeyClose) return;
      if (reason === "backdropClick" && disableBackdropClose) return;
      close();
    },
    [close, disableBackdropClose, disableEscapeKeyClose]
  );

  const dialogProps = useMemo(
    () => ({
      open: isOpen,
      onClose: handleDialogClose,
      "aria-modal": true as const,
      role: "dialog" as const
    }),
    [handleDialogClose, isOpen]
  );

  const triggerProps = useMemo(
    () => ({
      onClick: open,
      "aria-haspopup": "dialog" as const,
      "aria-expanded": isOpen
    }),
    [isOpen, open]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    dialogProps,
    triggerProps
  };
}
