"use client";

import { useCallback, useEffect, useState } from "react";

import type { DashboardData } from "@supportops/types";

import { dashboardService } from "@/features/dashboard/services/dashboard.service";

type DashboardLoadState = "loading" | "ready" | "error";

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
  const [loadState, setLoadState] = useState<DashboardLoadState>("loading");

  const fetchOverview = useCallback(async () => {
    try {
      const [{ data: summary }, { data: recentActivity }] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentActivity(),
      ]);

      setData({
        summary,
        recentActivity,
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
    const timer = window.setTimeout(() => {
      void fetchOverview();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchOverview]);

  return {
    data,
    loadState,
    reload,
  };
}
