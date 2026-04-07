import type { ImportJobStatusResponse, ImportPreviewResult } from "@supportops/types";

export const IMPORT_POLL_INTERVAL_MS = 3_000;
export const IMPORT_POLL_TIMEOUT_MS = 5 * 60 * 1_000;

export type ImportStep = "upload" | "processing" | "preview" | "result";

export interface UseImportRequestsState {
  step: ImportStep;
  jobId: string | null;
  preview: ImportPreviewResult | null;
  skippedRows: Set<number>;
  jobStatus: ImportJobStatusResponse | null;
  isUploading: boolean;
  error: string | null;
}

export const IMPORT_INITIAL_STATE: UseImportRequestsState = {
  step: "upload",
  jobId: null,
  preview: null,
  skippedRows: new Set<number>(),
  jobStatus: null,
  isUploading: false,
  error: null,
};
