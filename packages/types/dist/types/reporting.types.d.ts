export interface ReportByStatus {
    status: string;
    count: number;
}
export interface ReportByPriority {
    priority: string;
    count: number;
}
export interface ReportByServiceType {
    serviceTypeCode: string;
    serviceTypeName: string;
    count: number;
}
export interface ReportVolumeTrendPoint {
    date: string;
    created: number;
    resolved: number;
}
export interface ReportOverviewSummary {
    totalRequests: number;
    openRequests: number;
    resolvedRequests: number;
    closedRequests: number;
    slaComplianceRate: number;
    slaBreachCount: number;
    slaBreachActiveCount: number;
    avgFirstResponseMinutes: number;
    avgResolutionMinutes: number;
}
export interface ReportOverview {
    summary: ReportOverviewSummary;
    byStatus: ReportByStatus[];
    byPriority: ReportByPriority[];
    byServiceType: ReportByServiceType[];
    volumeTrend: ReportVolumeTrendPoint[];
}
export interface ReportOverviewQuery {
    from: string;
    to: string;
    assigneeId?: string;
}
//# sourceMappingURL=reporting.types.d.ts.map