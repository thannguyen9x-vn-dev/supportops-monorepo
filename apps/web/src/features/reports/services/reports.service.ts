import { apiClient } from "@/lib/api/apiClient";
import { ENDPOINTS } from "@supportops/types";
import type { ExportReportRequest } from "@supportops/types";

export const reportsService = {
  async exportCsv(payload: ExportReportRequest): Promise<Blob> {
    return apiClient.postBlob(ENDPOINTS.EXPORT.CSV, payload, { timeout: 30_000 });
  },

  async exportExcel(payload: ExportReportRequest): Promise<Blob> {
    return apiClient.postBlob(ENDPOINTS.EXPORT.EXCEL, payload, { timeout: 30_000 });
  },

  async exportPdf(payload: ExportReportRequest): Promise<Blob> {
    return apiClient.postBlob(ENDPOINTS.EXPORT.PDF, payload, { timeout: 30_000 });
  },
};
