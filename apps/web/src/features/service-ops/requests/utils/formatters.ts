import type { UserRole } from "@supportops/types";

import type { RequestDetail, ScenarioKey, SlaState, TimelineEventType } from "../types";

export interface EventIconSpec {
  name: "person" | "chevron" | "assignment" | "error" | "review" | "check" | "report";
  color?: "error" | "success" | "warning";
}

export function resolveScenarioByRole(role?: UserRole): ScenarioKey {
  if (role === "EMPLOYEE") return "requesterResolved";
  if (role === "OPS_COORDINATOR") return "coordinatorTriage";
  if (role === "TECHNICIAN") return "technicianInProgress";
  if (role === "TENANT_ADMIN") return "coordinatorTriage";
  return "technicianInProgress";
}

export function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatTargetMinutes(targetMinutes: number): string {
  if (targetMinutes >= 60 && targetMinutes % 60 === 0) {
    return `${targetMinutes / 60} hours`;
  }

  return `${targetMinutes} min`;
}

export function resolveSlaSummaryState(sla: RequestDetail["sla"]): SlaState {
  const states: SlaState[] = [];
  if (sla.assignmentSla) {
    states.push(sla.assignmentSla.state);
  }
  if (sla.resolutionSla) {
    states.push(sla.resolutionSla.state);
  }

  if (states.includes("BREACHED")) {
    return "BREACHED";
  }
  if (states.includes("PAUSED")) {
    return "PAUSED";
  }
  if (states.includes("NEAR_BREACH")) {
    return "NEAR_BREACH";
  }
  if (states.includes("AT_RISK")) {
    return "AT_RISK";
  }
  return "ON_TRACK";
}

export function eventIcon(type: TimelineEventType): EventIconSpec {
  switch (type) {
    case "REQUEST_CREATED":
      return { name: "person" };
    case "STATUS_CHANGED":
      return { name: "chevron" };
    case "ASSIGNED":
    case "REASSIGNED":
      return { name: "assignment" };
    case "SLA_WARNING":
      return { name: "error", color: "warning" };
    case "INTERNAL_NOTE":
    case "PUBLIC_COMMENT":
      return { name: "review" };
    case "RESOLUTION_SUBMITTED":
      return { name: "check", color: "success" };
    case "ESCALATED":
      return { name: "report", color: "error" };
    default:
      return { name: "person" };
  }
}
