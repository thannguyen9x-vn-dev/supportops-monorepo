"use client";

import { Button, Stack, Typography } from "@mui/material";
import type { BulkImportResult } from "@supportops/types";
import { useTranslations } from "next-intl";

interface ImportResultStepProps {
  result: BulkImportResult;
  onClose: () => void;
}

export function ImportResultStep({ result, onClose }: ImportResultStepProps): React.JSX.Element {
  const t = useTranslations("pages.requests.list");

  return (
    <Stack spacing={1.5}>
      <Typography color="success.main" variant="body1">{t("import.result.success", { count: result.created })}</Typography>
      <Typography color="error.main" variant="body1">{t("import.result.errors", { count: result.failed })}</Typography>
      {result.errors.map((error) => (
        <Typography key={`${error.row}-${error.message}`} variant="body2">
          {t("import.result.errorDetail", { row: error.row, message: error.message })}
        </Typography>
      ))}
      <Button onClick={onClose} type="button" variant="contained">
        {t("actions.close")}
      </Button>
    </Stack>
  );
}
