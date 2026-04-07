import type { RequestPriority } from "../enums";
export type ImportJobStatus = "queued" | "preview_ready" | "processing" | "completed" | "failed";
export interface BulkImportJobEnqueuedResponse {
    jobId: string;
    status: "queued";
    fileName: string;
    uploadedAt: string;
}
export interface ImportJobStatusResponse {
    jobId: string;
    status: ImportJobStatus;
    progress?: number;
    preview?: ImportPreviewResult;
    result?: BulkImportResult;
    error?: string;
}
export interface ConfirmImportInput {
    skipRowIndices: number[];
}
export interface BulkImportResult {
    totalRows: number;
    created: number;
    failed: number;
    errors: ImportRowError[];
}
export interface ImportRowError {
    row: number;
    field?: string;
    message: string;
}
export interface ImportRowWarning {
    row: number;
    type: "duplicate_in_file" | "duplicate_recent";
    message: string;
}
export interface ImportPreviewResult {
    totalRows: number;
    validRows: number;
    errorRows: ImportRowError[];
    warningRows: ImportRowWarning[];
}
export interface BulkCreateRequestItem {
    title: string;
    description?: string;
    serviceTypeCode: string;
    priority: RequestPriority;
    locationId: string;
    reporterEmail?: string;
}
export interface BulkCreateRequestInput {
    items: BulkCreateRequestItem[];
}
export interface BulkCreateRequestResult {
    created: number;
    failed: number;
    errors: Array<{
        index: number;
        field?: string;
        message: string;
    }>;
}
//# sourceMappingURL=import.types.d.ts.map