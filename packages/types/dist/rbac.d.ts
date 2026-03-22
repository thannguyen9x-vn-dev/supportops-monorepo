export declare const SYSTEM_ROLES: readonly ["EMPLOYEE", "OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"];
export type SystemRole = (typeof SYSTEM_ROLES)[number];
export declare const REQUEST_PARTICIPANT_ROLES: readonly ["requester", "assignee", "resolvedBy", "closedBy"];
export type RequestParticipantRole = (typeof REQUEST_PARTICIPANT_ROLES)[number];
export declare const COMMENT_TYPES: readonly ["PUBLIC", "INTERNAL"];
export type CommentType = (typeof COMMENT_TYPES)[number];
export declare const RBAC_PERMISSIONS: {
    readonly REQUEST_CREATE: "request.create";
    readonly REQUEST_READ_OWN: "request.read.own";
    readonly REQUEST_READ_ALL: "request.read.all";
    readonly REQUEST_UPDATE_METADATA: "request.update.metadata";
    readonly REQUEST_ASSIGN: "request.assign";
    readonly REQUEST_REASSIGN: "request.reassign";
    readonly REQUEST_START_WORK: "request.start_work";
    readonly REQUEST_RESOLVE: "request.resolve";
    readonly REQUEST_CLOSE: "request.close";
    readonly REQUEST_REOPEN: "request.reopen";
    readonly REQUEST_ESCALATE: "request.escalate";
    readonly COMMENT_CREATE_PUBLIC: "comment.create.public";
    readonly COMMENT_CREATE_INTERNAL: "comment.create.internal";
    readonly COMMENT_READ_INTERNAL: "comment.read.internal";
    readonly WORKFLOW_MANAGE: "workflow.manage";
    readonly SLA_MANAGE: "sla.manage";
    readonly ROLE_MANAGE: "role.manage";
    readonly AUDIT_READ: "audit.read";
};
export type RbacPermission = (typeof RBAC_PERMISSIONS)[keyof typeof RBAC_PERMISSIONS];
export declare const ROLE_PERMISSION_MATRIX: Record<SystemRole, RbacPermission[]>;
//# sourceMappingURL=rbac.d.ts.map