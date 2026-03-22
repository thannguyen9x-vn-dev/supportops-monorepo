export const SERVICE_OPS_ENDPOINTS = {
  REQUESTS: {
    LIST: "/requests",
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
    DETAIL: (id: string) => `/assets/${id}`,
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
} as const;
