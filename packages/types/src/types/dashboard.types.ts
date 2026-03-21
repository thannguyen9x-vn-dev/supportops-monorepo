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

export interface KpiValue {
  value: number;
  changePercent: number;
  chartData: number[];
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
