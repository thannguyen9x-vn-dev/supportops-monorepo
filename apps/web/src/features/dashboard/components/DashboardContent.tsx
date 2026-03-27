"use client";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFormatter, useTranslations } from "next-intl";
import type { DashboardRecentActivityItem, DashboardRequestTrendItem, DashboardSummary } from "@supportops/types";

import { ActivityRow } from "./ActivityRow";
import { KpiCard } from "./KpiCard";
import { PriorityChip } from "./PriorityChip";
import { SlaChip } from "./SlaChip";
import { StatusRow } from "./StatusRow";
import { TrendChart } from "./TrendChart";

type DashboardContentProps = {
  summary: DashboardSummary;
  recentActivity: DashboardRecentActivityItem[];
  trend: DashboardRequestTrendItem[];
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function DashboardContent({
  summary,
  recentActivity,
  trend,
  onRefresh,
  isRefreshing,
}: DashboardContentProps) {
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
                  sx={
                    isRefreshing
                      ? {
                          animation: "spin 1s linear infinite",
                          "@keyframes spin": {
                            from: { transform: "rotate(0deg)" },
                            to: { transform: "rotate(360deg)" },
                          },
                        }
                      : undefined
                  }
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
                    <StatusRow count={item.count} key={item.status} label={requestListT(`statusApi.${item.status}`)} />
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
