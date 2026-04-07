export declare const EXPORT_METRIC: {
    readonly REQUEST_VOLUME: "request_volume";
    readonly STATUS_BREAKDOWN: "status_breakdown";
    readonly SLA_HEALTH: "sla_health";
    readonly TEAM_PERFORMANCE: "team_performance";
    readonly SERVICE_TYPE_BREAKDOWN: "service_type_breakdown";
};
export type ExportMetric = (typeof EXPORT_METRIC)[keyof typeof EXPORT_METRIC];
export interface ExportReportRequest {
    from_date: string;
    to_date: string;
    metrics?: ExportMetric[];
}
export declare const ALL_EXPORT_METRICS: ExportMetric[];
//# sourceMappingURL=export.types.d.ts.map