export interface ServiceRequest {
  id: string;
  tenantId: string;
  requestCode: string | null;
  title: string;
  description: string;
  serviceTypeId: string;
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
  serviceTypeId: string;
  title: string;
  description: string;
  locationId: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assetId?: string;
  impactLevel?: "LOW" | "MEDIUM" | "HIGH";
  urgency?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceChannel?: "WEB" | "EMAIL" | "PHONE" | "CHAT" | "API";
  isInternalOnly?: boolean;
}

export interface SlaPolicy {
  id: string;
  serviceTypeCode: string;
  responseMinutes: number;
  resolutionMinutes: number;
  escalationAfterMinutes: number;
}
