export declare const SERVICE_OPS_ENDPOINTS: {
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
};
//# sourceMappingURL=endpoints.d.ts.map