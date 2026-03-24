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
