"use client";

import { Avatar as MuiAvatar, Box, Button, Stack, Typography } from "@mui/material";
import { useDialog } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail } from "../../types";

type AttachmentItem = RequestDetail["attachments"][number];

function getFileExtension(fileName: string): string {
  const splitName = fileName.split(".");
  return splitName.length > 1 ? (splitName.at(-1) ?? "").toLowerCase() : "";
}

function isImageAttachment(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"].includes(extension);
}

function isPdfAttachment(fileName: string): boolean {
  return getFileExtension(fileName) === "pdf";
}

export function AttachmentsCard({ request }: { request: RequestDetail }) {
  const t = useTranslations("pages.requests.detail.attachments");
  const previewDialog = useDialog();
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentItem | null>(null);

  const previewType = useMemo(() => {
    if (!selectedAttachment) return "none";
    if (isImageAttachment(selectedAttachment.fileName)) return "image";
    if (isPdfAttachment(selectedAttachment.fileName)) return "pdf";
    return "unsupported";
  }, [selectedAttachment]);

  const handleOpenPreview = (attachment: AttachmentItem) => {
    setSelectedAttachment(attachment);
    previewDialog.open();
  };

  const handleOpenInNewTab = () => {
    if (!selectedAttachment) return;
    window.open(selectedAttachment.url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <SectionCard cardSx={{ mt: 2 }} title={t("title")}>
        <Stack
          spacing={1.25}
          sx={{
            mt: 1.5,
            maxHeight: { xs: 260, md: 320 },
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {request.attachments.length === 0 ? (
            <Typography color="text.secondary" variant="body2">{t("empty")}</Typography>
          ) : (
            request.attachments.map((attachment) => (
              <Stack
                alignItems="center"
                direction="row"
                key={attachment.id}
                spacing={1}
                sx={{
                  border: "1px solid var(--mui-palette-divider)",
                  borderRadius: 1.5,
                  p: 1,
                }}
              >
                <MuiAvatar sx={{ width: 30, height: 30 }}>•</MuiAvatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{attachment.fileName}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {attachment.fileSizeLabel} · {attachment.uploadedBy} · {attachment.uploadedAt}
                  </Typography>
                </Box>
                <Button onClick={() => handleOpenPreview(attachment)} size="small" variant="text">
                  {t("view")}
                </Button>
              </Stack>
            ))
          )}
        </Stack>
      </SectionCard>

      <FormDialog
        cancelLabel={t("close")}
        dialog={previewDialog}
        onSubmit={handleOpenInNewTab}
        submitDisabled={!selectedAttachment}
        submitLabel={t("openInNewTab")}
        title={selectedAttachment?.fileName ?? t("previewTitle")}
      >
        {previewType === "image" && selectedAttachment ? (
          <Box
            alt={selectedAttachment.fileName}
            component="img"
            src={selectedAttachment.url}
            sx={{ borderRadius: 1, maxHeight: "70vh", objectFit: "contain", width: "100%" }}
          />
        ) : null}
        {previewType === "pdf" && selectedAttachment ? (
          <Box
            component="iframe"
            src={selectedAttachment.url}
            sx={{ border: 0, borderRadius: 1, height: "70vh", width: "100%" }}
            title={selectedAttachment.fileName}
          />
        ) : null}
        {previewType === "unsupported" ? (
          <Stack spacing={0.75}>
            <Typography variant="body2">{t("previewNotSupported")}</Typography>
            <Typography color="text.secondary" variant="caption">{t("previewFallback")}</Typography>
          </Stack>
        ) : null}
      </FormDialog>
    </>
  );
}
