"use client";

import { useTranslations } from "next-intl";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";

import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";

import { DashboardContent } from "./DashboardContent";

export function DashboardOverview() {
  const t = useTranslations("pages.dashboard");
  const { data, trend, loadState, reload } = useDashboardOverview();

  if (loadState === "loading") {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 320 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary" variant="body2">
          {t("state.loading")}
        </Typography>
      </Stack>
    );
  }

  if (loadState === "error") {
    return (
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Alert severity="error">{t("state.error")}</Alert>
        <Box>
          <Button onClick={() => void reload()} variant="contained">
            {t("action.retry")}
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <DashboardContent
      isRefreshing={loadState === "refreshing"}
      onRefresh={() => void reload()}
      recentActivity={data.recentActivity}
      summary={data.summary}
      trend={trend}
    />
  );
}
