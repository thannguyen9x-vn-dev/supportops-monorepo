"use client";

import { Box } from "@mui/material";
import { useReports } from "../hooks/useReports";
import { ReportsExportActions } from "./ReportsExportActions";
import { ReportsFilterPanel } from "./ReportsFilterPanel";
import { ReportsHeader } from "./ReportsHeader";

export function ReportsView(): React.JSX.Element {
  const {
    fromDate,
    toDate,
    selectedMetrics,
    isExportingCsv,
    isExportingExcel,
    isExportingPdf,
    exportError,
    isDateRangeInvalid,
    handleFromDateChange,
    handleToDateChange,
    handleMetricsChange,
    handleExportCsv,
    handleExportExcel,
    handleExportPdf,
  } = useReports();

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <ReportsHeader />
      <ReportsFilterPanel
        fromDate={fromDate}
        toDate={toDate}
        selectedMetrics={selectedMetrics}
        isDateRangeInvalid={isDateRangeInvalid}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onMetricsChange={handleMetricsChange}
      />
      <ReportsExportActions
        isExportingCsv={isExportingCsv}
        isExportingExcel={isExportingExcel}
        isExportingPdf={isExportingPdf}
        exportError={exportError}
        isDateRangeInvalid={isDateRangeInvalid}
        onExportCsv={handleExportCsv}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
      />
    </Box>
  );
}
