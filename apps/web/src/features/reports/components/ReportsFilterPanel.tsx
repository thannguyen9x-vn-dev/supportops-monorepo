"use client";

import { Alert, Box, Checkbox, FormControlLabel, FormGroup, TextField, Typography } from "@mui/material";
import { ALL_EXPORT_METRICS } from "@supportops/types";
import type { ExportMetric } from "@supportops/types";
import { useTranslations } from "next-intl";

interface ReportsFilterPanelProps {
  fromDate: string;
  toDate: string;
  selectedMetrics: ExportMetric[];
  isDateRangeInvalid: boolean;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onMetricsChange: (metrics: ExportMetric[]) => void;
}

export function ReportsFilterPanel({
  fromDate,
  toDate,
  selectedMetrics,
  isDateRangeInvalid,
  onFromDateChange,
  onToDateChange,
  onMetricsChange,
}: ReportsFilterPanelProps): React.JSX.Element {
  const t = useTranslations();

  const handleMetricToggle = (metric: ExportMetric): void => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metric));
      return;
    }
    onMetricsChange([...selectedMetrics, metric]);
  };

  return (
    <Box sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          id="reports-from-date"
          type="date"
          size="small"
          label={t("reports.filters.fromDate")}
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          id="reports-to-date"
          type="date"
          size="small"
          label={t("reports.filters.toDate")}
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      {isDateRangeInvalid && <Alert severity="error">{t("reports.errors.invalidDateRange")}</Alert>}

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, mt: 2 }}>
        {t("reports.filters.metrics")}
      </Typography>

      <FormGroup row>
        {ALL_EXPORT_METRICS.map((metric) => (
          <FormControlLabel
            key={metric}
            control={
              <Checkbox
                checked={selectedMetrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
                size="small"
              />
            }
            label={t(`reports.metrics.${metric}`)}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
