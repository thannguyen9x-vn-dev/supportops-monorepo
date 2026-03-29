import { BarChart } from "@mui/x-charts/BarChart";
import { Paper, Stack, Typography } from "@mui/material";
import type { ReportByServiceType } from "@supportops/types";
import { useTranslations } from "next-intl";

export function ReportServiceTypeChart({ byServiceType }: { byServiceType: ReportByServiceType[] }) {
  const t = useTranslations("reports");

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">{t("charts.byServiceType")}</Typography>
        <BarChart
          height={280}
          layout="horizontal"
          series={[{ data: byServiceType.map((item) => item.count), label: t("charts.byServiceType") }]}
          yAxis={[{ scaleType: "band", data: byServiceType.map((item) => item.serviceTypeName || item.serviceTypeCode) }]}
        />
      </Stack>
    </Paper>
  );
}
