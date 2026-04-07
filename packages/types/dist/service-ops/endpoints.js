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
        IMPORT_TEMPLATE: "/requests/import/template",
        IMPORT_UPLOAD: "/requests/import/upload",
        IMPORT_JOB_STATUS: (jobId) => `/requests/import/jobs/${jobId}`,
        IMPORT_JOB_CONFIRM: (jobId) => `/requests/import/jobs/${jobId}/confirm`,
        BULK_CREATE: "/requests/bulk",
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
        CREATE: "/assets",
        DETAIL: (id) => `/assets/${id}`,
        UPDATE: (id) => `/assets/${id}`,
        DELETE: (id) => `/assets/${id}`,
    },
    ASSET_TYPES: {
        LIST: "/asset-types",
        CREATE: "/asset-types",
        UPDATE: (id) => `/asset-types/${id}`,
        DELETE: (id) => `/asset-types/${id}`,
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
// ─── V2 Endpoints (append sau existing exports) ───────────────────
export const NOTIFICATION_ENDPOINTS = {
    list: "/notifications",
    stream: "/notifications/stream",
    unreadCount: "/notifications/unread-count",
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: "/notifications/read-all"
};
export const NOTIFICATION_PREFERENCE_ENDPOINTS = {
    get: "/notification-preferences",
    update: "/notification-preferences"
};
export const WATCHER_ENDPOINTS = {
    watch: (requestId) => `/requests/${requestId}/watch`,
    unwatch: (requestId) => `/requests/${requestId}/watch`,
    list: (requestId) => `/requests/${requestId}/watchers`
};
export const KNOWLEDGE_BASE_ENDPOINTS = {
    list: "/knowledge-base",
    search: "/knowledge-base/search",
    create: "/knowledge-base",
    detail: (id) => `/knowledge-base/${id}`,
    update: (id) => `/knowledge-base/${id}`,
    publish: (id) => `/knowledge-base/${id}/publish`,
    unpublish: (id) => `/knowledge-base/${id}/unpublish`,
    delete: (id) => `/knowledge-base/${id}`
};
export const CANNED_RESPONSE_ENDPOINTS = {
    list: "/canned-responses",
    search: "/canned-responses/search",
    create: "/canned-responses",
    update: (id) => `/canned-responses/${id}`,
    delete: (id) => `/canned-responses/${id}`
};
export const REPORT_ENDPOINTS = {
    overview: "/reports/overview"
};
export const AI_ENDPOINTS = {
    ask: "/ai/ask",
    settings: "/ai/settings",
};
