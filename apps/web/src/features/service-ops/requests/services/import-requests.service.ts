import {
  SERVICE_OPS_ENDPOINTS,
  type BulkImportJobEnqueuedResponse,
  type ImportJobStatusResponse,
} from "@supportops/types";

import { apiClient } from "@/lib/api";

function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const importRequestsService = {
  downloadTemplate(format: "csv" | "xlsx"): void {
    void apiClient
      .download(SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_TEMPLATE, { params: { format } })
      .then((blob) => {
        triggerFileDownload(blob, `request_import_template.${format}`);
      });
  },

  async uploadImportFile(file: File): Promise<BulkImportJobEnqueuedResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.upload<BulkImportJobEnqueuedResponse>(
      SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_UPLOAD,
      formData,
    );
    return response.data;
  },

  async getJobStatus(jobId: string): Promise<ImportJobStatusResponse> {
    const response = await apiClient.get<ImportJobStatusResponse>(
      SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_JOB_STATUS(jobId),
    );
    return response.data;
  },

  async confirmImport(
    jobId: string,
    skipRowIndices: number[],
  ): Promise<{ jobId: string; status: "queued" }> {
    const response = await apiClient.post<{ jobId: string; status: "queued" }>(
      SERVICE_OPS_ENDPOINTS.REQUESTS.IMPORT_JOB_CONFIRM(jobId),
      { skipRowIndices },
    );
    return response.data;
  },
};
