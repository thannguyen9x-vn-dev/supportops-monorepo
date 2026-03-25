import type {
  DashboardRecentActivityItem,
  DashboardRequestTrendItem,
  DashboardSummary,
  DashboardKpi,
  DashboardTransaction,
  LatestCustomer,
  SalesSummary,
  SessionByCountry,
  SessionByDevice
} from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const dashboardService = {
  getSummary: () => apiClient.get<DashboardSummary>(ENDPOINTS.DASHBOARD.SUMMARY),

  getRecentActivity: () => apiClient.get<DashboardRecentActivityItem[]>(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY),

  getRequestTrend: () => apiClient.get<DashboardRequestTrendItem[]>(ENDPOINTS.DASHBOARD.REQUEST_TREND),

  getSalesSummary: (period: "day" | "month" | "year" = "day") =>
    apiClient.get<SalesSummary>(ENDPOINTS.DASHBOARD.SALES_SUMMARY, {
      params: { period }
    }),

  getKpi: () => apiClient.get<DashboardKpi>(ENDPOINTS.DASHBOARD.KPI),

  getSessionsByCountry: () => apiClient.get<SessionByCountry[]>(ENDPOINTS.DASHBOARD.SESSIONS_COUNTRY),

  getSessionsByDevice: () => apiClient.get<SessionByDevice[]>(ENDPOINTS.DASHBOARD.SESSIONS_DEVICE),

  getLatestCustomers: (limit = 6) =>
    apiClient.get<LatestCustomer[]>(ENDPOINTS.DASHBOARD.LATEST_CUSTOMERS, {
      params: { limit }
    }),

  getTransactions: (page = 1, size = 10) =>
    apiClient.get<DashboardTransaction[]>(ENDPOINTS.DASHBOARD.TRANSACTIONS, {
      params: { page, size }
    })
};
