import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import type { RequestWorkLog } from "@supportops/types";
import { DurationMinutesInput } from "@supportops/ui-form";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/section-card";

import type { WorkLogPayload } from "../../types";

export function WorkLogPanel({
  canAddWorkLog,
  logs,
  onSubmit,
  isSubmitting,
}: {
  canAddWorkLog: boolean;
  logs: RequestWorkLog[];
  onSubmit: (payload: WorkLogPayload) => Promise<void>;
  isSubmitting: boolean;
}) {
  const t = useTranslations("pages.requests.detail");
  const [content, setContent] = useState("");
  const [minutes, setMinutes] = useState<string>("15");
  const formatWorkLogTime = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  };

  const handleSubmit = async () => {
    const normalizedContent = content.trim();
    const parsedMinutes = Number(minutes);
    const minutesSpent = Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : undefined;
    if (!normalizedContent) return;

    await onSubmit({ content: normalizedContent, minutesSpent });
    setContent("");
  };

  return (
    <SectionCard cardSx={{ mt: 2 }} title={t("workLog.sectionTitle")}>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {logs.length === 0 ? (
          <Typography color="text.secondary" variant="body2">{t("workLog.empty")}</Typography>
        ) : (
          logs.map((item) => (
            <Box key={item.id}>
              <Typography fontWeight={600} variant="body2">{item.content}</Typography>
              <Typography color="text.secondary" variant="body2">
                {item.minutesSpent
                  ? t("workLog.durationMinutes", { minutes: item.minutesSpent })
                  : t("workLog.noDuration")}{" "}
                · {formatWorkLogTime(item.createdAt)}
              </Typography>
            </Box>
          ))
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />
      {canAddWorkLog ? (
        <>
          <Typography gutterBottom variant="body2">{t("workLog.addTitle")}</Typography>
          <TextField
            fullWidth
            maxRows={8}
            minRows={2}
            multiline
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("workLog.placeholder")}
            value={content}
          />
          <Stack spacing={1} sx={{ mt: 1 }}>
            <DurationMinutesInput
              label={t("workLog.minutes")}
              max={1440}
              min={1}
              onChange={setMinutes}
              placeholder={t("workLog.minutesPlaceholder")}
              sx={{ maxWidth: 180 }}
              value={minutes}
            />
            <Stack alignItems="flex-start">
              <Button
                disabled={content.trim().length === 0 || isSubmitting}
                onClick={() => void handleSubmit()}
                variant="contained"
              >
                {t("workLog.add")}
              </Button>
            </Stack>
          </Stack>
        </>
      ) : null}
    </SectionCard>
  );
}
