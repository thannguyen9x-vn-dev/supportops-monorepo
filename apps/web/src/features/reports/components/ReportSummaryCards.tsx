import { Grid, Paper, Stack, Typography } from "@mui/material";
import type { ReportOverviewSummary } from "@supportops/types";
import { useTranslations } from "next-intl";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary" variant="body2">{label}</Typography>
        <Typography variant="h6">{value}</Typography>
      </Stack>
    </Paper>
  );
}

function toDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function ReportSummaryCards({ summary }: { summary: ReportOverviewSummary }) {
  const t = useTranslations("reports");
  const compliance = `${(summary.slaComplianceRate * 100).toFixed(1)}%`;

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard label={t("summary.totalRequests")} value={String(summary.totalRequests)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard label={t("summary.openRequests")} value={String(summary.openRequests)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard label={t("summary.resolvedRequests")} value={String(summary.resolvedRequests)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SummaryCard label={t("summary.slaCompliance")} value={compliance} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SummaryCard label={t("summary.slaBreached")} value={String(summary.slaBreachActiveCount)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SummaryCard label={t("summary.avgFirstResponse")} value={toDuration(summary.avgFirstResponseMinutes)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SummaryCard label={t("summary.avgResolution")} value={toDuration(summary.avgResolutionMinutes)} />
      </Grid>
    </Grid>
  );
}
