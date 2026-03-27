import { z } from "zod";
export declare const loginSchema: any;
export declare const registerSchema: any;
export declare const forgotPasswordSchema: any;
export declare const verifyEmailSchema: any;
export declare const resetPasswordSchema: any;
export declare const acceptInviteSchema: any;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;
//# sourceMappingURL=auth.schema.d.ts.map