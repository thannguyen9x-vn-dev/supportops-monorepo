import { describe, expect, expectTypeOf, it } from "vitest";
import { acceptInviteSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyEmailSchema } from "../schemas/auth.schema";
const VALID_PASSWORD = "ValidPass1!";
const MAX_PASSWORD = "Abcdefghij1234567890!@#$%^&*()XY";
const getMessage = (result, path) => {
    return result.error.issues.find((issue) => issue.path.join(".") === path)?.message;
};
describe("auth.schema", () => {
    describe("loginSchema", () => {
        it("parses valid input", () => {
            const parsed = loginSchema.parse({
                tenantSlug: "supportops-team",
                email: "user@example.com",
                password: "secret",
                rememberMe: true
            });
            expect(parsed).toEqual({
                tenantSlug: "supportops-team",
                email: "user@example.com",
                password: "secret",
                rememberMe: true
            });
            expectTypeOf(parsed).toMatchTypeOf();
        });
        it("fails with expected messages for invalid fields", () => {
            const invalid = loginSchema.safeParse({
                tenantSlug: "Invalid Slug",
                email: "",
                password: ""
            });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "tenantSlug")).toBe("Invalid tenant slug format");
                expect(getMessage(invalid, "email")).toBe("Email is required");
                expect(getMessage(invalid, "password")).toBe("Password is required");
            }
        });
        it("handles edge cases: optional tenantSlug and null object", () => {
            const noSlug = loginSchema.safeParse({
                email: "user@example.com",
                password: "secret"
            });
            expect(noSlug.success).toBe(true);
            const nullInput = loginSchema.safeParse(null);
            expect(nullInput.success).toBe(false);
            if (!nullInput.success) {
                expect(nullInput.error.issues[0]?.message).toBe("Expected object, received null");
            }
        });
    });
    describe("registerSchema", () => {
        const validInput = {
            email: "new.user@example.com",
            password: VALID_PASSWORD,
            confirmPassword: VALID_PASSWORD,
            firstName: "New",
            lastName: "User",
            organizationName: "SupportOps"
        };
        it("parses valid input and supports password boundaries", () => {
            const parsed = registerSchema.parse(validInput);
            expect(parsed).toEqual(validInput);
            expectTypeOf(parsed).toMatchTypeOf();
            const maxBoundary = registerSchema.safeParse({
                ...validInput,
                password: MAX_PASSWORD,
                confirmPassword: MAX_PASSWORD
            });
            expect(maxBoundary.success).toBe(true);
        });
        it("fails for mismatch password and empty required fields", () => {
            const invalid = registerSchema.safeParse({
                ...validInput,
                email: "",
                firstName: "",
                organizationName: "",
                confirmPassword: "Mismatch1!"
            });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "email")).toBe("Email is required");
                expect(getMessage(invalid, "firstName")).toBe("First name is required");
                expect(getMessage(invalid, "organizationName")).toBe("Organization is required");
                expect(getMessage(invalid, "confirmPassword")).toBe("Passwords do not match");
            }
        });
        it("fails on boundary/edge inputs", () => {
            const tooShort = registerSchema.safeParse({
                ...validInput,
                password: "Aa1!aaaaa",
                confirmPassword: "Aa1!aaaaa"
            });
            expect(tooShort.success).toBe(false);
            if (!tooShort.success) {
                expect(getMessage(tooShort, "password")).toBe("At least 10 characters");
            }
            const undefinedInput = registerSchema.safeParse(undefined);
            expect(undefinedInput.success).toBe(false);
            if (!undefinedInput.success) {
                expect(undefinedInput.error.issues[0]?.message).toBe("Required");
            }
        });
    });
    describe("forgotPasswordSchema", () => {
        it("parses valid input", () => {
            const parsed = forgotPasswordSchema.parse({ email: "reset@example.com" });
            expect(parsed).toEqual({ email: "reset@example.com" });
            expectTypeOf(parsed).toMatchTypeOf();
        });
        it("fails with expected email validation message", () => {
            const invalid = forgotPasswordSchema.safeParse({ email: "bad-email" });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "email")).toBe("Invalid email format");
            }
        });
        it("handles null and empty string edge cases", () => {
            const empty = forgotPasswordSchema.safeParse({ email: "" });
            expect(empty.success).toBe(false);
            if (!empty.success) {
                expect(getMessage(empty, "email")).toBe("Email is required");
            }
            const nullInput = forgotPasswordSchema.safeParse({ email: null });
            expect(nullInput.success).toBe(false);
            if (!nullInput.success) {
                expect(getMessage(nullInput, "email")).toBe("Expected string, received null");
            }
        });
    });
    describe("verifyEmailSchema", () => {
        it("parses valid input", () => {
            const parsed = verifyEmailSchema.parse({ token: "verify-token" });
            expect(parsed).toEqual({ token: "verify-token" });
            expectTypeOf(parsed).toMatchTypeOf();
        });
        it("fails with expected token message", () => {
            const invalid = verifyEmailSchema.safeParse({ token: "" });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "token")).toBe("Verification token is required");
            }
        });
        it("fails for undefined token", () => {
            const invalid = verifyEmailSchema.safeParse({ token: undefined });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "token")).toBe("Required");
            }
        });
    });
    describe("resetPasswordSchema", () => {
        const validInput = {
            email: "reset@example.com",
            code: "123456",
            newPassword: VALID_PASSWORD,
            confirmPassword: VALID_PASSWORD
        };
        it("parses valid input", () => {
            const parsed = resetPasswordSchema.parse(validInput);
            expect(parsed).toEqual(validInput);
            expectTypeOf(parsed).toMatchTypeOf();
        });
        it("fails with expected messages for code and password match", () => {
            const invalid = resetPasswordSchema.safeParse({
                ...validInput,
                code: "12A45",
                confirmPassword: "OtherPass1!"
            });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "code")).toBe("Verification code must be 6 digits");
                expect(getMessage(invalid, "confirmPassword")).toBe("Passwords do not match");
            }
        });
        it("checks boundary values for verification code", () => {
            const tooShort = resetPasswordSchema.safeParse({ ...validInput, code: "12345" });
            expect(tooShort.success).toBe(false);
            if (!tooShort.success) {
                expect(getMessage(tooShort, "code")).toBe("Verification code must be 6 digits");
            }
            const tooLong = resetPasswordSchema.safeParse({ ...validInput, code: "1234567" });
            expect(tooLong.success).toBe(false);
            if (!tooLong.success) {
                expect(getMessage(tooLong, "code")).toBe("Verification code must be 6 digits");
            }
        });
    });
    describe("acceptInviteSchema", () => {
        const validInput = {
            token: "invite-token",
            fullName: "Jane Doe",
            password: VALID_PASSWORD,
            confirmPassword: VALID_PASSWORD
        };
        it("parses valid input", () => {
            const parsed = acceptInviteSchema.parse(validInput);
            expect(parsed).toEqual(validInput);
            expectTypeOf(parsed).toMatchTypeOf();
        });
        it("fails with expected messages for required and mismatch fields", () => {
            const invalid = acceptInviteSchema.safeParse({
                token: "",
                fullName: "",
                password: VALID_PASSWORD,
                confirmPassword: "Mismatch1!"
            });
            expect(invalid.success).toBe(false);
            if (!invalid.success) {
                expect(getMessage(invalid, "token")).toBe("Invite token is required");
                expect(getMessage(invalid, "fullName")).toBe("Full name is required");
                expect(getMessage(invalid, "confirmPassword")).toBe("Passwords do not match");
            }
        });
        it("fails on null and boundary password", () => {
            const nullToken = acceptInviteSchema.safeParse({ ...validInput, token: null });
            expect(nullToken.success).toBe(false);
            if (!nullToken.success) {
                expect(getMessage(nullToken, "token")).toBe("Expected string, received null");
            }
            const tooShort = acceptInviteSchema.safeParse({
                ...validInput,
                password: "Aa1!aaaaa",
                confirmPassword: "Aa1!aaaaa"
            });
            expect(tooShort.success).toBe(false);
            if (!tooShort.success) {
                expect(getMessage(tooShort, "password")).toBe("At least 10 characters");
            }
        });
    });
});
