"use client";

import { Button, Stack, Typography } from "@mui/material";
import type { ImportPreviewResult } from "@supportops/types";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { ImportPreviewTable } from "./ImportPreviewTable";

interface ImportPreviewStepProps {
  preview: ImportPreviewResult;
  skippedRows: Set<number>;
  onToggleRow: (index: number) => void;
  onConfirm: () => Promise<void>;
  isConfirming: boolean;
}

export function ImportPreviewStep({
  preview,
  skippedRows,
  onToggleRow,
  onConfirm,
  isConfirming,
}: ImportPreviewStepProps): React.JSX.Element {
  const t = useTranslations("pages.requests.list");
  const confirmedCount = useMemo(
    () => Math.max(preview.totalRows - skippedRows.size, 0),
    [preview.totalRows, skippedRows],
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t("import.preview.title")}</Typography>
      <Typography color="success.main" variant="body2">{t("import.preview.validRows", { count: preview.validRows })}</Typography>
      <Typography color="error.main" variant="body2">{t("import.preview.errorRows", { count: preview.errorRows.length })}</Typography>
      <Typography color="warning.main" variant="body2">{t("import.preview.warningRows", { count: preview.warningRows.length })}</Typography>
      <ImportPreviewTable
        errorRows={preview.errorRows}
        onToggleRow={onToggleRow}
        skippedRows={skippedRows}
        validRowCount={preview.validRows}
        warningRows={preview.warningRows}
      />
      <Button disabled={isConfirming} onClick={() => void onConfirm()} type="button" variant="contained">
        {t("import.preview.confirmButton", { count: confirmedCount })}
      </Button>
    </Stack>
  );
}
