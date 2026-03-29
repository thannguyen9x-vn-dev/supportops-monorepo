"use client";

import { Alert, Button, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import type { ReportOverviewQuery } from "@supportops/types";

import { useReportData } from "../hooks/useReportData";
import { ReportFilters } from "./ReportFilters";
import { ReportServiceTypeChart } from "./ReportServiceTypeChart";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportTrendChart } from "./ReportTrendChart";
import { ReportVolumeChart } from "./ReportVolumeChart";

function defaultRange(): ReportOverviewQuery {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);

  const toIso = to.toISOString().slice(0, 10);
  const fromIso = from.toISOString().slice(0, 10);

  return {
    from: fromIso,
    to: toIso,
  };
}

function validateRange(filters: ReportOverviewQuery) {
  const from = new Date(filters.from).getTime();
  const to = new Date(filters.to).getTime();

  const diffDays = (to - from) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 90;
}

export function ReportView() {
  const t = useTranslations("reports");
  const [draftFilters, setDraftFilters] = useState<ReportOverviewQuery>(defaultRange());
  const [appliedFilters, setAppliedFilters] = useState<ReportOverviewQuery>(defaultRange());

  const isValidRange = useMemo(() => validateRange(draftFilters), [draftFilters]);
  const report = useReportData(appliedFilters);

  return (
    <Stack spacing={2}>
      <Stack alignItems="center" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h4">{t("title")}</Typography>
        <ReportFilters onApply={() => setAppliedFilters(draftFilters)} onChange={setDraftFilters} value={draftFilters} />
      </Stack>

      {isValidRange ? null : <Alert severity="warning">{t("filters.maxRangeHint")}</Alert>}

      {report.isLoading ? (
        <Stack data-testid="report-loading-skeleton" spacing={1.5}>
          <Skeleton height={120} variant="rounded" />
          <Skeleton height={300} variant="rounded" />
          <Skeleton height={300} variant="rounded" />
        </Stack>
      ) : null}

      {report.isError ? (
        <Stack spacing={1}>
          <Alert severity="error">{t("error")}</Alert>
          <Button onClick={() => report.refetch()} variant="outlined">Retry</Button>
        </Stack>
      ) : null}

      {report.data ? (
        <Stack spacing={2}>
          <ReportSummaryCards summary={report.data.summary} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReportVolumeChart byStatus={report.data.byStatus} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ReportTrendChart points={report.data.volumeTrend} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ReportServiceTypeChart byServiceType={report.data.byServiceType} />
            </Grid>
          </Grid>
        </Stack>
      ) : null}

      {report.data?.summary && report.data.summary.totalRequests === 0 ? (
        <Alert severity="info">{t("empty")}</Alert>
      ) : null}
    </Stack>
  );
}
