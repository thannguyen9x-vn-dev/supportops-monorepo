export interface UploadedFile {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
}
export interface UploadFilesResponse {
    files: UploadedFile[];
}
export interface FileAccessUrlResponse {
    url: string;
    expiresAt: string;
}
export interface FileUploadConfig {
    maxFileSizeBytes: number;
    maxFiles: number;
    allowedMimeTypes: string[];
    accept: string;
}
export declare const DEFAULT_FILE_UPLOAD_CONFIG: FileUploadConfig;
//# sourceMappingURL=file.types.d.ts.map