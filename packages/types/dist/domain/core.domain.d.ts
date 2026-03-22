export interface TenantMembership {
    tenantId: string;
    userId: string;
    roleCode: string;
}
export interface RolePermission {
    roleCode: string;
    permissionCode: string;
}
export interface WorkflowTransition {
    fromStatus: string;
    toStatus: string;
    allowedRoleCodes: string[];
    actionCode: string;
}
//# sourceMappingURL=core.domain.d.ts.map