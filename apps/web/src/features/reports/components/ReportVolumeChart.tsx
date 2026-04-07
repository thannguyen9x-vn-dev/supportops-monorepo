import { BarChart } from "@mui/x-charts/BarChart";
import { Paper, Stack, Typography } from "@mui/material";
import type { ReportByStatus } from "@supportops/types";
import { useTranslations } from "next-intl";

export function ReportVolumeChart({ byStatus }: { byStatus: ReportByStatus[] }) {
  const t = useTranslations("reports");

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">{t("charts.volumeByStatus")}</Typography>
        <BarChart
          height={280}
          series={[{ data: byStatus.map((item) => item.count), label: t("charts.volumeByStatus") }]}
          xAxis={[{ scaleType: "band", data: byStatus.map((item) => item.status) }]}
        />
      </Stack>
    </Paper>
  );
}
