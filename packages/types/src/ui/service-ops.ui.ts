export type RequestListTabKey =
  | "allRequests"
  | "submittedTriage"
  | "unassigned"
  | "slaRisk"
  | "escalated"
  | "closed";

export interface RequestTabCounts {
  allRequests: number;
  submittedTriage: number;
  unassigned: number;
  slaRisk: number;
  escalated: number;
  closed: number;
}
