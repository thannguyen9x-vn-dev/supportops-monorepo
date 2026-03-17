/**
 * TEST LOẠI 1: Unit test cho pure function
 *
 * "Pure function" = hàm không có side effects, chỉ nhận input và trả output.
 * Đây là loại test ĐƠN GIẢN NHẤT:
 *   - Không cần mock
 *   - Không cần React / component
 *   - Chỉ: gọi hàm → kiểm tra kết quả bằng expect().toBe()
 *
 * Khi nào dùng describe()? → Nhóm các test có liên quan để dễ đọc.
 * Khi nào dùng it.each()? → Khi nhiều case có cùng logic, chỉ khác data.
 */

import { ApiError } from "@/lib/api/apiClient";

import { getErrorMessage } from "../getErrorMessage";

// Fallback message dùng chung cho tất cả test
const FALLBACK = "Something went wrong";

describe("getErrorMessage", () => {
  // ── Nhóm 1: Input là ApiError (lỗi từ backend của dự án) ──────────────────

  describe("when error is an ApiError", () => {
    it("returns the error message when there are no details", () => {
      // ApiError với details trống → trả về error.message
      const error = new ApiError(400, { code: "BAD_REQUEST", message: "Bad request" });

      expect(getErrorMessage(error, FALLBACK)).toBe("Bad request");
    });

    it("appends string details in parentheses after the message", () => {
      // Khi có nhiều detail → ghép vào sau message trong ngoặc
      const error = new ApiError(422, {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: ["firstName is required", "email is invalid"]
      });

      expect(getErrorMessage(error, FALLBACK)).toBe(
        "Validation failed (firstName is required, email is invalid)"
      );
    });

    it("filters out non-string and blank details", () => {
      // details có thể chứa kiểu dữ liệu khác (null, number, string rỗng)
      // → chỉ giữ lại string có nội dung
      const error = new ApiError(422, {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: [null, 42, "  ", "email is invalid"]
      });

      expect(getErrorMessage(error, FALLBACK)).toBe("Validation failed (email is invalid)");
    });

    it("returns the fallback when error.message is empty", () => {
      // message rỗng → không dùng message, fallback về FALLBACK
      const error = new ApiError(500, { code: "SERVER_ERROR", message: "" });

      expect(getErrorMessage(error, FALLBACK)).toBe(FALLBACK);
    });
  });

  // ── Nhóm 2: Input là Error JS thông thường ────────────────────────────────

  describe("when error is a generic JavaScript Error", () => {
    it("returns error.message", () => {
      expect(getErrorMessage(new Error("Network failed"), FALLBACK)).toBe("Network failed");
    });
  });

  // ── Nhóm 3: Input là kiểu không xác định (string, null, object...) ────────

  describe("when error is an unknown type", () => {
    // it.each: chạy cùng một test với nhiều bộ data khác nhau
    // Cú pháp: [tên hiển thị, giá trị]
    it.each([
      ["a string", "oops"],
      ["null", null],
      ["undefined", undefined],
      ["a plain object", { message: "err" }],
      ["a number", 42]
    ])("returns the fallback for %s", (_, errorValue) => {
      expect(getErrorMessage(errorValue, FALLBACK)).toBe(FALLBACK);
    });
  });
});
