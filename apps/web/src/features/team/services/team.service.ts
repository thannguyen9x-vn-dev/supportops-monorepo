import { ENDPOINTS, apiClient } from "@/lib/api";

export type TeamRoleCode = "EMPLOYEE" | "OPS_COORDINATOR" | "TECHNICIAN" | "TENANT_ADMIN";
export type TeamMembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
export type TeamUserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface TeamUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  department: string | null;
  userStatus: TeamUserStatus;
  isActive: boolean;
  lastLoginAt: string | null;
  membershipId: string | null;
  roleCode: TeamRoleCode | null;
  membershipStatus: TeamMembershipStatus | null;
  createdAt: string;
}

export interface InviteUserPayload {
  email: string;
  roleCode: TeamRoleCode;
  fullName?: string;
}

export interface InviteUserResponse {
  inviteId: string;
  expiresAt: string;
}

export const teamService = {
  listUsers: () => apiClient.get<TeamUser[]>(ENDPOINTS.USERS.LIST),
  inviteUser: (payload: InviteUserPayload) => apiClient.post<InviteUserResponse>(ENDPOINTS.USERS.INVITE, payload),
  updateRole: (userId: string, roleCode: TeamRoleCode) =>
    apiClient.patch<void>(ENDPOINTS.USERS.ROLE(userId), { roleCode }),
  updateDepartment: (userId: string, department: string) =>
    apiClient.patch<void>(ENDPOINTS.USERS.DEPARTMENT(userId), { department }),
  deactivateUser: (userId: string, reason?: string) =>
    apiClient.patch<void>(ENDPOINTS.USERS.DEACTIVATE(userId), reason ? { reason } : {}),
  reactivateUser: (userId: string, reason?: string) =>
    apiClient.patch<void>(ENDPOINTS.USERS.REACTIVATE(userId), reason ? { reason } : {}),
};
