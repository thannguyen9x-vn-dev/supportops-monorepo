import { z } from "zod";
export const updateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z
        .string()
        .regex(/^\+\d{1,4}\s[\d\s().-]{4,20}$/, "Invalid phone format. Expected: +<code> <number>")
        .optional()
        .or(z.literal("")),
    birthday: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    organization: z.string().optional(),
    department: z.string().optional(),
    timezone: z.string().optional(),
    locale: z.string().optional()
});
export const changePasswordSchema = z
    .object({
    currentPassword: z.string().min(1, "Current password is required"),
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
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
