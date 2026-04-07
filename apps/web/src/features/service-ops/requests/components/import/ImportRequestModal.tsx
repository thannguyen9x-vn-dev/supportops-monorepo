"use client";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { FormDialog } from "@supportops/ui-dialog";
import type { BulkImportResult } from "@supportops/types";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useImportRequests } from "../../hooks/useImportRequests";

import { ImportPreviewStep } from "./ImportPreviewStep";
import { ImportResultStep } from "./ImportResultStep";
import { ImportUploadStep } from "./ImportUploadStep";

interface ImportRequestModalProps {
  open: boolean;
  onClose: () => void;
}

function resolveResult(jobStatus: ReturnType<typeof useImportRequests>["jobStatus"]): BulkImportResult {
  if (jobStatus?.result) {
    return jobStatus.result;
  }

  return {
    totalRows: 0,
    created: 0,
    failed: jobStatus?.status === "failed" ? 1 : 0,
    errors: jobStatus?.error ? [{ row: 0, message: jobStatus.error }] : [],
  };
}

export function ImportRequestModal({ open, onClose }: ImportRequestModalProps): React.JSX.Element {
  const t = useTranslations("pages.requests.list");
  const importFlow = useImportRequests();

  const dialogControl = useMemo(
    () => ({ isOpen: open, close: () => { importFlow.reset(); onClose(); } }),
    [importFlow, onClose, open],
  );

  return (
    <FormDialog
      cancelLabel={t("actions.cancel")}
      dialog={dialogControl}
      onSubmit={dialogControl.close}
      submitLabel={t("actions.close")}
      submitDisabled={importFlow.step === "processing"}
      title={t("import.modal.title")}
    >
      {importFlow.step === "upload" ? (
        <ImportUploadStep
          error={importFlow.error}
          isUploading={importFlow.isUploading}
          onDownloadTemplate={importFlow.downloadTemplate}
          onUpload={importFlow.uploadFile}
        />
      ) : null}

      {importFlow.step === "processing" ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
          <CircularProgress size={28} />
          <Box textAlign="center">
            <Typography variant="h6">{t("import.processing.title")}</Typography>
            <Typography color="text.secondary" variant="body2">{t("import.processing.hint")}</Typography>
          </Box>
        </Stack>
      ) : null}

      {importFlow.step === "preview" && importFlow.preview ? (
        <ImportPreviewStep
          isConfirming={false}
          onConfirm={importFlow.confirmImport}
          onToggleRow={importFlow.toggleRow}
          preview={importFlow.preview}
          skippedRows={importFlow.skippedRows}
        />
      ) : null}

      {importFlow.step === "result" ? (
        <ImportResultStep onClose={dialogControl.close} result={resolveResult(importFlow.jobStatus)} />
      ) : null}
    </FormDialog>
  );
}
