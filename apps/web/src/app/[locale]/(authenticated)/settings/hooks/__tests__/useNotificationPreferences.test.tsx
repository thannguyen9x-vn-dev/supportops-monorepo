/**
 * TEST LOẠI 3: Hook test với side effects và optimistic update
 *
 * Khái niệm "optimistic update":
 *   → Cập nhật UI ngay lập tức (không chờ API), rồi mới gọi API.
 *   → Nếu API thất bại: rollback (hoàn tác) về state cũ + hiện toast lỗi.
 *   → Ưu điểm: UI phản hồi nhanh, UX tốt hơn.
 *
 * Để test hook, dùng `renderHook` từ @testing-library/react:
 *   → Nó tạo ra một component giả để chạy hook.
 *   → Ta có thể gọi các functions trong hook và kiểm tra state.
 *
 * Các khái niệm quan trọng:
 *   jest.mock()  → giả lập module bên ngoài để test không gọi API thật
 *   act()        → bao quanh code thay đổi React state
 *   waitFor()    → đợi async effects (từ .catch()) hoàn thành rồi mới check
 *   beforeEach() → chạy trước mỗi test để reset về trạng thái sạch
 */

import { act, renderHook, waitFor } from "@testing-library/react";

// Import hook cần test
import { useNotificationPreferences } from "../useNotificationPreferences";
import type { NotificationPreference } from "../../settings.types";

// ─── Mock các dependency bên ngoài ───────────────────────────────────────────
//
// Tại sao phải mock?
//   - useToast phụ thuộc vào React Context (ToastProvider) → không có trong test
//   - settingsService gọi fetch() thật đến API → không muốn trong unit test
//
// jest.mock() hoạt động bằng cách thay thế module bằng implementation giả.
// Factory function (arrow function) chỉ chạy khi module được import lần đầu.

jest.mock("@/features/common/toast/useToast", () => ({
  useToast: jest.fn()
}));

jest.mock("@/features/settings/services/settings.service", () => ({
  settingsService: {
    updatePreferences: jest.fn()
  }
}));

// Import các mocked module để có thể configure chúng trong beforeEach
import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";

// Cast sang jest.Mock để TypeScript không báo lỗi khi gọi .mockReturnValue()
const mockUseToast = useToast as jest.Mock;
const mockUpdatePreferences = settingsService.updatePreferences as jest.Mock;

// ─── Test data helpers ────────────────────────────────────────────────────────

// Danh sách 8 notification mẫu, tương ứng với data thực từ API
function makePreferences(): NotificationPreference[] {
  return [
    { key: "companyNews", group: "alerts", enabled: false },
    { key: "accountActivity", group: "alerts", enabled: true },
    { key: "meetupsNearYou", group: "alerts", enabled: false },
    { key: "newMessages", group: "alerts", enabled: false },
    { key: "ratingReminders", group: "email", enabled: true },
    { key: "itemUpdateNotifications", group: "email", enabled: true },
    { key: "itemCommentNotifications", group: "email", enabled: false },
    { key: "buyerReviewNotifications", group: "email", enabled: false }
  ];
}

// Hàm translate giả: trả về chính key được truyền vào
// (jest.setup.ts cũng làm vậy cho next-intl)
const t = (key: string) => key;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useNotificationPreferences", () => {
  // Mock functions cho toast.success và toast.error
  // Khai báo ở đây để có thể dùng trong beforeEach và kiểm tra trong tests
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();

  beforeEach(() => {
    // Xóa lịch sử các lần gọi (mock.calls) trước mỗi test
    // → Đảm bảo test này không bị ảnh hưởng bởi test trước
    jest.clearAllMocks();

    // Thiết lập useToast trả về object mock
    mockUseToast.mockReturnValue({
      success: mockToastSuccess,
      error: mockToastError
    });

    // Mặc định: API thành công (resolved)
    // Các test cần API lỗi sẽ override trong chính test đó
    mockUpdatePreferences.mockResolvedValue(undefined);
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it("starts with an empty preferences list", () => {
    const { result } = renderHook(() => useNotificationPreferences({ t }));

    expect(result.current.preferences).toEqual([]);
  });

  // ── setPreferences ─────────────────────────────────────────────────────────

  it("updates the list when setPreferences is called directly", () => {
    const { result } = renderHook(() => useNotificationPreferences({ t }));
    const initialPrefs = makePreferences();

    // act() bắt buộc phải dùng khi gọi code làm thay đổi React state
    act(() => {
      result.current.setPreferences(initialPrefs);
    });

    expect(result.current.preferences).toEqual(initialPrefs);
  });

  // ── toggle: optimistic update ──────────────────────────────────────────────

  describe("toggle", () => {
    it("immediately flips the enabled state (optimistic update)", () => {
      const { result } = renderHook(() => useNotificationPreferences({ t }));

      act(() => {
        result.current.setPreferences(makePreferences());
      });

      // companyNews ban đầu là false → toggle lên true
      act(() => {
        result.current.toggle("companyNews", true);
      });

      const updated = result.current.preferences.find((p) => p.key === "companyNews");
      // State thay đổi NGAY LẬP TỨC, không chờ API
      expect(updated?.enabled).toBe(true);
    });

    it("does not change unrelated items when one item is toggled", () => {
      const { result } = renderHook(() => useNotificationPreferences({ t }));

      act(() => {
        result.current.setPreferences(makePreferences());
      });

      act(() => {
        result.current.toggle("companyNews", true);
      });

      // accountActivity ban đầu là true → vẫn phải là true sau khi toggle companyNews
      const unchanged = result.current.preferences.find((p) => p.key === "accountActivity");
      expect(unchanged?.enabled).toBe(true);
    });

    it("calls settingsService.updatePreferences with the updated state", () => {
      const { result } = renderHook(() => useNotificationPreferences({ t }));

      act(() => {
        result.current.setPreferences(makePreferences());
      });

      act(() => {
        result.current.toggle("companyNews", true);
      });

      // API phải được gọi đúng 1 lần
      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
      // Payload gửi lên phải reflect state mới (companyNews: true)
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ companyNews: true })
      );
    });

    // ── Rollback khi API thất bại ──────────────────────────────────────────

    it("rolls back to the previous state when the API call fails", async () => {
      // Chuẩn bị: API sẽ trả lỗi
      mockUpdatePreferences.mockRejectedValue(new Error("Server error"));

      const { result } = renderHook(() => useNotificationPreferences({ t }));

      act(() => {
        result.current.setPreferences(makePreferences());
      });

      // Bước 1: toggle → optimistic update (companyNews = true ngay lập tức)
      act(() => {
        result.current.toggle("companyNews", true);
      });

      // Bước 2: đợi async .catch() chạy xong và rollback state
      // waitFor() sẽ retry assertion cho đến khi pass hoặc timeout (1s mặc định)
      await waitFor(() => {
        const item = result.current.preferences.find((p) => p.key === "companyNews");
        // Sau rollback, phải trở về giá trị cũ (false)
        expect(item?.enabled).toBe(false);
      });
    });

    it("shows an error toast when the API call fails", async () => {
      mockUpdatePreferences.mockRejectedValue(new Error("Server error"));

      const { result } = renderHook(() => useNotificationPreferences({ t }));

      act(() => {
        result.current.setPreferences(makePreferences());
      });

      act(() => {
        result.current.toggle("companyNews", true);
      });

      // Đợi async error handling hoàn tất
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledTimes(1);
      });
    });

    it("shows a success toast when the API call succeeds", async () => {
      // API thành công (đã setup trong beforeEach)
      const { result } = renderHook(() => useNotificationPreferences({ t }));

      act(() => {
        result.current.setPreferences(makePreferences());
      });

      await act(async () => {
        result.current.toggle("companyNews", true);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith("state.saved");
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });
});
