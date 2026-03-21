import type { UserRole } from "@supportops/types";

export function isOpsCoordinator(role?: UserRole): boolean {
  return role === "OPS_COORDINATOR";
}

export function isTechnician(role?: UserRole): boolean {
  return role === "TECHNICIAN";
}

export function isTenantAdmin(role?: UserRole): boolean {
  return role === "TENANT_ADMIN";
}

export function canViewAllTenantRequests(role?: UserRole): boolean {
  return isOpsCoordinator(role) || isTenantAdmin(role);
}

export function canViewAssignedOrRelatedRequests(role?: UserRole): boolean {
  return isTechnician(role);
}

export function canManageServiceOpsConfig(role?: UserRole): boolean {
  return isTenantAdmin(role);
}
