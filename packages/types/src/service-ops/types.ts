export interface ServiceRequest {
  id: string;
  tenantId: string;
  requestCode: string | null;
  title: string;
  description: string;
  serviceTypeId: string;
  serviceTypeCode?: string | null;
  serviceTypeName?: string | null;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  locationId: string;
  assetId?: string | null;
  queueId?: string | null;
  sourceChannel: "WEB" | "EMAIL" | "PHONE" | "CHAT" | "API";
  isInternalOnly: boolean;
  requesterId: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  queueLabel?: string | null;
  submittedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestInput {
  mode?: "draft" | "submit";
  serviceTypeId?: string;
  serviceTypeCode?: string;
  serviceType?: string;
  title: string;
  description: string;
  locationId?: string;
  location?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assetId?: string;
  impactLevel?: "LOW" | "MEDIUM" | "HIGH";
  urgency?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceChannel?: "WEB" | "EMAIL" | "PHONE" | "CHAT" | "API";
  isInternalOnly?: boolean;
  preferredContact?: string;
  attachmentFileIds?: string[];
}

export type RequestCommentVisibility = "PUBLIC" | "INTERNAL";

export interface RequestComment {
  id: string;
  tenantId: string;
  requestId: string;
  authorId: string;
  visibility: RequestCommentVisibility;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestCommentInput {
  body: string;
  visibility?: RequestCommentVisibility;
}

export interface RequestWorkLog {
  id: string;
  tenantId: string;
  requestId: string;
  authorId: string;
  content: string;
  minutesSpent: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface CreateRequestWorkLogInput {
  content: string;
  minutesSpent?: number;
  startedAt?: string;
  endedAt?: string;
}

export interface UpdateRequestStatusInput {
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "TRIAGE"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED"
    | "WAITING_EXTERNAL_VENDOR"
    | "REOPENED"
    | "CANCELLED";
}

export interface AssignRequestInput {
  assigneeId: string;
}

export interface RequestAssignee {
  id: string;
  email: string;
  fullName: string;
  roleCode: string | null;
  avatarUrl?: string | null;
}

export interface SlaPolicy {
  id: string;
  serviceTypeCode: string;
  responseMinutes: number;
  resolutionMinutes: number;
  escalationAfterMinutes: number;
}

export interface AssignmentHistoryEntry {
  id: string;
  tenantId: string;
  requestId: string;
  fromAssigneeId: string | null;
  toAssigneeId: string | null;
  changedById: string;
  reason: string | null;
  changedAt: string;
}

export interface SlaViolation {
  id: string;
  tenantId: string;
  requestId: string;
  requestCode: string | null;
  requestTitle: string | null;
  requestStatus: string | null;
  type: "ASSIGNMENT" | "RESOLUTION";
  health: "ON_TRACK" | "AT_RISK" | "BREACHED";
  targetAt: string;
  breachedAt: string | null;
  isBreached: boolean;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  id: string;
  serviceTypeCode: string;
  whenMinutesOverdue: number;
  targetStatus: string;
  notifyRoleCode: string;
}

export interface EscalationEvent {
  id: string;
  tenantId: string;
  requestId: string;
  action: string;
  actorId: string | null;
  isAuto: boolean;
  reason: string | null;
  createdAt: string;
}

export interface TriggerEscalationInput {
  reason?: string;
}

export interface RequestSlaRecord {
  id: string;
  tenantId: string;
  requestId: string;
  type: "ASSIGNMENT" | "RESOLUTION";
  health: "ON_TRACK" | "AT_RISK" | "BREACHED";
  targetAt: string;
  breachedAt: string | null;
  isBreached: boolean;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestWorkflowDetail {
  request: ServiceRequest;
  comments: RequestComment[];
  workLogs: RequestWorkLog[];
  assignmentHistory: AssignmentHistoryEntry[];
  slaRecords: RequestSlaRecord[];
  activities: RequestWorkflowActivity[];
  attachments: RequestWorkflowAttachment[];
  actors: RequestWorkflowActor[];
  queueLabel: string | null;
  tags: string[];
  escalationRules: string[];
}

export interface RequestWorkflowActivity {
  id: string;
  tenantId: string;
  requestId: string;
  type:
    | "REQUEST_CREATED"
    | "STATUS_CHANGED"
    | "ASSIGNED"
    | "REASSIGNED"
    | "COMMENT_ADDED"
    | "INTERNAL_NOTE_ADDED"
    | "SLA_WARNING"
    | "SLA_BREACHED"
    | "RESOLUTION_SUBMITTED";
  title: string;
  description: string | null;
  actorId: string | null;
  createdAt: string;
}

export interface RequestWorkflowAttachment {
  id: string;
  tenantId: string;
  requestId: string;
  uploadedFileId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  createdAt: string;
}

export interface RequestWorkflowActor {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}
