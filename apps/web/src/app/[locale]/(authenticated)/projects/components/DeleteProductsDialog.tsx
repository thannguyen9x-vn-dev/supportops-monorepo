"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@supportops/ui";

type DeleteProductsDialogProps = {
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  open: boolean;
  selectedCount: number;
};

export function DeleteProductsDialog({
  isDeleting,
  onClose,
  onConfirm,
  open,
  selectedCount,
}: DeleteProductsDialogProps) {
  const t = useTranslations("pages.projects");

  return (
    <ConfirmDialog
      cancelLabel={t("deleteDialog.cancel")}
      confirmColor="error"
      confirmLabel={t("deleteDialog.confirm")}
      description={t("deleteDialog.description", { count: selectedCount })}
      isProcessing={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
      open={open}
      processingLabel={t("deleteDialog.deleting")}
      title={t("deleteDialog.title")}
    />
  );
}
