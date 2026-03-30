import type { ServiceRequest } from "@supportops/types";

export type RequestPriority = "Low" | "Medium" | "High" | "Critical";
export type SlaHealth = "On Track" | "At Risk" | "Overdue";

export type RequestListItem = {
  id: string;
  requesterId: string;
  allowedActions: string[];
  requestCode: string;
  title: string;
  serviceTypeCode: string;
  serviceType: string;
  status: ServiceRequest["status"];
  priority: RequestPriority;
  assigneeId: string | null;
  assignee: string;
  assigneeProfile: {
    name: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
  location: string;
  updatedAt: string;
  slaHealth: SlaHealth;
  slaDue: string;
};

export type RequestFilters = {
  search: string;
  status: string;
  serviceType: string;
  assignee: string;
  location: string;
  slaHealth: string;
  updatedToday: boolean;
};

export const INITIAL_FILTERS: RequestFilters = {
  search: "",
  status: "",
  serviceType: "",
  assignee: "",
  location: "",
  slaHealth: "",
  updatedToday: false,
};

export const INITIAL_TAB_COUNTS = {
  allRequests: 0,
  submittedTriage: 0,
  unassigned: 0,
  slaRisk: 0,
  escalated: 0,
  closed: 0,
};

export const TAB_KEYS = [
  "allRequests",
  "submittedTriage",
  "unassigned",
  "slaRisk",
  "escalated",
  "closed",
] as const;

export type RequestTabKey = (typeof TAB_KEYS)[number];

export const REQUEST_STATUS_FILTER_OPTIONS = [
  "DRAFT",
  "SUBMITTED",
  "TRIAGE",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "WAITING_EXTERNAL_VENDOR",
  "REOPENED",
  "CANCELLED",
] as const;
