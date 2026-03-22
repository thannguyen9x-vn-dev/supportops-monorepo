"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { DashboardRecentActivityItem, DashboardSummary } from "@supportops/types";

import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }} variant="h4">
            {value}
          </Typography>
          {helper ? (
            <Typography color="text.secondary" variant="body2">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PriorityChip({ priority, count }: { priority: string; count: number }) {
  const t = useTranslations("pages.dashboard");
  const color =
    priority === "URGENT"
      ? "error"
      : priority === "HIGH"
        ? "warning"
        : priority === "MEDIUM"
          ? "info"
          : "success";

  return <Chip color={color} label={`${t(`priority.${priority}`)}: ${count}`} variant="outlined" />;
}

function SlaChip({ label, count, color }: { label: string; count: number; color: "success" | "warning" | "error" }) {
  return <Chip color={color} label={`${label}: ${count}`} variant="outlined" />;
}

function StatusRow({ label, count }: { label: string; count: number }) {
  return (
    <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2">{label}</Typography>
      <Typography fontWeight={700} variant="body2">
        {count}
      </Typography>
    </Stack>
  );
}

function ActivityRow({ item }: { item: DashboardRecentActivityItem }) {
  const format = useFormatter();

  return (
    <Stack spacing={0.5}>
      <Stack
        alignItems={{ xs: "flex-start", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography fontWeight={700} variant="body2">
          {item.requestCode ?? item.requestId}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {format.dateTime(new Date(item.createdAt), {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Typography>
      </Stack>
      <Typography variant="body2">{item.title}</Typography>
      {item.description ? (
        <Typography color="text.secondary" variant="body2">
          {item.description}
        </Typography>
      ) : null}
      <Typography color="text.secondary" variant="caption">
        {[item.requestTitle, item.actorName].filter(Boolean).join(" · ")}
      </Typography>
    </Stack>
  );
}

function DashboardContent({ summary, recentActivity }: { summary: DashboardSummary; recentActivity: DashboardRecentActivityItem[] }) {
  const t = useTranslations("pages.dashboard");
  const requestListT = useTranslations("pages.requests.list");
  const format = useFormatter();

  const scopeLabel = summary.scope === "TEAM" ? t("scope.team") : t("scope.personal");

  return (
    <Stack spacing={3}>
      <Stack
        alignItems={{ xs: "flex-start", md: "center" }}
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant="h4">{t("title")}</Typography>
          <Typography color="text.secondary" variant="body2">
            {t("subtitle")}
          </Typography>
        </Stack>
        <Chip color={summary.scope === "TEAM" ? "primary" : "default"} label={scopeLabel} variant="outlined" />
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard label={t("kpi.openRequests")} value={format.number(summary.kpis.openRequests)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard label={t("kpi.unassigned")} value={format.number(summary.kpis.unassigned)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard label={t("kpi.slaBreached")} value={format.number(summary.kpis.slaBreached)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard label={t("kpi.resolvedToday")} value={format.number(summary.kpis.resolvedToday)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            helper={t("kpi.avgResolutionTimeHelper")}
            label={t("kpi.avgResolutionTime")}
            value={format.number(summary.kpis.avgResolutionTimeHours, { maximumFractionDigits: 1 })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard label={t("kpi.myAssigned")} value={format.number(summary.kpis.myAssigned)} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">{t("sections.byStatus")}</Typography>
                {summary.requestsByStatus.map((item) => (
                  <StatusRow
                    count={item.count}
                    key={item.status}
                    label={requestListT(`statusApi.${item.status}`)}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">{t("sections.byPriority")}</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {summary.requestsByPriority.map((item) => (
                    <PriorityChip count={item.count} key={item.priority} priority={item.priority} />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">{t("sections.slaOverview")}</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <SlaChip color="success" count={summary.slaOverview.onTrack} label={t("sla.onTrack")} />
                  <SlaChip color="warning" count={summary.slaOverview.atRisk} label={t("sla.atRisk")} />
                  <SlaChip color="error" count={summary.slaOverview.breached} label={t("sla.breached")} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6">{t("sections.recentActivity")}</Typography>
            {recentActivity.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                {t("state.empty")}
              </Typography>
            ) : (
              recentActivity.map((item, index) => (
                <Box key={item.id}>
                  <ActivityRow item={item} />
                  {index < recentActivity.length - 1 ? <Divider sx={{ mt: 1.5 }} /> : null}
                </Box>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export function DashboardOverview() {
  const t = useTranslations("pages.dashboard");
  const { data, loadState, reload } = useDashboardOverview();

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
    <Stack spacing={3}>
      <Box>
        <Button onClick={() => void reload()} size="small" variant="outlined">
          {t("action.refresh")}
        </Button>
      </Box>
      <DashboardContent recentActivity={data.recentActivity} summary={data.summary} />
    </Stack>
  );
}
