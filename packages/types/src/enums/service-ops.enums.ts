export const REQUEST_STATUSES = [
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

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const REQUEST_IMPACT_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type RequestImpactLevel = (typeof REQUEST_IMPACT_LEVELS)[number];

export const REQUEST_URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RequestUrgency = (typeof REQUEST_URGENCY_LEVELS)[number];

export const SOURCE_CHANNELS = ["WEB", "EMAIL", "PHONE", "CHAT", "API"] as const;
export type SourceChannel = (typeof SOURCE_CHANNELS)[number];

export const REQUEST_COMMENT_VISIBILITIES = ["PUBLIC", "INTERNAL"] as const;
export type RequestCommentVisibility = (typeof REQUEST_COMMENT_VISIBILITIES)[number];

export const SLA_HEALTHS = ["ON_TRACK", "AT_RISK", "BREACHED"] as const;
export type SlaHealth = (typeof SLA_HEALTHS)[number];

export const SLA_TYPES = ["ASSIGNMENT", "RESOLUTION"] as const;
export type SlaType = (typeof SLA_TYPES)[number];

export const ASSET_STATUSES = ["ACTIVE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
