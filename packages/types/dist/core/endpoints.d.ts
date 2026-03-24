export declare const CORE_ENDPOINTS: {
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
    readonly TENANTS: {
        readonly CURRENT: "/tenants/current";
    };
    readonly USERS: {
        readonly ME: "/users/me";
        readonly AVATAR: "/users/me/avatar";
        readonly PASSWORD: "/users/me/password";
        readonly PREFERENCES: "/users/me/preferences";
        readonly SESSIONS: "/users/me/sessions";
        readonly SESSION: (id: string) => string;
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