import { apiClient } from "@/lib/api";

import { dashboardService } from "../dashboard.service";

jest.mock("@/lib/api", () => ({
  ENDPOINTS: {
    DASHBOARD: {
      SUMMARY: "/dashboard/summary",
      RECENT_ACTIVITY: "/dashboard/recent-activity",
      REQUEST_TREND: "/dashboard/request-trend",
      SALES_SUMMARY: "/dashboard/sales-summary",
      KPI: "/dashboard/kpi",
      SESSIONS_COUNTRY: "/dashboard/sessions-by-country",
      SESSIONS_DEVICE: "/dashboard/sessions-by-device",
      LATEST_CUSTOMERS: "/dashboard/latest-customers",
      TRANSACTIONS: "/dashboard/transactions",
    },
  },
  apiClient: {
    get: jest.fn(),
  },
}));

describe("dashboardService", () => {
  const mockGet = apiClient.get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
  });

  it("gets summary, recent activity and trend", async () => {
    await dashboardService.getSummary();
    await dashboardService.getRecentActivity();
    await dashboardService.getRequestTrend();

    expect(mockGet).toHaveBeenNthCalledWith(1, "/dashboard/summary");
    expect(mockGet).toHaveBeenNthCalledWith(2, "/dashboard/recent-activity");
    expect(mockGet).toHaveBeenNthCalledWith(3, "/dashboard/request-trend");
  });

  it("passes period to sales summary", async () => {
    await dashboardService.getSalesSummary("month");

    expect(mockGet).toHaveBeenCalledWith("/dashboard/sales-summary", { params: { period: "month" } });
  });

  it("passes limit to latest customers", async () => {
    await dashboardService.getLatestCustomers(2);

    expect(mockGet).toHaveBeenCalledWith("/dashboard/latest-customers", { params: { limit: 2 } });
  });

  it("passes page and size to transactions", async () => {
    await dashboardService.getTransactions(3, 25);

    expect(mockGet).toHaveBeenCalledWith("/dashboard/transactions", { params: { page: 3, size: 25 } });
  });
});
