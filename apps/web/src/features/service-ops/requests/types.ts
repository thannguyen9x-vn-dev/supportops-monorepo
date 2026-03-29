import type { UserRole } from "@supportops/types";

export interface DetailProps {
  requestId: string;
}

export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "TRIAGE"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED"
  | "WAITING_EXTERNAL_VENDOR"
  | "REOPENED"
  | "CANCELLED";

export type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
export type CommentVisibility = "PUBLIC" | "INTERNAL";
export type SlaState = "ON_TRACK" | "AT_RISK" | "BREACHED" | "NEAR_BREACH" | "PAUSED";

export type HeaderAction =
  | "EDIT_DRAFT"
  | "SUBMIT"
  | "ASSIGN"
  | "REASSIGN"
  | "ASSIGN_TO_ME"
  | "START_PROGRESS"
  | "RESOLVE"
  | "CLOSE"
  | "REOPEN"
  | "ESCALATE"
  | "ADD_NOTE";

export type TimelineEventType =
  | "REQUEST_CREATED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "REASSIGNED"
  | "SLA_WARNING"
  | "INTERNAL_NOTE"
  | "PUBLIC_COMMENT"
  | "RESOLUTION_SUBMITTED"
  | "REQUEST_CLOSED"
  | "REQUEST_REOPENED"
  | "ESCALATED"
  | "SYSTEM_RULE_TRIGGERED";

export interface RequestDetail {
  id: string;
  requestCode: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  updatedAtLabel: string;
  requester: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  assignee?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    roleLabel: string;
    etaLabel?: string;
    team?: string;
  };
  assignment: {
    queueLabel?: string;
    handoffHistory: Array<{
      id: string;
      from: string;
      to: string;
      at: string;
      by: string;
    }>;
  };
  relationship: {
    isRequester: boolean;
    isAssignee: boolean;
  };
  canAddWorkLog: boolean;
  overview: {
    serviceType: string;
    category: string;
    location: string;
    asset?: string;
    createdAt: string;
    description: string;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    fileSizeLabel: string;
    uploadedBy: string;
    uploadedAt: string;
    url: string;
  }>;
  sla: {
    assignmentSla?: {
      targetAt?: string;
      targetMinutes: number;
      remainingSeconds: number;
      totalPausedSeconds?: number;
      state: SlaState;
    };
    resolutionSla?: {
      targetAt?: string;
      targetMinutes: number;
      remainingSeconds: number;
      totalPausedSeconds?: number;
      state: SlaState;
    };
    escalationRules: string[];
  };
  metadata: {
    tenantName: string;
    sourceChannel?: string;
    impactLevel?: string;
    urgency?: string;
    serviceType?: string;
    asset?: string;
    location?: string;
    tags: string[];
  };
  timeline: Array<{
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string;
    actorName?: string;
    actorEmail?: string;
    actorAvatarUrl?: string | null;
    actorType?: "USER" | "SYSTEM";
    visibility: CommentVisibility;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    authorName: string;
    authorRoleLabel?: string;
    visibility: CommentVisibility;
    body: string;
    createdAt: string;
  }>;
  auditSummary?: Array<{
    id: string;
    summary: string;
    createdAt: string;
  }>;
}

export type MetadataAccessLevel = "BASIC" | "LIMITED" | "FULL";
export type ScenarioKey = "requesterResolved" | "coordinatorTriage" | "technicianInProgress";

export interface RequestDetailScenario {
  key: ScenarioKey;
  label: string;
  role: UserRole;
  detail: RequestDetail;
}

export interface HeaderActionParams {
  role: UserRole;
  status: RequestStatus;
  isRequester: boolean;
  isAssignee: boolean;
  hasAssignee: boolean;
}

export interface SectionVisibility {
  showSlaDetails: boolean;
  showEscalationRules: boolean;
  showAuditSummary: boolean;
  showInternalNotes: boolean;
  metadataAccess: MetadataAccessLevel;
  metadataEditable: boolean;
}

export interface AssignPayload {
  assigneeId: string;
}

export interface CommentPayload {
  body: string;
  visibility: CommentVisibility;
}

export interface WorkLogPayload {
  content: string;
  minutesSpent?: number;
}

export const REQUEST_STATUSES: RequestStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "TRIAGE",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_CUSTOMER",
  "WAITING_EXTERNAL_VENDOR",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
];

export const HEADER_ACTION_LABELS: Record<HeaderAction, string> = {
  EDIT_DRAFT: "Edit draft",
  SUBMIT: "Submit",
  ASSIGN: "Assign",
  REASSIGN: "Reassign",
  ASSIGN_TO_ME: "Assign to me",
  START_PROGRESS: "Start progress",
  RESOLVE: "Resolve",
  CLOSE: "Close",
  REOPEN: "Reopen",
  ESCALATE: "Escalate",
  ADD_NOTE: "Add note",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: "Requester",
  OPS_COORDINATOR: "Ops Coordinator",
  TECHNICIAN: "Technician",
  TENANT_ADMIN: "Tenant Admin",
};

export const SLA_STATE_LABELS: Record<SlaState, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  NEAR_BREACH: "Near breach",
  PAUSED: "Paused",
  BREACHED: "Breached",
};
