import type { AuthUser } from "../domain";
export interface LoginRequest {
    tenantSlug?: string;
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface LoginResponse {
    accessToken: string;
    expiresIn: number;
    user: AuthUser;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
}
export interface RegisterResponse {
    message: string;
    requiresEmailVerification: boolean;
    email: string;
}
export interface RefreshTokenRequest {
    refreshToken?: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
}
export interface ForgotPasswordRequest {
    email: string;
}
export interface VerifyEmailRequest {
    token: string;
}
export interface ResendVerificationEmailRequest {
    email: string;
}
export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
}
export interface AcceptInviteRequest {
    token: string;
    fullName: string;
    password: string;
    confirmPassword: string;
}
export interface AuthMessageResponse {
    message: string;
}
//# sourceMappingURL=auth.dto.d.ts.map