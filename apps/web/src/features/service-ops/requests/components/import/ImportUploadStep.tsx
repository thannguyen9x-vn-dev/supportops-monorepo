"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";
import { FileUploadField } from "@supportops/ui-file-upload";
import type { UploadedFileInfo } from "@supportops/ui-file-upload";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

interface ImportUploadStepProps {
  onUpload: (file: File) => Promise<void>;
  onDownloadTemplate: (format: "csv" | "xlsx") => void;
  isUploading: boolean;
  error: string | null;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const FIELD_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

function hasAcceptedExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".csv") || fileName.toLowerCase().endsWith(".xlsx");
}

export function ImportUploadStep({
  onUpload,
  onDownloadTemplate,
  isUploading,
  error,
}: ImportUploadStepProps): React.JSX.Element {
  const t = useTranslations("pages.requests.list");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const uploadFn = useCallback(async (payload: { file: File }, onProgress: (event: { progress: number }) => void) => {
    const file = payload.file;

    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(t("import.error.fileTooLarge"));
    }

    if (!hasAcceptedExtension(file.name) && !ACCEPTED_MIME_TYPES.includes(file.type)) {
      throw new Error(t("import.error.invalidFormat"));
    }

    onProgress({ progress: 20 });
    await onUpload(file);
    onProgress({ progress: 100 });

    return {
      id: `${file.name}-${file.size}-${file.lastModified}`,
      fileName: file.name,
      fileUrl: "",
      mimeType: file.type,
      sizeBytes: file.size,
    };
  }, [onUpload, t]);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t("import.upload.title")}</Typography>
      <Stack direction="row" spacing={1}>
        <Button onClick={() => onDownloadTemplate("csv")} type="button" variant="outlined">CSV</Button>
        <Button onClick={() => onDownloadTemplate("xlsx")} type="button" variant="outlined">Excel</Button>
      </Stack>
      <FileUploadField
        accept=".csv,.xlsx"
        disabled={isUploading}
        helperText={t("import.upload.hint")}
        label={t("import.upload.downloadTemplate")}
        maxFiles={1}
        maxFileSizeBytes={FIELD_MAX_SIZE_BYTES}
        onChange={setUploadedFiles}
        onUploadError={(errors) => setLocalError(errors[0] ?? t("import.error.invalidFormat"))}
        onUploadSuccess={() => setLocalError(null)}
        uploadFn={uploadFn}
        value={uploadedFiles}
      />
      {localError || error ? <Alert severity="error">{localError ?? error}</Alert> : null}
    </Stack>
  );
}
