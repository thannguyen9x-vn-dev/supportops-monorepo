"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export default function ProjectsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("pages.projects");

  return (
    <Stack alignItems="center" justifyContent="center" minHeight={280} spacing={1.5}>
      <Typography variant="h6">{t("state.error")}</Typography>
      <Typography color="text.secondary" variant="body2">
        {error.message}
      </Typography>
      <Button onClick={reset} variant="contained">
        {t("action.retry")}
      </Button>
    </Stack>
  );
}
