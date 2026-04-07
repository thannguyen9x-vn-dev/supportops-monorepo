"use client";

import { Alert, Box, Button } from "@mui/material";
import { useTranslations } from "next-intl";

interface ReportsExportActionsProps {
  isExportingCsv: boolean;
  isExportingExcel: boolean;
  isExportingPdf: boolean;
  exportError: string | null;
  isDateRangeInvalid: boolean;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export function ReportsExportActions({
  isExportingCsv,
  isExportingExcel,
  isExportingPdf,
  exportError,
  isDateRangeInvalid,
  onExportCsv,
  onExportExcel,
  onExportPdf,
}: ReportsExportActionsProps): React.JSX.Element {
  const t = useTranslations();
  const isAnyExporting = isExportingCsv || isExportingExcel || isExportingPdf;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={onExportCsv} disabled={isAnyExporting || isDateRangeInvalid}>
          {isExportingCsv ? t("reports.actions.exporting") : t("reports.actions.exportCsv")}
        </Button>
        <Button variant="outlined" onClick={onExportExcel} disabled={isAnyExporting || isDateRangeInvalid}>
          {isExportingExcel ? t("reports.actions.exporting") : t("reports.actions.exportExcel")}
        </Button>
        <Button variant="contained" onClick={onExportPdf} disabled={isAnyExporting || isDateRangeInvalid}>
          {isExportingPdf ? t("reports.actions.exporting") : t("reports.actions.exportPdf")}
        </Button>
      </Box>
      {exportError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t(exportError)}
        </Alert>
      )}
    </Box>
  );
}
