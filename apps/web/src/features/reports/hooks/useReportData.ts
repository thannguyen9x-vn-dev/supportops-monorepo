"use client";

import { useCallback, useEffect, useState } from "react";

import type { DashboardTransaction, SalesSummary } from "@supportops/types";

import { dashboardService } from "@/features/dashboard/services/dashboard.service";

type LoadState = "loading" | "ready" | "error";

export type ReportPeriod = "day" | "month" | "year";

type ReportData = {
  salesSummary: SalesSummary | null;
  transactions: DashboardTransaction[];
};

const INITIAL_DATA: ReportData = {
  salesSummary: null,
  transactions: []
};

export function useReportData(period: ReportPeriod) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<ReportData>(INITIAL_DATA);

  const reload = useCallback(async () => {
    setLoadState("loading");

    try {
      const [{ data: salesSummary }, { data: transactions }] = await Promise.all([
        dashboardService.getSalesSummary(period),
        dashboardService.getTransactions(1, 10)
      ]);

      setData({ salesSummary, transactions });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [period]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void reload();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [reload]);

  return {
    data,
    loadState,
    reload
  };
}
