import { LineChart } from "@mui/x-charts/LineChart";
import { Paper, Stack, Typography } from "@mui/material";
import type { ReportVolumeTrendPoint } from "@supportops/types";
import { useTranslations } from "next-intl";

export function ReportTrendChart({ points }: { points: ReportVolumeTrendPoint[] }) {
  const t = useTranslations("reports");

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">{t("charts.trend")}</Typography>
        <LineChart
          height={280}
          series={[
            { data: points.map((item) => item.created), label: t("charts.created") },
            { data: points.map((item) => item.resolved), label: t("charts.resolved") },
          ]}
          xAxis={[{ scaleType: "point", data: points.map((item) => item.date) }]}
        />
      </Stack>
    </Paper>
  );
}
