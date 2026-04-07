"use client";

import { useTranslations } from "next-intl";
import { Alert, Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DEFAULT_AI_MODEL } from "@supportops/types";
import type { AiModelId } from "@supportops/types";

import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { canUseAiAssistant } from "@/features/ai-assistant/utils/aiAccess";
import { aiService } from "@/features/ai-assistant/services/ai.service";
import { AiChatPanel } from "@/features/ai-assistant/components/AiChatPanel";

import { DashboardContent } from "./DashboardContent";

export function DashboardOverview() {
  const t = useTranslations("pages.dashboard");
  const { data, trend, loadState, reload } = useDashboardOverview();
  const { user } = useAuth();
  const showAiPanel = canUseAiAssistant(user?.role);
  const [defaultModel, setDefaultModel] = useState<AiModelId>(DEFAULT_AI_MODEL);

  useEffect(() => {
    if (!showAiPanel) return;
    aiService.getSettings().then(({ data: settings }) => {
      setDefaultModel(settings.defaultModel as AiModelId);
    }).catch(() => {
      // AI settings unavailable — fall back to default model
    });
  }, [showAiPanel]);

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

  if (!showAiPanel) {
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

  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid size={{ xs: 12, xl: 8 }}>
        <DashboardContent
          isRefreshing={loadState === "refreshing"}
          onRefresh={() => void reload()}
          recentActivity={data.recentActivity}
          summary={data.summary}
          trend={trend}
        />
      </Grid>
      <Grid size={{ xs: 12, xl: 4 }}>
        <AiChatPanel defaultModel={defaultModel} />
      </Grid>
    </Grid>
  );
}
