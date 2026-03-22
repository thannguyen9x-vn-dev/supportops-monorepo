export const SERVICE_OPS_ENDPOINTS = {
    REQUESTS: {
        LIST: "/requests",
        TAB_COUNTS: "/requests/tab-counts",
        ASSIGNEES: "/requests/assignees",
        DETAIL: (id) => `/requests/${id}`,
        WORKFLOW: (id) => `/requests/${id}/workflow`,
        CREATE: "/requests",
        UPDATE: (id) => `/requests/${id}`,
        STATUS: (id) => `/requests/${id}/status`,
        TRANSITION: (id) => `/requests/${id}/transition`,
        ASSIGN: (id) => `/requests/${id}/assign`,
        UNASSIGN: (id) => `/requests/${id}/unassign`,
        COMMENTS: (id) => `/requests/${id}/comments`,
        WORK_LOG: (id) => `/requests/${id}/work-log`,
    },
    ASSIGNMENTS: {
        LIST: "/assignments",
    },
    SLA: {
        POLICIES: "/sla/policies",
        POLICY: (id) => `/sla/policies/${id}`,
        VIOLATIONS: "/sla/violations",
    },
    ESCALATIONS: {
        RULES: "/escalations/rules",
        RULE: (id) => `/escalations/rules/${id}`,
        EVENTS: "/escalations/events",
        TRIGGER: (requestId) => `/escalations/events/trigger/${requestId}`,
    },
    ASSETS: {
        LIST: "/assets",
        DETAIL: (id) => `/assets/${id}`,
    },
    WORK_LOGS: {
        LIST: (requestId) => `/requests/${requestId}/work-logs`,
        DETAIL: (requestId, workLogId) => `/requests/${requestId}/work-logs/${workLogId}`,
    },
    RESOLUTIONS: {
        CONFIRM: (requestId) => `/requests/${requestId}/resolution/confirm`,
        REOPEN: (requestId) => `/requests/${requestId}/resolution/reopen`,
    },
    SERVICE_TYPES: {
        LIST: "/service-types",
        DETAIL: (id) => `/service-types/${id}`,
    },
    SLA_POLICIES: {
        LIST: "/sla-policies",
        DETAIL: (id) => `/sla-policies/${id}`,
    },
    WORKFLOW_TRANSITIONS: {
        LIST: "/workflow-transitions",
        DETAIL: (id) => `/workflow-transitions/${id}`,
    },
};
