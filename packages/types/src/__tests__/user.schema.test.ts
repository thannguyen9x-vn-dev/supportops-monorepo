import { describe, expect, expectTypeOf, it } from "vitest";

import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData
} from "../schemas/user.schema";

const VALID_PASSWORD = "ValidPass1!";

const getMessage = (
  result: {
    success: false;
    error: { issues: Array<{ path: Array<string | number>; message: string }> };
  },
  path: string
): string | undefined => {
  return result.error.issues.find((issue) => issue.path.join(".") === path)?.message;
};

describe("user.schema", () => {
  describe("updateProfileSchema", () => {
    it("parses valid full profile", () => {
      const input = {
        firstName: "Jane",
        lastName: "Doe",
        phone: "+84 912 345 678",
        birthday: "1990-01-01",
        address: "123 Main St",
        city: "HCMC",
        zipCode: "700000",
        country: "VN",
        organization: "SupportOps",
        department: "IT",
        timezone: "Asia/Ho_Chi_Minh",
        locale: "vi-VN"
      };

      const parsed = updateProfileSchema.parse(input);
      expect(parsed).toEqual(input);
      expectTypeOf(parsed).toMatchTypeOf<UpdateProfileFormData>();
    });

    it("allows empty phone string edge case", () => {
      const parsed = updateProfileSchema.parse({ phone: "" });
      expect(parsed.phone).toBe("");
    });

    it("fails with expected messages for boundary/invalid values", () => {
      const invalidName = updateProfileSchema.safeParse({ firstName: "" });
      expect(invalidName.success).toBe(false);
      if (!invalidName.success) {
        expect(getMessage(invalidName, "firstName")).toBe("String must contain at least 1 character(s)");
      }

      const invalidPhone = updateProfileSchema.safeParse({ phone: "123456" });
      expect(invalidPhone.success).toBe(false);
      if (!invalidPhone.success) {
        expect(getMessage(invalidPhone, "phone")).toBe("Invalid phone format. Expected: +<code> <number>");
      }
    });

    it("handles null/undefined object edge cases", () => {
      const undefinedInput = updateProfileSchema.safeParse(undefined);
      expect(undefinedInput.success).toBe(false);
      if (!undefinedInput.success) {
        expect(undefinedInput.error.issues[0]?.message).toBe("Required");
      }

      const nullInput = updateProfileSchema.safeParse(null);
      expect(nullInput.success).toBe(false);
      if (!nullInput.success) {
        expect(nullInput.error.issues[0]?.message).toBe("Expected object, received null");
      }
    });
  });

  describe("changePasswordSchema", () => {
    const validInput = {
      currentPassword: "CurrentPass1!",
      newPassword: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD
    };

    it("parses valid input", () => {
      const parsed = changePasswordSchema.parse(validInput);
      expect(parsed).toEqual(validInput);
      expectTypeOf(parsed).toMatchTypeOf<ChangePasswordFormData>();
    });

    it("fails with expected refine messages", () => {
      const samePassword = changePasswordSchema.safeParse({
        currentPassword: VALID_PASSWORD,
        newPassword: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD
      });

      expect(samePassword.success).toBe(false);
      if (!samePassword.success) {
        expect(getMessage(samePassword, "newPassword")).toBe("New password must be different from current password");
      }

      const mismatch = changePasswordSchema.safeParse({
        ...validInput,
        confirmPassword: "Mismatch1!"
      });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(getMessage(mismatch, "confirmPassword")).toBe("Passwords do not match");
      }
    });

    it("fails on boundary and edge values", () => {
      const emptyCurrent = changePasswordSchema.safeParse({
        ...validInput,
        currentPassword: ""
      });
      expect(emptyCurrent.success).toBe(false);
      if (!emptyCurrent.success) {
        expect(getMessage(emptyCurrent, "currentPassword")).toBe("Current password is required");
      }

      const tooShort = changePasswordSchema.safeParse({
        ...validInput,
        newPassword: "Aa1!aaaaa",
        confirmPassword: "Aa1!aaaaa"
      });
      expect(tooShort.success).toBe(false);
      if (!tooShort.success) {
        expect(getMessage(tooShort, "newPassword")).toBe("At least 10 characters");
      }

      const nullInput = changePasswordSchema.safeParse(null);
      expect(nullInput.success).toBe(false);
      if (!nullInput.success) {
        expect(nullInput.error.issues[0]?.message).toBe("Expected object, received null");
      }
    });
  });
});
