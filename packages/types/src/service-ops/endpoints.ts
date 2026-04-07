export const SERVICE_OPS_ENDPOINTS = {
  REQUESTS: {
    LIST: "/requests",
    TAB_COUNTS: "/requests/tab-counts",
    ASSIGNEES: "/requests/assignees",
    DETAIL: (id: string) => `/requests/${id}`,
    WORKFLOW: (id: string) => `/requests/${id}/workflow`,
    CREATE: "/requests",
    UPDATE: (id: string) => `/requests/${id}`,
    STATUS: (id: string) => `/requests/${id}/status`,
    TRANSITION: (id: string) => `/requests/${id}/transition`,
    ASSIGN: (id: string) => `/requests/${id}/assign`,
    UNASSIGN: (id: string) => `/requests/${id}/unassign`,
    COMMENTS: (id: string) => `/requests/${id}/comments`,
    WORK_LOG: (id: string) => `/requests/${id}/work-log`,
    IMPORT_TEMPLATE: "/requests/import/template",
    IMPORT_UPLOAD: "/requests/import/upload",
    IMPORT_JOB_STATUS: (jobId: string) => `/requests/import/jobs/${jobId}`,
    IMPORT_JOB_CONFIRM: (jobId: string) => `/requests/import/jobs/${jobId}/confirm`,
    BULK_CREATE: "/requests/bulk",
  },
  ASSIGNMENTS: {
    LIST: "/assignments",
  },
  SLA: {
    POLICIES: "/sla/policies",
    POLICY: (id: string) => `/sla/policies/${id}`,
    VIOLATIONS: "/sla/violations",
  },
  ESCALATIONS: {
    RULES: "/escalations/rules",
    RULE: (id: string) => `/escalations/rules/${id}`,
    EVENTS: "/escalations/events",
    TRIGGER: (requestId: string) => `/escalations/events/trigger/${requestId}`,
  },
  ASSETS: {
    LIST: "/assets",
    CREATE: "/assets",
    DETAIL: (id: string) => `/assets/${id}`,
    UPDATE: (id: string) => `/assets/${id}`,
    DELETE: (id: string) => `/assets/${id}`,
  },
  ASSET_TYPES: {
    LIST: "/asset-types",
    CREATE: "/asset-types",
    UPDATE: (id: string) => `/asset-types/${id}`,
    DELETE: (id: string) => `/asset-types/${id}`,
  },
  WORK_LOGS: {
    LIST: (requestId: string) => `/requests/${requestId}/work-logs`,
    DETAIL: (requestId: string, workLogId: string) => `/requests/${requestId}/work-logs/${workLogId}`,
  },
  RESOLUTIONS: {
    CONFIRM: (requestId: string) => `/requests/${requestId}/resolution/confirm`,
    REOPEN: (requestId: string) => `/requests/${requestId}/resolution/reopen`,
  },
  SERVICE_TYPES: {
    LIST: "/service-types",
    DETAIL: (id: string) => `/service-types/${id}`,
  },
  SLA_POLICIES: {
    LIST: "/sla-policies",
    DETAIL: (id: string) => `/sla-policies/${id}`,
  },
  WORKFLOW_TRANSITIONS: {
    LIST: "/workflow-transitions",
    DETAIL: (id: string) => `/workflow-transitions/${id}`,
  },
} as const;

// ─── V2 Endpoints (append sau existing exports) ───────────────────

export const NOTIFICATION_ENDPOINTS = {
  list: "/notifications",
  stream: "/notifications/stream",
  unreadCount: "/notifications/unread-count",
  markRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: "/notifications/read-all"
} as const;

export const NOTIFICATION_PREFERENCE_ENDPOINTS = {
  get: "/notification-preferences",
  update: "/notification-preferences"
} as const;

export const WATCHER_ENDPOINTS = {
  watch: (requestId: string) => `/requests/${requestId}/watch`,
  unwatch: (requestId: string) => `/requests/${requestId}/watch`,
  list: (requestId: string) => `/requests/${requestId}/watchers`
} as const;

export const KNOWLEDGE_BASE_ENDPOINTS = {
  list: "/knowledge-base",
  search: "/knowledge-base/search",
  create: "/knowledge-base",
  detail: (id: string) => `/knowledge-base/${id}`,
  update: (id: string) => `/knowledge-base/${id}`,
  publish: (id: string) => `/knowledge-base/${id}/publish`,
  unpublish: (id: string) => `/knowledge-base/${id}/unpublish`,
  delete: (id: string) => `/knowledge-base/${id}`
} as const;

export const CANNED_RESPONSE_ENDPOINTS = {
  list: "/canned-responses",
  search: "/canned-responses/search",
  create: "/canned-responses",
  update: (id: string) => `/canned-responses/${id}`,
  delete: (id: string) => `/canned-responses/${id}`
} as const;

export const REPORT_ENDPOINTS = {
  overview: "/reports/overview"
} as const;

export const AI_ENDPOINTS = {
  ask: "/ai/ask",
  settings: "/ai/settings",
} as const;
