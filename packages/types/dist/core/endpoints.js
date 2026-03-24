export const CORE_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        REFRESH: "/auth/refresh",
        LOGOUT: "/auth/logout",
        VERIFY_EMAIL: "/auth/verify-email",
        RESEND_VERIFICATION_EMAIL: "/auth/resend-verification-email",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        ACCEPT_INVITE: "/auth/invite/accept",
    },
    TENANTS: {
        CURRENT: "/tenants/current",
    },
    USERS: {
        ME: "/users/me",
        AVATAR: "/users/me/avatar",
        PASSWORD: "/users/me/password",
        PREFERENCES: "/users/me/preferences",
        SESSIONS: "/users/me/sessions",
        SESSION: (id) => `/users/me/sessions/${id}`,
    },
    ROLES: {
        LIST: "/roles",
        DETAIL: (id) => `/roles/${id}`,
    },
    PERMISSIONS: {
        LIST: "/permissions",
    },
    WORK_ITEMS: {
        LIST: "/work-items",
        DETAIL: (id) => `/work-items/${id}`,
    },
    WORKFLOWS: {
        LIST: "/workflows",
        DETAIL: (id) => `/workflows/${id}`,
    },
    COMMENTS: {
        LIST: (entityType, entityId) => `/${entityType}/${entityId}/comments`,
        DETAIL: (entityType, entityId, commentId) => `/${entityType}/${entityId}/comments/${commentId}`,
    },
    NOTIFICATIONS: {
        LIST: "/notifications",
        READ: (id) => `/notifications/${id}/read`,
        READ_ALL: "/notifications/read-all",
    },
    AUDIT_LOGS: {
        LIST: "/audit-logs",
        DETAIL: (id) => `/audit-logs/${id}`,
    },
};
