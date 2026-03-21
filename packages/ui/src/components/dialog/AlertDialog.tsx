"use client";

import type { ReactNode } from "react";

import type { UseDialogReturn } from "../../headless/use-dialog";
import { Dialog } from "./Dialog";

type AlertDialogLegacyProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
};

type AlertDialogHookProps = {
  dialog: UseDialogReturn;
  title: ReactNode;
  message: ReactNode;
  severity?: "info" | "warning" | "error" | "success";
  closeLabel?: string;
};

export type AlertDialogProps = AlertDialogLegacyProps | AlertDialogHookProps;

function severityAccent(severity: "info" | "warning" | "error" | "success"): string {
  switch (severity) {
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
}

export function AlertDialog(props: AlertDialogProps) {
  const isHook = "dialog" in props;
  const open = isHook ? props.dialog.isOpen : props.open;
  const onClose = isHook ? props.dialog.close : props.onClose;
  const closeLabel = isHook ? props.closeLabel ?? "OK" : props.closeLabel;
  const description = isHook ? props.message : props.description;
  const severity = isHook ? props.severity ?? "info" : "info";

  return (
    <Dialog
      onClose={onClose}
      open={open}
      titleElement={
        <div className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full ${severityAccent(severity)}`} />
          <span className="text-lg font-semibold">{props.title}</span>
        </div>
      }
      footer={
        <button
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
          onClick={onClose}
          type="button"
        >
          {closeLabel}
        </button>
      }
    >
      {description ? <div className="text-sm text-gray-600">{description}</div> : null}
    </Dialog>
  );
}
