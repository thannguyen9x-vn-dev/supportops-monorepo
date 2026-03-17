import { CORE_ENDPOINTS } from "./core/endpoints";
import { SERVICE_OPS_ENDPOINTS } from "./service-ops/endpoints";

export const LEGACY_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password"
  },

  USERS: {
    ME: "/users/me",
    AVATAR: "/users/me/avatar",
    PASSWORD: "/users/me/password",
    PREFERENCES: "/users/me/preferences",
    SESSIONS: "/users/me/sessions",
    SESSION: (id: string) => `/users/me/sessions/${id}`
  },

  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: string) => `/products/${id}`,
    BULK_DELETE: "/products/bulk",
    IMAGES: (id: string) => `/products/${id}/images`,
    IMAGE: (prodId: string, imgId: string) => `/products/${prodId}/images/${imgId}`
  },

  MESSAGES: {
    LIST: "/messages",
    DETAIL: (id: string) => `/messages/${id}`,
    REPLY: (id: string) => `/messages/${id}/reply`,
    FORWARD: (id: string) => `/messages/${id}/forward`,
    STAR: (id: string) => `/messages/${id}/star`,
    READ: (id: string) => `/messages/${id}/read`,
    STORAGE: "/messages/storage"
  },

  DASHBOARD: {
    SALES_SUMMARY: "/dashboard/sales-summary",
    KPI: "/dashboard/kpi",
    SESSIONS_COUNTRY: "/dashboard/sessions-by-country",
    SESSIONS_DEVICE: "/dashboard/sessions-by-device",
    LATEST_CUSTOMERS: "/dashboard/latest-customers",
    TRANSACTIONS: "/dashboard/transactions"
  },

  BOARDS: {
    LIST: "/boards",
    DETAIL: (id: string) => `/boards/${id}`,
    COLUMNS: (boardId: string) => `/boards/${boardId}/columns`,
    COLUMN: (boardId: string, colId: string) => `/boards/${boardId}/columns/${colId}`,
    COLUMNS_REORDER: (boardId: string) => `/boards/${boardId}/columns/reorder`,
    TASKS: (boardId: string, colId: string) => `/boards/${boardId}/columns/${colId}/tasks`
  },
  TASKS: {
    DETAIL: (id: string) => `/tasks/${id}`,
    MOVE: (id: string) => `/tasks/${id}/move`,
    ARCHIVE: (id: string) => `/tasks/${id}/archive`,
    MEMBERS: (id: string) => `/tasks/${id}/members`,
    MEMBER: (taskId: string, userId: string) => `/tasks/${taskId}/members/${userId}`,
    COMMENTS: (id: string) => `/tasks/${id}/comments`,
    COMMENT: (taskId: string, commentId: string) => `/tasks/${taskId}/comments/${commentId}`,
    ATTACHMENTS: (id: string) => `/tasks/${id}/attachments`,
    ATTACHMENT: (taskId: string, attachId: string) => `/tasks/${taskId}/attachments/${attachId}`
  },

  PLANS: {
    LIST: "/plans"
  },
  SUBSCRIPTIONS: {
    CURRENT: "/subscriptions/current",
    CREATE: "/subscriptions",
    CANCEL: "/subscriptions/cancel"
  },
  BILLING: {
    INFO: "/billing/info",
    PAYMENT_METHODS: "/billing/payment-methods",
    PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}`,
    ORDERS: "/billing/orders"
  },

  INVOICES: {
    LIST: "/invoices",
    DETAIL: (id: string) => `/invoices/${id}`,
    PDF: (id: string) => `/invoices/${id}/pdf`
  },

  FILES: {
    UPLOAD: "/files/upload"
  }
} as const;

export const ENDPOINTS = {
  ...CORE_ENDPOINTS,
  ...SERVICE_OPS_ENDPOINTS,
  ...LEGACY_ENDPOINTS,
} as const;
