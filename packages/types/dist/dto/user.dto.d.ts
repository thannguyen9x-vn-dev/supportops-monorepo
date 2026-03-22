export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthday?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
    organization?: string;
    department?: string;
    timezone?: string;
    locale?: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
//# sourceMappingURL=user.dto.d.ts.map