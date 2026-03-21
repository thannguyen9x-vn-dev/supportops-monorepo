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
}

export interface SlaPolicy {
  id: string;
  serviceTypeCode: string;
  responseMinutes: number;
  resolutionMinutes: number;
  escalationAfterMinutes: number;
}
