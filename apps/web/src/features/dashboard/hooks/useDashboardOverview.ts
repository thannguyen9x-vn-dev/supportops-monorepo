"use client";

import { useCallback, useEffect, useState } from "react";

import type { DashboardKpi, DashboardTransaction, LatestCustomer } from "@supportops/types";

import { dashboardService } from "@/features/dashboard/services/dashboard.service";

type DashboardOverviewState = {
  kpi: DashboardKpi | null;
  latestCustomers: LatestCustomer[];
  transactions: DashboardTransaction[];
};

type DashboardLoadState = "loading" | "ready" | "error";

const INITIAL_STATE: DashboardOverviewState = {
  kpi: null,
  latestCustomers: [],
  transactions: []
};

export function useDashboardOverview() {
  const [data, setData] = useState<DashboardOverviewState>(INITIAL_STATE);
  const [loadState, setLoadState] = useState<DashboardLoadState>("loading");

  const fetchOverview = useCallback(async () => {
    try {
      const [{ data: kpi }, { data: latestCustomers }, { data: transactions }] = await Promise.all([
        dashboardService.getKpi(),
        dashboardService.getLatestCustomers(6),
        dashboardService.getTransactions(1, 8)
      ]);

      setData({
        kpi,
        latestCustomers,
        transactions
      });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  const reload = useCallback(async () => {
    setLoadState("loading");
    await fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOverview();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchOverview]);

  return {
    data,
    loadState,
    reload
  };
}
