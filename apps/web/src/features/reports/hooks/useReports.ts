"use client";

import { useState } from "react";
import { ALL_EXPORT_METRICS } from "@supportops/types";
import type { ExportMetric } from "@supportops/types";
import { reportsService } from "../services/reports.service";

interface ReportsState {
  fromDate: string;
  toDate: string;
  selectedMetrics: ExportMetric[];
  isExportingCsv: boolean;
  isExportingExcel: boolean;
  isExportingPdf: boolean;
  exportError: string | null;
}

interface UseReportsResult extends ReportsState {
  isDateRangeInvalid: boolean;
  handleFromDateChange: (date: string) => void;
  handleToDateChange: (date: string) => void;
  handleMetricsChange: (metrics: ExportMetric[]) => void;
  handleExportCsv: () => Promise<void>;
  handleExportExcel: () => Promise<void>;
  handleExportPdf: () => Promise<void>;
}

function triggerDownload(blob: Blob, fromDate: string, toDate: string, ext: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `report_${fromDate}_${toDate}.${ext}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useReports(): UseReportsResult {
  const formatDate = (value: Date): string => value.toISOString().slice(0, 10);
  const today = formatDate(new Date());
  const oneMonthAgo = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  const [state, setState] = useState<ReportsState>({
    fromDate: oneMonthAgo,
    toDate: today,
    selectedMetrics: ALL_EXPORT_METRICS,
    isExportingCsv: false,
    isExportingExcel: false,
    isExportingPdf: false,
    exportError: null,
  });

  const handleFromDateChange = (date: string) => setState((s) => ({ ...s, fromDate: date, exportError: null }));
  const handleToDateChange = (date: string) => setState((s) => ({ ...s, toDate: date, exportError: null }));
  const handleMetricsChange = (metrics: ExportMetric[]) => setState((s) => ({ ...s, selectedMetrics: metrics }));

  const buildPayload = () => ({
    from_date: state.fromDate,
    to_date: state.toDate,
    metrics: state.selectedMetrics,
  });

  const handleExportCsv = async (): Promise<void> => {
    setState((s) => ({ ...s, isExportingCsv: true, exportError: null }));
    try {
      const blob = await reportsService.exportCsv(buildPayload());
      triggerDownload(blob, state.fromDate, state.toDate, "csv");
    } catch {
      setState((s) => ({ ...s, exportError: "reports.errors.exportFailed" }));
    } finally {
      setState((s) => ({ ...s, isExportingCsv: false }));
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setState((s) => ({ ...s, isExportingExcel: true, exportError: null }));
    try {
      const blob = await reportsService.exportExcel(buildPayload());
      triggerDownload(blob, state.fromDate, state.toDate, "xlsx");
    } catch {
      setState((s) => ({ ...s, exportError: "reports.errors.exportFailed" }));
    } finally {
      setState((s) => ({ ...s, isExportingExcel: false }));
    }
  };

  const handleExportPdf = async (): Promise<void> => {
    setState((s) => ({ ...s, isExportingPdf: true, exportError: null }));
    try {
      const blob = await reportsService.exportPdf(buildPayload());
      triggerDownload(blob, state.fromDate, state.toDate, "pdf");
    } catch {
      setState((s) => ({ ...s, exportError: "reports.errors.exportFailed" }));
    } finally {
      setState((s) => ({ ...s, isExportingPdf: false }));
    }
  };

  const isDateRangeInvalid = state.toDate < state.fromDate;

  return {
    ...state,
    isDateRangeInvalid,
    handleFromDateChange,
    handleToDateChange,
    handleMetricsChange,
    handleExportCsv,
    handleExportExcel,
    handleExportPdf,
  };
}
