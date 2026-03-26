"use client";

import { Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { LineChart } from "@mui/x-charts/LineChart";
import type { DashboardRequestTrendItem } from "@supportops/types";

type TrendChartProps = {
  data: DashboardRequestTrendItem[];
};

export function TrendChart({ data }: TrendChartProps) {
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
              valueFormatter: (v: Date) => v.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
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
