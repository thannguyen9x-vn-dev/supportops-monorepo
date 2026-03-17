"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { Avatar } from "@supportops/ui-avatar";
import { FileUpload } from "@supportops/ui-file-upload";
import type { RejectedFile } from "@supportops/ui-file-upload";

import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";
import { ApiError } from "@/lib/api/apiClient";

import styles from "../settings.module.css";

type ProfileCardProps = {
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  onAvatarUpdated?: (nextAvatarUrl: string | null) => void;
};

export function ProfileCard({ avatarUrl = null, firstName, lastName, onAvatarUpdated }: ProfileCardProps) {
  const t = useTranslations("pages.settings");
  const toast = useToast();
  const fullName = `${firstName} ${lastName}`;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(avatarUrl);

  useEffect(() => {
    setDisplayAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    if (!selectedFiles[0]) {
      setPreviewUrl(null);
      return;
    }

    const nextPreview = URL.createObjectURL(selectedFiles[0]);
    setPreviewUrl(nextPreview);
    return () => {
      URL.revokeObjectURL(nextPreview);
    };
  }, [selectedFiles]);

  const onRejectedFiles = useCallback(
    (rejectedFiles: RejectedFile[]) => {
      const firstRejected = rejectedFiles[0];
      if (!firstRejected) {
        return;
      }

      if (firstRejected.reason === "file-too-large") {
        setValidationMessage(t("profile.avatarUploadSizeError"));
        return;
      }

      if (firstRejected.reason === "invalid-type") {
        setValidationMessage(t("profile.avatarUploadTypeError"));
      }
    },
    [t],
  );

  const resetDialogState = useCallback(() => {
    setSelectedFiles([]);
    setValidationMessage(null);
    setPreviewUrl(null);
    setIsSubmitting(false);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetDialogState();
  }, [resetDialogState]);

  const handleUploadSubmit = useCallback(async () => {
    if (!selectedFiles[0]) {
      setValidationMessage(t("profile.avatarDialog.fileRequired"));
      return;
    }

    setIsSubmitting(true);
    setValidationMessage(null);

    try {
      const { data } = await settingsService.uploadAvatar(selectedFiles[0]);
      const nextAvatarUrl = data?.url ?? previewUrl ?? null;

      if (!nextAvatarUrl) {
        throw new Error(t("profile.avatarUploadError"));
      }

      setDisplayAvatarUrl(nextAvatarUrl);
      onAvatarUpdated?.(nextAvatarUrl);
      toast.success(t("profile.avatarUploadSuccess"));
      handleCloseDialog();
    } catch (error) {
      let message = error instanceof Error ? error.message : t("profile.avatarUploadError");

      if (error instanceof ApiError) {
        if (error.code === "FILE_TOO_LARGE") {
          message = t("profile.avatarUploadSizeError");
        } else if (error.code === "INVALID_TYPE") {
          message = t("profile.avatarUploadTypeError");
        } else if (error.code === "MISSING_FILE") {
          message = t("profile.avatarDialog.fileRequired");
        } else {
          message = t("profile.avatarUploadError");
        }
      }

      setValidationMessage(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  }, [handleCloseDialog, onAvatarUpdated, previewUrl, selectedFiles, t, toast]);

  const validSelectionMessage = useMemo(() => {
    if (!selectedFiles[0] || validationMessage) {
      return null;
    }
    return t("profile.avatarDialog.validFile");
  }, [selectedFiles, t, validationMessage]);

  return (
    <section className={styles.card}>
      <div className={styles.userHeader}>
        <Box className={styles.avatarBlock}>
          <Avatar
            dimension={132}
            imgProps={{ style: { objectFit: "cover", objectPosition: "center" } }}
            name={fullName}
            src={displayAvatarUrl ?? undefined}
            variant="rounded"
          />
        </Box>
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>{fullName}</h2>
          <p className={styles.userRole}>{t("profile.userRole")}</p>
          <Button
            onClick={() => {
              setIsDialogOpen(true);
            }}
            size="small"
            startIcon={<SettingsRoundedIcon />}
            variant="contained"
          >
            {t("profile.changePicture")}
          </Button>
        </div>
      </div>

      <Dialog fullWidth maxWidth="sm" onClose={handleCloseDialog} open={isDialogOpen}>
        <DialogTitle>{t("profile.avatarDialog.title")}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            {t("profile.avatarDialog.description")}
          </Typography>

          <FileUpload
            accept="image/jpeg,image/png,image/webp"
            buttonLabel={t("profile.avatarDialog.chooseFile")}
            helperText={t("profile.avatarDialog.helperText")}
            maxFileSizeInBytes={2 * 1024 * 1024}
            multiple={false}
            onFilesChange={(files) => {
              setSelectedFiles(files.slice(0, 1));
              setValidationMessage(null);
            }}
            onRejectedFiles={onRejectedFiles}
            value={selectedFiles}
          />

          {validationMessage ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {validationMessage}
            </Alert>
          ) : null}

          {validSelectionMessage ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              {validSelectionMessage}
            </Alert>
          ) : null}

          {previewUrl ? (
            <Box className={styles.avatarDialogPreview}>
              <Typography sx={{ mb: 1 }} variant="subtitle2">
                {t("profile.avatarDialog.preview")}
              </Typography>
              <Avatar name={fullName} size="xl" src={previewUrl} variant="rounded" />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            {t("profile.avatarDialog.cancel")}
          </Button>
          <Button
            disabled={isSubmitting || !selectedFiles[0]}
            onClick={() => {
              void handleUploadSubmit();
            }}
            variant="contained"
          >
            {isSubmitting ? t("profile.avatarDialog.submitting") : t("profile.avatarDialog.submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
