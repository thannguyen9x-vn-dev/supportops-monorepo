"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReportOverviewQuery } from "@supportops/types";

import { reportService } from "../services/report.service";

export function useReportData(filters: ReportOverviewQuery) {
  return useQuery({
    queryKey: ["report-overview", filters],
    queryFn: () => reportService.getOverview(filters),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(filters.from && filters.to),
  });
}
