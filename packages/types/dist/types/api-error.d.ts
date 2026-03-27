export interface ApiErrorDetail {
    code: string;
    message: string;
    details?: unknown[];
    traceId?: string;
}
export interface ApiErrorResponse {
    error: ApiErrorDetail;
}
export declare const ErrorCodes: {
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly TOKEN_INVALID: "TOKEN_INVALID";
    readonly EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS";
    readonly EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly PLAN_LIMIT_EXCEEDED: "PLAN_LIMIT_EXCEEDED";
    readonly SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE";
};
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
//# sourceMappingURL=api-error.d.ts.map