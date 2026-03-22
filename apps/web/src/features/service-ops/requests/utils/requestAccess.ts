import type { UserRole } from "@supportops/types";

import type { CommentVisibility, MetadataAccessLevel, RequestStatus, SectionVisibility } from "../types";

const INTERNAL_ROLES: ReadonlySet<UserRole> = new Set(["OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"]);
const REOPENABLE_STATUSES: ReadonlySet<RequestStatus> = new Set(["RESOLVED", "CLOSED"]);

export function isInternalRole(role: UserRole): boolean {
  return INTERNAL_ROLES.has(role);
}

export function canViewInternalNotes(role: UserRole): boolean {
  return isInternalRole(role);
}

export function canAddInternalNote(role: UserRole): boolean {
  return isInternalRole(role);
}

export function canViewAuditSummary(role: UserRole): boolean {
  return role !== "EMPLOYEE";
}

export function canEditMetadata(role: UserRole): boolean {
  return role === "OPS_COORDINATOR" || role === "TENANT_ADMIN";
}

export function canReopenRequest(params: {
  role: UserRole;
  status: RequestStatus;
  isRequester: boolean;
}): boolean {
  if (!REOPENABLE_STATUSES.has(params.status)) {
    return false;
  }

  if (params.role === "OPS_COORDINATOR" || params.role === "TENANT_ADMIN") {
    return true;
  }

  return params.role === "EMPLOYEE" && params.isRequester;
}

export function canViewComment(role: UserRole, visibility: CommentVisibility): boolean {
  if (visibility === "PUBLIC") {
    return true;
  }

  return canViewInternalNotes(role);
}

export function canViewTimelineItem(role: UserRole, visibility: CommentVisibility): boolean {
  if (visibility === "PUBLIC") {
    return true;
  }

  return canViewInternalNotes(role);
}

export function resolveMetadataAccessLevel(role: UserRole): MetadataAccessLevel {
  if (role === "OPS_COORDINATOR" || role === "TENANT_ADMIN") {
    return "FULL";
  }

  if (role === "TECHNICIAN") {
    return "LIMITED";
  }

  return "BASIC";
}

export function getSectionVisibility(role: UserRole): SectionVisibility {
  return {
    showSlaDetails: role !== "EMPLOYEE",
    showEscalationRules: role !== "EMPLOYEE",
    showAuditSummary: canViewAuditSummary(role),
    showInternalNotes: canViewInternalNotes(role),
    metadataAccess: resolveMetadataAccessLevel(role),
    metadataEditable: canEditMetadata(role),
  };
}
