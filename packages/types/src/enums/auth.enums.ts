export const USER_ROLES = ["EMPLOYEE", "OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];
