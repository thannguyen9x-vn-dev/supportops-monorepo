import type {
  RequestCommentVisibility,
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  SlaHealth,
  SourceChannel,
} from "../enums";

export interface CreateServiceRequestInput {
  mode?: "draft" | "submit";
  serviceTypeId?: string;
  serviceTypeCode?: string;
  serviceType?: string;
  title: string;
  description: string;
  locationId?: string;
  location?: string;
  priority: RequestPriority;
  assetId?: string;
  impactLevel?: RequestImpactLevel;
  urgency?: RequestUrgency;
  sourceChannel?: SourceChannel;
  isInternalOnly?: boolean;
  preferredContact?: string;
  attachmentFileIds?: string[];
}

export interface CreateRequestCommentInput {
  body: string;
  visibility?: RequestCommentVisibility;
}

export interface CreateRequestWorkLogInput {
  content: string;
  minutesSpent?: number;
  startedAt?: string;
  endedAt?: string;
}

export interface UpdateRequestStatusInput {
  status: RequestStatus;
}

export interface AssignRequestInput {
  assigneeId: string;
}

export interface TriggerEscalationInput {
  reason?: string;
}

export interface RequestListQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: RequestStatus;
  serviceTypeCode?: string;
  assigneeId?: string;
  locationId?: string;
  slaHealth?: SlaHealth;
  updatedToday?: boolean;
  tab?: string;
}
