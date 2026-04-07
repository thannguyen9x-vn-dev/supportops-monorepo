import type { ReportOverview, ReportOverviewQuery } from "@supportops/types";
import { REPORT_ENDPOINTS } from "@supportops/types";

import { apiClient } from "@/lib/api";

export const reportService = {
  async getOverview(query: ReportOverviewQuery): Promise<ReportOverview> {
    const response = await apiClient.get<ReportOverview>(REPORT_ENDPOINTS.overview, {
      params: {
        from: query.from,
        to: query.to,
        assigneeId: query.assigneeId,
      },
    });
    return response.data;
  },
};
