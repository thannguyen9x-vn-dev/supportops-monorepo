import type {
  AssetStatus,
  RequestCommentVisibility,
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  SlaHealth,
  SlaType,
  SourceChannel,
} from "../enums";
import type { PageMeta } from "../types/api-response";

export interface ServiceRequest {
  id: string;
  tenantId: string;
  requestCode: string | null;
  title: string;
  description: string;
  serviceTypeId: string;
  serviceTypeCode?: string | null;
  serviceTypeName?: string | null;
  status: RequestStatus | string;
  priority: RequestPriority;
  impactLevel: RequestImpactLevel;
  urgency: RequestUrgency;
  locationId: string;
  assetId?: string | null;
  queueId?: string | null;
  sourceChannel: SourceChannel;
  isInternalOnly: boolean;
  requesterId: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  slaHealth?: SlaHealth | null;
  slaDueAt?: string | null;
  queueLabel?: string | null;
  submittedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  type: SlaType;
  health: SlaHealth;
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

export interface RequestSlaRecord {
  id: string;
  tenantId: string;
  requestId: string;
  type: SlaType;
  health: SlaHealth;
  targetAt: string;
  breachedAt: string | null;
  isBreached: boolean;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  eventType:
    | "REQUEST_CREATED"
    | "STATUS_CHANGED"
    | "REQUEST_ASSIGNED"
    | "REQUEST_REASSIGNED"
    | "COMMENT_ADDED"
    | "WORK_LOG_ADDED"
    | "SLA_AT_RISK"
    | "SLA_BREACHED"
    | "REQUEST_ESCALATED"
    | "REQUEST_RESOLVED"
    | "REQUEST_CLOSED"
    | "REQUEST_REOPENED"
    | "REQUEST_CANCELLED"
    | string;
  title: string;
  description: string | null;
  actorId: string | null;
  actorType: "USER" | "SYSTEM";
  visibility: RequestCommentVisibility;
  metadata: Record<string, unknown> | null;
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

export interface AssetType {
  id: string;
  tenantId: string;
  name: string;
  category?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  assetCode: string;
  name: string;
  assetTypeId: string;
  assetType?: AssetType;
  locationId: string;
  status: AssetStatus;
  serialNumber?: string | null;
  model?: string | null;
  assignedDepartment?: string | null;
  responsibleTeam?: string | null;
  installedAt?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDetail {
  asset: Asset;
  openRequestCount: number;
  requests: ServiceRequest[];
  meta: PageMeta;
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
