import type { RequestPriority, SlaHealth } from "../enums";
export interface KpiValue {
    value: number;
    changePercent: number;
    chartData: number[];
}
export interface SalesSummary {
    period: "day" | "month" | "year";
    dataPoints: SalesDataPoint[];
}
export interface SalesDataPoint {
    date: string;
    templates: number;
    invoicing: number;
}
export interface DashboardKpi {
    todaySales: KpiValue;
    todayVisitors: KpiValue;
    weekVisitors: KpiValue;
}
export interface SessionByCountry {
    country: string;
    countryCode: string;
    visitors: number;
    changePercent: number;
}
export interface SessionByDevice {
    device: string;
    percentage: number;
    count: number;
}
export interface LatestCustomer {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    amount: number;
}
export interface DashboardTransaction {
    id: string;
    description: string;
    dateTime: string;
    amount: number;
    status: "COMPLETED" | "IN_PROGRESS" | "CANCELLED";
}
export type DashboardScope = "TEAM" | "PERSONAL";
export interface ServiceOpsDashboardKpi {
    openRequests: number;
    unassigned: number;
    slaBreached: number;
    resolvedToday: number;
    avgResolutionTimeHours: number;
    myAssigned: number;
}
export interface ServiceOpsDashboardStatusCount {
    status: string;
    count: number;
}
export interface ServiceOpsDashboardPriorityCount {
    priority: RequestPriority;
    count: number;
}
export interface ServiceOpsDashboardSlaOverview {
    onTrack: number;
    atRisk: number;
    breached: number;
}
export interface DashboardSummary {
    scope: DashboardScope;
    kpis: ServiceOpsDashboardKpi;
    requestsByStatus: ServiceOpsDashboardStatusCount[];
    requestsByPriority: ServiceOpsDashboardPriorityCount[];
    slaOverview: ServiceOpsDashboardSlaOverview;
}
export interface DashboardRecentActivityItem {
    id: string;
    requestId: string;
    requestCode: string | null;
    requestTitle: string;
    type: string;
    title: string;
    description: string | null;
    actorName: string | null;
    createdAt: string;
}
export interface DashboardData {
    summary: DashboardSummary;
    recentActivity: DashboardRecentActivityItem[];
}
export interface DashboardRequestTrendItem {
    date: string;
    opened: number;
    resolved: number;
}
export interface SlaHealthCount {
    health: SlaHealth;
    count: number;
}
//# sourceMappingURL=dashboard.domain.d.ts.map