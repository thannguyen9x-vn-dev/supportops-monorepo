import { CORE_ENDPOINTS } from "./core/endpoints";
import { AI_ENDPOINTS, SERVICE_OPS_ENDPOINTS } from "./service-ops/endpoints";

export { AI_ENDPOINTS };

export const LEGACY_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION_EMAIL: "/auth/resend-verification-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ACCEPT_INVITE: "/auth/invite/accept"
  },

  USERS: {
    LIST: "/users",
    INVITE: "/users/invite",
    ME: "/users/me",
    AVATAR: "/users/me/avatar",
    PASSWORD: "/users/me/password",
    PREFERENCES: "/users/me/preferences",
    SESSIONS: "/users/me/sessions",
    SESSION: (id: string) => `/users/me/sessions/${id}`,
    ROLE: (id: string) => `/users/${id}/role`,
    DEPARTMENT: (id: string) => `/users/${id}/department`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    REACTIVATE: (id: string) => `/users/${id}/reactivate`
  },

  DASHBOARD: {
    SUMMARY: "/dashboard/summary",
    RECENT_ACTIVITY: "/dashboard/recent-activity",
    REQUEST_TREND: "/dashboard/request-trend",
    SALES_SUMMARY: "/dashboard/sales-summary",
    KPI: "/dashboard/kpi",
    SESSIONS_COUNTRY: "/dashboard/sessions-by-country",
    SESSIONS_DEVICE: "/dashboard/sessions-by-device",
    LATEST_CUSTOMERS: "/dashboard/latest-customers",
    TRANSACTIONS: "/dashboard/transactions"
  },

  FILES: {
    UPLOAD: "/files/upload",
    DELETE: (id: string) => `/files/${id}`,
    ACCESS_URL: "/files/access-url"
  }
} as const;

export const ENDPOINTS = {
  ...CORE_ENDPOINTS,
  ...SERVICE_OPS_ENDPOINTS,
  ...LEGACY_ENDPOINTS,
} as const;
