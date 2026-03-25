"use client";

import { useCallback, useEffect, useState } from "react";

import type { DashboardData, DashboardRequestTrendItem } from "@supportops/types";

import { dashboardService } from "@/features/dashboard/services/dashboard.service";

type DashboardLoadState = "loading" | "refreshing" | "ready" | "error";

const INITIAL_STATE: DashboardData = {
  summary: {
    scope: "PERSONAL",
    kpis: {
      openRequests: 0,
      unassigned: 0,
      slaBreached: 0,
      resolvedToday: 0,
      avgResolutionTimeHours: 0,
      myAssigned: 0,
    },
    requestsByStatus: [],
    requestsByPriority: [],
    slaOverview: {
      onTrack: 0,
      atRisk: 0,
      breached: 0,
    },
  },
  recentActivity: [],
};

export function useDashboardOverview() {
  const [data, setData] = useState<DashboardData>(INITIAL_STATE);
  const [trend, setTrend] = useState<DashboardRequestTrendItem[]>([]);
  const [loadState, setLoadState] = useState<DashboardLoadState>("loading");

  const fetchOverview = useCallback(async () => {
    try {
      const [{ data: summary }, { data: recentActivity }, { data: trendData }] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentActivity(),
        dashboardService.getRequestTrend(),
      ]);

      setData({ summary, recentActivity });
      setTrend(trendData);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  const reload = useCallback(async () => {
    setLoadState("refreshing");
    await fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOverview();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchOverview]);

  return {
    data,
    trend,
    loadState,
    reload,
  };
}
