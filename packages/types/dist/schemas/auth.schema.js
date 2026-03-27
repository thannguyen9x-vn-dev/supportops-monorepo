import { z } from "zod";
export const loginSchema = z.object({
    tenantSlug: z
        .string()
        .min(1, "Tenant slug is required")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid tenant slug format")
        .optional(),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional()
});
export const registerSchema = z
    .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
        .string()
        .min(10, "At least 10 characters")
        .max(32, "At most 32 characters")
        .regex(/[a-z]/, "At least one lowercase character")
        .regex(/[A-Z]/, "At least one uppercase character")
        .regex(/[0-9]/, "At least one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "At least one special character"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    organizationName: z.string().min(1, "Organization is required")
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format")
});
export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Verification token is required")
});
export const resetPasswordSchema = z
    .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    code: z
        .string()
        .min(6, "Verification code must be 6 digits")
        .max(6, "Verification code must be 6 digits")
        .regex(/^\d{6}$/, "Verification code must be 6 digits"),
    newPassword: z
        .string()
        .min(10, "At least 10 characters")
        .max(32, "At most 32 characters")
        .regex(/[a-z]/, "At least one lowercase character")
        .regex(/[A-Z]/, "At least one uppercase character")
        .regex(/[0-9]/, "At least one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "At least one special character"),
    confirmPassword: z.string()
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
export const acceptInviteSchema = z
    .object({
    token: z.string().min(1, "Invite token is required"),
    fullName: z.string().min(1, "Full name is required"),
    password: z
        .string()
        .min(10, "At least 10 characters")
        .max(32, "At most 32 characters")
        .regex(/[a-z]/, "At least one lowercase character")
        .regex(/[A-Z]/, "At least one uppercase character")
        .regex(/[0-9]/, "At least one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "At least one special character"),
    confirmPassword: z.string()
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
