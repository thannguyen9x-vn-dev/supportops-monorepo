import type { AuthUser } from "@supportops/types";

export const mockUser: AuthUser = {
  id: "user-1",
  email: "admin@supportops.dev",
  firstName: "SupportOps",
  lastName: "Admin",
  avatarUrl: null,
  role: "TENANT_ADMIN",
  tenantId: "tenant-1",
  tenantName: "SupportOps"
};
