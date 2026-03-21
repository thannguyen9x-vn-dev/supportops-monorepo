export interface UseDialogOptions {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  disableEscapeKeyClose?: boolean;
  disableBackdropClose?: boolean;
}

export interface DialogCloseMeta {
  reason: "backdropClick" | "escapeKeyDown";
}

export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  dialogProps: {
    open: boolean;
    onClose: (_event: unknown, reason: "backdropClick" | "escapeKeyDown") => void;
    "aria-modal": true;
    role: "dialog";
  };
  triggerProps: {
    onClick: () => void;
    "aria-haspopup": "dialog";
    "aria-expanded": boolean;
  };
}
