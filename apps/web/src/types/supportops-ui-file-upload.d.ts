declare module "@supportops/ui-file-upload" {
  import type { ComponentType } from "react";

  export type UploadableFile = {
    id: string;
    file: File;
    croppedBlob?: Blob | null;
    croppedPreviewUrl?: string | null;
    previewUrl: string;
    progress: number;
    status: "idle" | "ready" | "uploading" | "done" | "error";
  };

  export type UploadProgress = {
    progress: number;
  };

  export type UploadFn<T = unknown> = (
    uploadableFile: UploadableFile,
    onProgress: (progress: UploadProgress) => void
  ) => Promise<T>;

  export interface AvatarUploadProps {
    avatarVariant?: "circular" | "rounded" | "square";
    buttonLabel?: string;
    cropOnSelect?: boolean;
    currentSrc?: string | null;
    name?: string;
    onAvatarChange?: (blob: Blob, previewUrl: string) => void;
    onUploadError?: (message: string) => void;
    onUploadSuccess?: () => void;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    uploadFn?: UploadFn;
  }

  export type RejectedFileReason = "invalid-type" | "file-too-large";

  export type RejectedFile = {
    file: File;
    reason: RejectedFileReason;
  };

  export interface FileUploadProps {
    accept?: string;
    buttonLabel?: string;
    disabled?: boolean;
    helperText?: string;
    maxFileSizeInBytes?: number;
    multiple?: boolean;
    onFilesChange?: (files: File[]) => void;
    onRejectedFiles?: (rejectedFiles: RejectedFile[]) => void;
    value?: File[];
  }

  export interface UploadedFileInfo {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt?: string;
  }

  export interface FileUploadFieldProps {
    value?: UploadedFileInfo[];
    onChange?: (files: UploadedFileInfo[]) => void;
    maxFiles?: number;
    maxFileSizeBytes?: number;
    accept?: string;
    acceptedMimeTypes?: string[];
    disabled?: boolean;
    error?: string;
    helperText?: string;
    label?: string;
    uploadFn?: UploadFn<UploadedFileInfo>;
    onUploadSuccess?: (files: UploadedFileInfo[]) => void;
    onUploadError?: (errors: string[]) => void;
  }

  export const AvatarUpload: ComponentType<AvatarUploadProps>;
  export const FileUpload: ComponentType<FileUploadProps>;
  export const FileUploadField: ComponentType<FileUploadFieldProps>;
}
