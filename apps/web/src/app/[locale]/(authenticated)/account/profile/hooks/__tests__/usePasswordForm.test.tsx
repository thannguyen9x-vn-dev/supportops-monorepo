/**
 * TEST LOẠI 4: Hook test với form logic và async submission
 *
 * Hook này kết hợp 2 thứ:
 *   1. react-hook-form: quản lý form state (validation, errors, reset)
 *   2. settingsService.changePassword: async API call
 *
 * Điều cần test:
 *   - submitState transitions: idle → saving → success / error
 *   - Validation: password mismatch phải dừng lại, không gọi API
 *   - Happy path: API thành công → state "success" + toast + form reset
 *   - Error path: API thất bại → state "error" + toast lỗi
 *
 * Pattern test:
 *   Thay vì render form thật (HTML) và interact với input,
 *   ta gọi thẳng `result.current.onSubmit(values)` để bypass form rendering.
 *   → Nhanh hơn, isolated hơn, không bị ảnh hưởng bởi UI.
 *
 * act(async () => { await ... }) bắt buộc với async functions
 * vì onSubmit là async (có await bên trong).
 */

import { act, renderHook } from "@testing-library/react";

import { usePasswordForm } from "../usePasswordForm";
import type { PasswordFormValues } from "../../profile.types";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/features/common/toast/useToast", () => ({
  useToast: jest.fn()
}));

jest.mock("@/features/settings/services/settings.service", () => ({
  settingsService: {
    changePassword: jest.fn()
  }
}));

import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";

const mockUseToast = useToast as jest.Mock;
const mockChangePassword = settingsService.changePassword as jest.Mock;

// ─── Test data ────────────────────────────────────────────────────────────────

// Passwords khớp nhau → hợp lệ
const validValues: PasswordFormValues = {
  currentPassword: "OldPass123!",
  newPassword: "NewPass123!",
  confirmNewPassword: "NewPass123!"
};

// Passwords không khớp → sẽ bị validate và dừng lại
const mismatchedValues: PasswordFormValues = {
  currentPassword: "OldPass123!",
  newPassword: "NewPass123!",
  confirmNewPassword: "DifferentPass!99"
};

const sameAsCurrentValues: PasswordFormValues = {
  currentPassword: "OldPass123!",
  newPassword: "OldPass123!",
  confirmNewPassword: "OldPass123!"
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("usePasswordForm", () => {
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseToast.mockReturnValue({
      success: mockToastSuccess,
      error: mockToastError
    });

    // Mặc định: API đổi mật khẩu thành công
    mockChangePassword.mockResolvedValue(undefined);
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it("starts with submitState = 'idle'", () => {
    const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

    expect(result.current.submitState).toBe("idle");
  });

  // ── Password mismatch ──────────────────────────────────────────────────────

  describe("when passwords do not match", () => {
    it("does not call the API", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(mismatchedValues);
      });

      // API không được gọi vì validation thất bại
      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("keeps submitState as 'idle'", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(mismatchedValues);
      });

      // State không được thay đổi vì không submit
      expect(result.current.submitState).toBe("idle");
    });

    it("does not show any toast", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(mismatchedValues);
      });

      expect(mockToastSuccess).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  describe("when new password equals current password", () => {
    it("does not call the API", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(sameAsCurrentValues);
      });

      expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("keeps submitState as 'idle'", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(sameAsCurrentValues);
      });

      expect(result.current.submitState).toBe("idle");
    });
  });

  // ── Successful submission ──────────────────────────────────────────────────

  describe("when passwords match and the API call succeeds", () => {
    it("calls changePassword with the correct payload", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      // Kiểm tra payload được gửi lên đúng format ChangePasswordRequest
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: "OldPass123!",
        newPassword: "NewPass123!",
        confirmPassword: "NewPass123!" // note: key là confirmPassword (không phải confirmNewPassword)
      });
    });

    it("sets submitState to 'success'", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(result.current.submitState).toBe("success");
    });

    it("shows a success toast", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      // t("state.saved") với mock translate sẽ trả về "state.saved"
      expect(mockToastSuccess).toHaveBeenCalledWith("state.saved");
    });

    it("does not show an error toast", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  // ── Failed API call ────────────────────────────────────────────────────────

  describe("when the API call fails", () => {
    beforeEach(() => {
      // Override default mock: lần này API sẽ thất bại
      mockChangePassword.mockRejectedValue(new Error("Incorrect current password"));
    });

    it("sets submitState to 'error'", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(result.current.submitState).toBe("error");
    });

    it("shows an error toast with the error message", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      // getErrorMessage(Error("...")) sẽ trả về error.message
      expect(mockToastError).toHaveBeenCalledWith("Incorrect current password");
    });

    it("does not show a success toast", async () => {
      const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

      await act(async () => {
        await result.current.onSubmit(validValues);
      });

      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  // ── State transitions ──────────────────────────────────────────────────────

  it("transitions through idle → saving → success on a successful submit", async () => {
    // Ghi lại thứ tự các state để verify đúng transition
    const states: string[] = [];

    // API sẽ giữ pending cho đến khi ta resolve
    let resolveChangePassword!: () => void;
    mockChangePassword.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveChangePassword = resolve;
        })
    );

    const { result } = renderHook(() => usePasswordForm({ t: (k) => k }));

    // Ban đầu: idle
    states.push(result.current.submitState);

    // Bắt đầu submit (không await, để bắt được state "saving")
    let submitPromise!: Promise<void>;
    act(() => {
      submitPromise = result.current.onSubmit(validValues);
    });

    // Trong khi API đang pending: saving
    states.push(result.current.submitState);

    // Hoàn thành API call
    await act(async () => {
      resolveChangePassword();
      await submitPromise;
    });

    // Sau khi xong: success
    states.push(result.current.submitState);

    expect(states).toEqual(["idle", "saving", "success"]);
  });
});
