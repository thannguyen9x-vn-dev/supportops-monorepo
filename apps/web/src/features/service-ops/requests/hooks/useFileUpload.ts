import { useCallback, useState } from "react";
import type { UploadedFileInfo } from "@supportops/ui-file-upload";

import { fileService } from "@/features/files/services/file.service";

interface UseFileUploadOptions {
  t: (key: string) => string;
  onUploadErrorToast: (message: string) => void;
}

export function useFileUpload({ t, onUploadErrorToast }: UseFileUploadOptions) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (
      file: { file: File },
      onProgress: (event: { progress: number }) => void,
    ): Promise<UploadedFileInfo> => {
      const files = [file.file];
      onProgress({ progress: 20 });

      const uploaded = await fileService.uploadFiles(files);
      const uploadedFile = uploaded[0];
      if (!uploadedFile) {
        throw new Error(t("errors.uploadNoFileReturned"));
      }

      onProgress({ progress: 100 });
      return uploadedFile;
    },
    [t],
  );

  const handleUploadError = useCallback(() => {
    const message = t("errors.uploadFailed");
    setUploadError(message);
    onUploadErrorToast(message);
  }, [onUploadErrorToast, t]);

  const handleUploadSuccess = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    uploadedFiles,
    uploadError,
    setUploadedFiles,
    handleFileUpload,
    handleUploadError,
    handleUploadSuccess,
  };
}
