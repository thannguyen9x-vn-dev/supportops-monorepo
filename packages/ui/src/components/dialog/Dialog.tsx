"use client";

import { useEffect, type ReactNode } from "react";

import type { UseDialogReturn } from "../../headless/use-dialog";
import { cn } from "../../utils/cn";

type DialogLegacyProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  titleElement?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  maxWidthClassName?: string;
  showCloseButton?: boolean;
  dividers?: boolean;
  scrollable?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

type DialogHookProps = {
  dialog: UseDialogReturn;
  title?: ReactNode;
  subtitle?: ReactNode;
  titleElement?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  maxWidthClassName?: string;
  showCloseButton?: boolean;
  dividers?: boolean;
  scrollable?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

export type DialogProps = DialogLegacyProps | DialogHookProps;

function resolveState(props: DialogProps): { open: boolean; onClose: () => void } {
  if ("dialog" in props) {
    return {
      open: props.dialog.isOpen,
      onClose: props.dialog.close
    };
  }

  return {
    open: props.open,
    onClose: props.onClose
  };
}

export function Dialog(props: DialogProps) {
  const {
    title,
    subtitle,
    titleElement,
    children,
    maxWidthClassName = "max-w-2xl",
    showCloseButton = false,
    dividers = false,
    scrollable = false,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy
  } = props;

  const footer = props.actions ?? props.footer;
  const { open, onClose } = resolveState(props);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-describedby={ariaDescribedBy}
      aria-labelledby={ariaLabelledBy}
      aria-modal="true"
      className="fixed inset-0 z-[1400] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className={cn("relative z-[1401] w-full overflow-hidden rounded-xl bg-white shadow-2xl", maxWidthClassName)}
        onClick={(event) => event.stopPropagation()}
      >
        {title || titleElement ? (
          <div className="relative border-b px-6 py-4">
            {titleElement ? (
              titleElement
            ) : (
              <div>
                <div className="text-lg font-semibold">{title}</div>
                {subtitle ? <div className="mt-0.5 text-sm text-gray-500">{subtitle}</div> : null}
              </div>
            )}
            {showCloseButton ? (
              <button
                aria-label="Close dialog"
                className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100"
                onClick={onClose}
                type="button"
              >
                <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" width="16">
                  <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={cn("px-6 py-5", dividers ? "border-b border-t" : "", scrollable ? "overflow-y-auto max-h-[70vh]" : "")}>{children}</div>

        {footer ? <div className="flex items-center justify-end gap-2 border-t px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
