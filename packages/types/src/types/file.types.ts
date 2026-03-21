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
  accept: string; // HTML accept attribute format
}

export const DEFAULT_FILE_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  maxFiles: 20,
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
};
