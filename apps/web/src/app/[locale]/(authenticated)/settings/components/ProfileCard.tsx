"use client";

import { useCallback, useEffect, useState } from "react";
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
import { AvatarUpload } from "@supportops/ui-file-upload";
import type { UploadFn, UploadableFile } from "@supportops/ui-file-upload";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";
import { ApiError } from "@/lib/api/apiClient";

import styles from "../settings.module.css";

type ProfileCardProps = {
  avatarUrl?: string | null;
  email?: string;
  firstName: string;
  lastName: string;
  status?: "ACTIVE" | "INACTIVE";
  onAvatarUpdated?: (nextAvatarUrl: string | null) => void;
};

export function ProfileCard({ avatarUrl = null, email, firstName, lastName, status = "ACTIVE", onAvatarUpdated }: ProfileCardProps) {
  const t = useTranslations("pages.settings");
  const tRoles = useTranslations("pages.teamAdmin.roles");
  const { user } = useAuth();
  const toast = useToast();
  const fullName = `${firstName} ${lastName}`;
  const roleMap: Record<string, string> = {
    EMPLOYEE: tRoles("EMPLOYEE"),
    OPS_COORDINATOR: tRoles("OPS_COORDINATOR"),
    TECHNICIAN: tRoles("TECHNICIAN"),
    TENANT_ADMIN: tRoles("TENANT_ADMIN"),
  };
  const roleLabel = user?.role ? roleMap[user.role] ?? user.role : t("profile.systemRoleFallback");
  const statusLabel = status === "ACTIVE" ? t("profile.status.active") : t("profile.status.inactive");
  const userEmail = email || user?.email || "-";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(avatarUrl);

  useEffect(() => {
    setDisplayAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const resetDialogState = useCallback(() => {
    setValidationMessage(null);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetDialogState();
  }, [resetDialogState]);

  const resolveUploadErrorMessage = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        if (error.code === "FILE_TOO_LARGE") return t("profile.avatarUploadSizeError");
        if (error.code === "INVALID_TYPE") return t("profile.avatarUploadTypeError");
        if (error.code === "MISSING_FILE") return t("profile.avatarDialog.fileRequired");
      }

      if (error instanceof Error && error.message) {
        return error.message;
      }

      return t("profile.avatarUploadError");
    },
    [t],
  );

  const uploadAvatar: UploadFn<{ url: string }> = useCallback(
    async (uploadableFile: UploadableFile) => {
      const sourceBlob = uploadableFile.croppedBlob ?? uploadableFile.file;
      const uploadFile =
        sourceBlob instanceof File
          ? sourceBlob
          : new File([sourceBlob], uploadableFile.file.name || "avatar.png", {
              type: sourceBlob.type || uploadableFile.file.type || "image/png",
            });

      try {
        const { data } = await settingsService.uploadAvatar(uploadFile);
        const nextAvatarUrl = data?.url ?? null;
        if (!nextAvatarUrl) {
          throw new Error(t("profile.avatarUploadError"));
        }

        setDisplayAvatarUrl(nextAvatarUrl);
        onAvatarUpdated?.(nextAvatarUrl);
        return { url: nextAvatarUrl };
      } catch (error) {
        throw new Error(resolveUploadErrorMessage(error));
      }
    },
    [onAvatarUpdated, resolveUploadErrorMessage, t],
  );

  return (
    <section className={`${styles.card} ${styles.profileCard}`}>
      <div className={styles.userHeader}>
        <Box className={styles.avatarBlock}>
          <Avatar
            dimension={120}
            imgProps={{ style: { objectFit: "contain", objectPosition: "center" } }}
            name={fullName}
            ring
            ringOffset={4}
            ringShape="circular"
            ringVariant="status"
            ringWidth={3}
            status={status === "ACTIVE" ? "active" : "inactive"}
            src={displayAvatarUrl ?? undefined}
            variant="circular"
          />
        </Box>
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>{fullName}</h2>
          <p className={styles.userEmail}>{userEmail}</p>
          <p className={styles.userRole}>{roleLabel}</p>
          <span className={`${styles.userStatusBadge} ${status === "ACTIVE" ? styles.active : styles.inactive}`}>
            {statusLabel}
          </span>
          <Button
            onClick={() => {
              setValidationMessage(null);
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

          <AvatarUpload
            avatarVariant="circular"
            buttonLabel={t("profile.avatarDialog.chooseFile")}
            currentSrc={displayAvatarUrl}
            name={fullName}
            onUploadError={(message) => {
              setValidationMessage(null);
              setValidationMessage(message);
              toast.error(message);
            }}
            onUploadSuccess={() => {
              setValidationMessage(null);
              toast.success(t("profile.avatarUploadSuccess"));
              handleCloseDialog();
            }}
            size="xl"
            uploadFn={uploadAvatar}
          />

          {validationMessage ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {validationMessage}
            </Alert>
          ) : null}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            {t("profile.avatarDialog.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
