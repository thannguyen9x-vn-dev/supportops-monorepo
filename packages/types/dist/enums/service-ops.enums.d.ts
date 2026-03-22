export declare const REQUEST_STATUSES: readonly ["DRAFT", "SUBMITTED", "TRIAGE", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "WAITING_EXTERNAL_VENDOR", "REOPENED", "CANCELLED"];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export declare const REQUEST_PRIORITIES: readonly ["LOW", "MEDIUM", "HIGH", "URGENT"];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export declare const REQUEST_IMPACT_LEVELS: readonly ["LOW", "MEDIUM", "HIGH"];
export type RequestImpactLevel = (typeof REQUEST_IMPACT_LEVELS)[number];
export declare const REQUEST_URGENCY_LEVELS: readonly ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export type RequestUrgency = (typeof REQUEST_URGENCY_LEVELS)[number];
export declare const SOURCE_CHANNELS: readonly ["WEB", "EMAIL", "PHONE", "CHAT", "API"];
export type SourceChannel = (typeof SOURCE_CHANNELS)[number];
export declare const REQUEST_COMMENT_VISIBILITIES: readonly ["PUBLIC", "INTERNAL"];
export type RequestCommentVisibility = (typeof REQUEST_COMMENT_VISIBILITIES)[number];
export declare const SLA_HEALTHS: readonly ["ON_TRACK", "AT_RISK", "BREACHED"];
export type SlaHealth = (typeof SLA_HEALTHS)[number];
export declare const SLA_TYPES: readonly ["ASSIGNMENT", "RESOLUTION"];
export type SlaType = (typeof SLA_TYPES)[number];
//# sourceMappingURL=service-ops.enums.d.ts.map