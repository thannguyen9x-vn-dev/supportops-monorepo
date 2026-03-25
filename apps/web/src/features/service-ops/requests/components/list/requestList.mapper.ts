import type { RequestAssignee, ServiceRequest, UserRole } from "@supportops/types";

import { canViewAllTenantRequests, canViewAssignedOrRelatedRequests } from "@/lib/auth/rbac";

import type { RequestFilters, RequestListItem, RequestPriority, RequestTabKey, SlaHealth } from "./request-list.types";
import { TAB_KEYS } from "./request-list.types";

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function mapRequestPriority(priority: ServiceRequest["priority"]): RequestPriority {
  if (priority === "URGENT") return "Critical";
  if (priority === "HIGH") return "High";
  if (priority === "MEDIUM") return "Medium";
  return "Low";
}

function mapApiSlaHealthToUi(value: ServiceRequest["slaHealth"]): SlaHealth {
  if (value === "BREACHED") return "Overdue";
  if (value === "AT_RISK") return "At Risk";
  return "On Track";
}

export function mapUiSlaHealthToApi(
  value: RequestFilters["slaHealth"],
): "ON_TRACK" | "AT_RISK" | "BREACHED" | undefined {
  if (value === "On Track") return "ON_TRACK";
  if (value === "At Risk") return "AT_RISK";
  if (value === "Overdue") return "BREACHED";
  return undefined;
}

export function resolveVisibleTabs(role?: UserRole): RequestTabKey[] {
  if (canViewAllTenantRequests(role)) {
    return [...TAB_KEYS];
  }

  if (canViewAssignedOrRelatedRequests(role)) {
    return ["allRequests", "slaRisk", "closed"];
  }

  return ["allRequests", "closed"];
}

function resolveAssigneeProfile(
  assigneeId: string | null | undefined,
  assigneeMap: Record<string, RequestAssignee>,
): Pick<RequestListItem, "assignee" | "assigneeProfile" | "assigneeId"> {
  if (!assigneeId) {
    return {
      assigneeId: null,
      assignee: "Unassigned",
      assigneeProfile: null,
    };
  }

  const assignee = assigneeMap[assigneeId];
  const name = assignee?.fullName?.trim();

  if (!name) {
    return {
      assigneeId,
      assignee: "Assigned",
      assigneeProfile: null,
    };
  }

  return {
    assigneeId,
    assignee: name,
    assigneeProfile: {
      name,
      email: assignee?.email,
      avatarUrl: assignee?.avatarUrl ?? null,
    },
  };
}

export function mapServiceRequestToRow(
  request: ServiceRequest,
  assigneeMap: Record<string, RequestAssignee>,
): RequestListItem {
  const updatedAt = formatDisplayDate(request.updatedAt);
  const assigneeData = resolveAssigneeProfile(request.assigneeId, assigneeMap);

  return {
    id: request.id,
    requestCode: request.requestCode ?? request.id,
    title: request.title,
    serviceTypeCode: request.serviceTypeCode ?? request.serviceTypeId,
    serviceType: request.serviceTypeName ?? request.serviceTypeCode ?? request.serviceTypeId,
    status: request.status,
    priority: mapRequestPriority(request.priority),
    ...assigneeData,
    location: request.locationId,
    updatedAt,
    slaHealth: mapApiSlaHealthToUi(request.slaHealth),
    slaDue: request.slaDueAt ? formatDisplayDate(request.slaDueAt) : updatedAt,
  };
}

export function remapRowsWithAssignees(
  rows: RequestListItem[],
  assigneesById: Record<string, RequestAssignee>,
): RequestListItem[] {
  return rows.map((row) => ({
    ...row,
    ...resolveAssigneeProfile(row.assigneeId, assigneesById),
  }));
}
