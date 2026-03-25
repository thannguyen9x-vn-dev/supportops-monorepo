"use client";

import type { ReactNode } from "react";
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
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import { LineChart } from "@mui/x-charts/LineChart";
import type { DashboardRecentActivityItem, DashboardRequestTrendItem, DashboardSummary } from "@supportops/types";

import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";

function KpiCard({
  label,
  value,
  helper,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  accentColor?: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={accentColor ? { borderLeft: "3px solid", borderLeftColor: accentColor } : undefined}
    >
      <CardContent>
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            {icon}
          </Stack>
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

function TrendChart({ data }: { data: DashboardRequestTrendItem[] }) {
  const t = useTranslations("pages.dashboard");
  const theme = useTheme();

  const dates = data.map((d) => new Date(d.date));
  const opened = data.map((d) => d.opened);
  const resolved = data.map((d) => d.resolved);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{t("sections.requestTrend")}</Typography>
          <LineChart
            xAxis={[{
              data: dates,
              scaleType: "time",
              valueFormatter: (v: Date) =>
                v.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            }]}
            series={[
              {
                data: opened,
                label: t("trend.opened"),
                color: theme.palette.primary.main,
                area: true,
                showMark: false,
              },
              {
                data: resolved,
                label: t("trend.resolved"),
                color: theme.palette.success.main,
                area: true,
                showMark: false,
              },
            ]}
            height={220}
            margin={{ top: 16, bottom: 40, left: 36, right: 16 }}
            sx={{
              "& .MuiAreaElement-root": { fillOpacity: 0.12 },
              "& .MuiChartsAxis-tickLabel": { fontSize: "0.75rem" },
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function DashboardContent({
  summary,
  recentActivity,
  trend,
  onRefresh,
  isRefreshing,
}: {
  summary: DashboardSummary;
  recentActivity: DashboardRecentActivityItem[];
  trend: DashboardRequestTrendItem[];
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const t = useTranslations("pages.dashboard");
  const requestListT = useTranslations("pages.requests.list");
  const format = useFormatter();

  const scopeLabel = summary.scope === "TEAM" ? t("scope.team") : t("scope.personal");
  const activeStatusRows = summary.requestsByStatus.filter((item) => item.count > 0);

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
        <Stack alignItems="center" direction="row" spacing={1}>
          <Chip color={summary.scope === "TEAM" ? "primary" : "default"} label={scopeLabel} variant="outlined" />
          <Tooltip title={t("action.refresh")}>
            <span>
              <IconButton disabled={isRefreshing} onClick={onRefresh} size="small">
                <RefreshIcon
                  fontSize="small"
                  sx={isRefreshing ? { animation: "spin 1s linear infinite", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } } : undefined}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            accentColor="primary.main"
            icon={<InboxOutlinedIcon sx={{ color: "primary.main", fontSize: 18, opacity: 0.8 }} />}
            label={t("kpi.openRequests")}
            value={format.number(summary.kpis.openRequests)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            accentColor="warning.main"
            icon={<PersonOffOutlinedIcon sx={{ color: "warning.main", fontSize: 18, opacity: 0.8 }} />}
            label={t("kpi.unassigned")}
            value={format.number(summary.kpis.unassigned)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            accentColor="error.main"
            icon={<WarningAmberOutlinedIcon sx={{ color: "error.main", fontSize: 18, opacity: 0.8 }} />}
            label={t("kpi.slaBreached")}
            value={format.number(summary.kpis.slaBreached)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            accentColor="success.main"
            icon={<TaskAltOutlinedIcon sx={{ color: "success.main", fontSize: 18, opacity: 0.8 }} />}
            label={t("kpi.resolvedToday")}
            value={format.number(summary.kpis.resolvedToday)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            accentColor="info.main"
            helper={t("kpi.avgResolutionTimeHelper")}
            icon={<AccessTimeOutlinedIcon sx={{ color: "info.main", fontSize: 18, opacity: 0.8 }} />}
            label={t("kpi.avgResolutionTime")}
            value={format.number(summary.kpis.avgResolutionTimeHours, { maximumFractionDigits: 1 })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
          <KpiCard
            accentColor="secondary.main"
            icon={<AssignmentIndOutlinedIcon sx={{ color: "secondary.main", fontSize: 18, opacity: 0.8 }} />}
            label={t("kpi.myAssigned")}
            value={format.number(summary.kpis.myAssigned)}
          />
        </Grid>
      </Grid>

      <TrendChart data={trend} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">{t("sections.byStatus")}</Typography>
                {activeStatusRows.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    {t("state.empty")}
                  </Typography>
                ) : (
                  activeStatusRows.map((item) => (
                    <StatusRow
                      count={item.count}
                      key={item.status}
                      label={requestListT(`statusApi.${item.status}`)}
                    />
                  ))
                )}
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
