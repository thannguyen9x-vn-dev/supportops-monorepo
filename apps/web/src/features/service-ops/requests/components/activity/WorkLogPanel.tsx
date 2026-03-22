import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import type { RequestWorkLog } from "@supportops/types";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/section-card";

import type { WorkLogPayload } from "../../types";

export function WorkLogPanel({
  logs,
  onSubmit,
  isSubmitting,
}: {
  logs: RequestWorkLog[];
  onSubmit: (payload: WorkLogPayload) => Promise<void>;
  isSubmitting: boolean;
}) {
  const t = useTranslations("pages.requests.detail");
  const [content, setContent] = useState("");
  const [minutes, setMinutes] = useState<string>("15");

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
                {item.minutesSpent ? `${item.minutesSpent} min` : t("workLog.noDuration")} · {new Date(item.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Typography gutterBottom variant="body2">{t("workLog.addTitle")}</Typography>
      <TextField
        minRows={2}
        multiline
        onChange={(event) => setContent(event.target.value)}
        placeholder={t("workLog.placeholder")}
        value={content}
      />
      <Stack alignItems="center" direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          label={t("workLog.minutes")}
          onChange={(event) => setMinutes(event.target.value)}
          size="small"
          type="number"
          value={minutes}
        />
        <Button
          disabled={content.trim().length === 0 || isSubmitting}
          onClick={() => void handleSubmit()}
          variant="contained"
        >
          {t("workLog.add")}
        </Button>
      </Stack>
    </SectionCard>
  );
}
