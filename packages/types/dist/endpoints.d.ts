import { AI_ENDPOINTS } from "./service-ops/endpoints";
export { AI_ENDPOINTS };
export declare const LEGACY_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly REFRESH: "/auth/refresh";
        readonly LOGOUT: "/auth/logout";
        readonly VERIFY_EMAIL: "/auth/verify-email";
        readonly RESEND_VERIFICATION_EMAIL: "/auth/resend-verification-email";
        readonly FORGOT_PASSWORD: "/auth/forgot-password";
        readonly RESET_PASSWORD: "/auth/reset-password";
        readonly ACCEPT_INVITE: "/auth/invite/accept";
    };
    readonly USERS: {
        readonly LIST: "/users";
        readonly INVITE: "/users/invite";
        readonly ME: "/users/me";
        readonly AVATAR: "/users/me/avatar";
        readonly PASSWORD: "/users/me/password";
        readonly PREFERENCES: "/users/me/preferences";
        readonly SESSIONS: "/users/me/sessions";
        readonly SESSION: (id: string) => string;
        readonly ROLE: (id: string) => string;
        readonly DEPARTMENT: (id: string) => string;
        readonly DEACTIVATE: (id: string) => string;
        readonly REACTIVATE: (id: string) => string;
    };
    readonly DASHBOARD: {
        readonly SUMMARY: "/dashboard/summary";
        readonly RECENT_ACTIVITY: "/dashboard/recent-activity";
        readonly REQUEST_TREND: "/dashboard/request-trend";
        readonly SALES_SUMMARY: "/dashboard/sales-summary";
        readonly KPI: "/dashboard/kpi";
        readonly SESSIONS_COUNTRY: "/dashboard/sessions-by-country";
        readonly SESSIONS_DEVICE: "/dashboard/sessions-by-device";
        readonly LATEST_CUSTOMERS: "/dashboard/latest-customers";
        readonly TRANSACTIONS: "/dashboard/transactions";
    };
    readonly FILES: {
        readonly UPLOAD: "/files/upload";
        readonly DELETE: (id: string) => string;
        readonly ACCESS_URL: "/files/access-url";
    };
};
export declare const ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly REFRESH: "/auth/refresh";
        readonly LOGOUT: "/auth/logout";
        readonly VERIFY_EMAIL: "/auth/verify-email";
        readonly RESEND_VERIFICATION_EMAIL: "/auth/resend-verification-email";
        readonly FORGOT_PASSWORD: "/auth/forgot-password";
        readonly RESET_PASSWORD: "/auth/reset-password";
        readonly ACCEPT_INVITE: "/auth/invite/accept";
    };
    readonly USERS: {
        readonly LIST: "/users";
        readonly INVITE: "/users/invite";
        readonly ME: "/users/me";
        readonly AVATAR: "/users/me/avatar";
        readonly PASSWORD: "/users/me/password";
        readonly PREFERENCES: "/users/me/preferences";
        readonly SESSIONS: "/users/me/sessions";
        readonly SESSION: (id: string) => string;
        readonly ROLE: (id: string) => string;
        readonly DEPARTMENT: (id: string) => string;
        readonly DEACTIVATE: (id: string) => string;
        readonly REACTIVATE: (id: string) => string;
    };
    readonly DASHBOARD: {
        readonly SUMMARY: "/dashboard/summary";
        readonly RECENT_ACTIVITY: "/dashboard/recent-activity";
        readonly REQUEST_TREND: "/dashboard/request-trend";
        readonly SALES_SUMMARY: "/dashboard/sales-summary";
        readonly KPI: "/dashboard/kpi";
        readonly SESSIONS_COUNTRY: "/dashboard/sessions-by-country";
        readonly SESSIONS_DEVICE: "/dashboard/sessions-by-device";
        readonly LATEST_CUSTOMERS: "/dashboard/latest-customers";
        readonly TRANSACTIONS: "/dashboard/transactions";
    };
    readonly FILES: {
        readonly UPLOAD: "/files/upload";
        readonly DELETE: (id: string) => string;
        readonly ACCESS_URL: "/files/access-url";
    };
    readonly REQUESTS: {
        readonly LIST: "/requests";
        readonly TAB_COUNTS: "/requests/tab-counts";
        readonly ASSIGNEES: "/requests/assignees";
        readonly DETAIL: (id: string) => string;
        readonly WORKFLOW: (id: string) => string;
        readonly CREATE: "/requests";
        readonly UPDATE: (id: string) => string;
        readonly STATUS: (id: string) => string;
        readonly TRANSITION: (id: string) => string;
        readonly ASSIGN: (id: string) => string;
        readonly UNASSIGN: (id: string) => string;
        readonly COMMENTS: (id: string) => string;
        readonly WORK_LOG: (id: string) => string;
    };
    readonly ASSIGNMENTS: {
        readonly LIST: "/assignments";
    };
    readonly SLA: {
        readonly POLICIES: "/sla/policies";
        readonly POLICY: (id: string) => string;
        readonly VIOLATIONS: "/sla/violations";
    };
    readonly ESCALATIONS: {
        readonly RULES: "/escalations/rules";
        readonly RULE: (id: string) => string;
        readonly EVENTS: "/escalations/events";
        readonly TRIGGER: (requestId: string) => string;
    };
    readonly ASSETS: {
        readonly LIST: "/assets";
        readonly CREATE: "/assets";
        readonly DETAIL: (id: string) => string;
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
    };
    readonly ASSET_TYPES: {
        readonly LIST: "/asset-types";
        readonly CREATE: "/asset-types";
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
    };
    readonly WORK_LOGS: {
        readonly LIST: (requestId: string) => string;
        readonly DETAIL: (requestId: string, workLogId: string) => string;
    };
    readonly RESOLUTIONS: {
        readonly CONFIRM: (requestId: string) => string;
        readonly REOPEN: (requestId: string) => string;
    };
    readonly SERVICE_TYPES: {
        readonly LIST: "/service-types";
        readonly DETAIL: (id: string) => string;
    };
    readonly SLA_POLICIES: {
        readonly LIST: "/sla-policies";
        readonly DETAIL: (id: string) => string;
    };
    readonly WORKFLOW_TRANSITIONS: {
        readonly LIST: "/workflow-transitions";
        readonly DETAIL: (id: string) => string;
    };
    readonly TENANTS: {
        readonly CURRENT: "/tenants/current";
    };
    readonly ROLES: {
        readonly LIST: "/roles";
        readonly DETAIL: (id: string) => string;
    };
    readonly PERMISSIONS: {
        readonly LIST: "/permissions";
    };
    readonly WORK_ITEMS: {
        readonly LIST: "/work-items";
        readonly DETAIL: (id: string) => string;
    };
    readonly WORKFLOWS: {
        readonly LIST: "/workflows";
        readonly DETAIL: (id: string) => string;
    };
    readonly COMMENTS: {
        readonly LIST: (entityType: string, entityId: string) => string;
        readonly DETAIL: (entityType: string, entityId: string, commentId: string) => string;
    };
    readonly NOTIFICATIONS: {
        readonly LIST: "/notifications";
        readonly READ: (id: string) => string;
        readonly READ_ALL: "/notifications/read-all";
    };
    readonly AUDIT_LOGS: {
        readonly LIST: "/audit-logs";
        readonly DETAIL: (id: string) => string;
    };
};
//# sourceMappingURL=endpoints.d.ts.map