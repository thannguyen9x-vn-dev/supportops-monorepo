export const SERVICE_OPS_ENDPOINTS = {
  REQUESTS: {
    LIST: "/requests",
    DETAIL: (id: string) => `/requests/${id}`,
    CREATE: "/requests",
    UPDATE: (id: string) => `/requests/${id}`,
    TRANSITION: (id: string) => `/requests/${id}/transition`,
    ASSIGN: (id: string) => `/requests/${id}/assign`,
    UNASSIGN: (id: string) => `/requests/${id}/unassign`,
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
