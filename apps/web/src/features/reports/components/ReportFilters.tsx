"use client";

import { Button, Stack, TextField, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import type { ReportOverviewQuery } from "@supportops/types";

export function ReportFilters({
  value,
  onChange,
  onApply,
}: {
  value: ReportOverviewQuery;
  onChange: (next: ReportOverviewQuery) => void;
  onApply: () => void;
}) {
  const t = useTranslations("reports");

  return (
    <Stack alignItems="center" direction={{ xs: "column", md: "row" }} spacing={1}>
      <TextField
        label={t("filters.from")}
        onChange={(event) => onChange({ ...value, from: event.target.value })}
        size="small"
        type="date"
        value={value.from}
      />
      <TextField
        label={t("filters.to")}
        onChange={(event) => onChange({ ...value, to: event.target.value })}
        size="small"
        type="date"
        value={value.to}
      />
      <Typography color="text.secondary" variant="caption">
        {t("filters.maxRangeHint")}
      </Typography>
      <Button onClick={onApply} variant="contained">{t("filters.apply")}</Button>
    </Stack>
  );
}
