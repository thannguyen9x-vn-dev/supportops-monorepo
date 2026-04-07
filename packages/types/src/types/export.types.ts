export const EXPORT_METRIC = {
  REQUEST_VOLUME: "request_volume",
  STATUS_BREAKDOWN: "status_breakdown",
  SLA_HEALTH: "sla_health",
  TEAM_PERFORMANCE: "team_performance",
  SERVICE_TYPE_BREAKDOWN: "service_type_breakdown",
} as const;

export type ExportMetric = (typeof EXPORT_METRIC)[keyof typeof EXPORT_METRIC];

export interface ExportReportRequest {
  from_date: string;
  to_date: string;
  metrics?: ExportMetric[];
}

export const ALL_EXPORT_METRICS: ExportMetric[] = Object.values(EXPORT_METRIC);
