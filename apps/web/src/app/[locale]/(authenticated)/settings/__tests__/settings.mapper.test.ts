/**
 * TEST LOẠI 2: Unit test cho mapper functions (pure functions)
 *
 * Mapper = hàm chuyển đổi data giữa 2 "layers" khác nhau:
 *   API response → form values (toProfileFormValues)
 *   form values  → API request (toUpdateProfileRequest)
 *   API response → UI state  (toNotificationPreferences)
 *   UI state     → API body  (toUserPreferences)
 *
 * Vì các hàm này là pure functions, test pattern giống getErrorMessage:
 * không cần mock, không cần React.
 *
 * Chiến lược chọn test case:
 *   1. Happy path      → input đầy đủ, hợp lệ
 *   2. Null / optional → các trường có thể null/undefined
 *   3. Edge case       → format đặc biệt (birthday, phone number)
 *   4. Derived logic   → kết quả tính toán phức tạp (phone assembly)
 */

import type { UserPreferences, UserProfile } from "@supportops/types";

import {
  toNotificationPreferences,
  toProfileFormValues,
  toUpdateProfileRequest,
  toUserPreferences
} from "../settings.mapper";
import type { NotificationPreference } from "../settings.types";

// ─── Test helpers ────────────────────────────────────────────────────────────

// Builder function: tạo UserProfile với giá trị mặc định, cho phép override
// Lợi ích: mỗi test chỉ khai báo trường nó quan tâm, còn lại nhận giá trị mặc định
function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    email: "user@example.com",
    firstName: "Thomas",
    lastName: "Lean",
    phone: "+1 2025551234",
    avatarUrl: null,
    birthday: null,
    address: null,
    city: null,
    zipCode: null,
    country: "US",
    organization: null,
    department: null,
    timezone: "UTC",
    locale: "en",
    role: "TENANT_ADMIN",
    joinedAt: null,
    ...overrides
  };
}

function makePreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    companyNews: false,
    accountActivity: false,
    meetupsNearYou: false,
    newMessages: false,
    ratingReminders: false,
    itemUpdateNotif: false,
    itemCommentNotif: false,
    buyerReviewNotif: false,
    ...overrides
  };
}

// ─── toProfileFormValues ─────────────────────────────────────────────────────

describe("toProfileFormValues", () => {
  it("maps all basic text fields from UserProfile", () => {
    const profile = makeProfile({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      address: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "US",
      department: "Engineering"
    });

    const result = toProfileFormValues(profile);

    expect(result.firstName).toBe("Alice");
    expect(result.lastName).toBe("Smith");
    expect(result.email).toBe("alice@example.com");
    expect(result.address).toBe("123 Main St");
    expect(result.city).toBe("New York");
    expect(result.zipCode).toBe("10001");
    expect(result.country).toBe("US");
    expect(result.department).toBe("Engineering");
  });

  it("converts null optional fields to empty string", () => {
    // Null từ API → chuỗi rỗng trong form để tránh "uncontrolled input" lỗi
    const result = toProfileFormValues(
      makeProfile({ address: null, city: null, zipCode: null, department: null })
    );

    expect(result.address).toBe("");
    expect(result.city).toBe("");
    expect(result.zipCode).toBe("");
    expect(result.department).toBe("");
  });

  it("defaults country to US when country is null", () => {
    const result = toProfileFormValues(makeProfile({ country: null }));

    expect(result.country).toBe("US");
  });

  // ── Birthday normalization ─────────────────────────────────────────────────
  // API có thể trả về 2 format khác nhau → normalize về YYYY-MM-DD

  describe("birthday normalization", () => {
    it("passes through an already-normalized YYYY-MM-DD date unchanged", () => {
      const result = toProfileFormValues(makeProfile({ birthday: "1990-05-15" }));

      expect(result.birthday).toBe("1990-05-15");
    });

    it("converts DD/MM/YYYY to YYYY-MM-DD", () => {
      // Format cũ từ API: "15/05/1990" → "1990-05-15"
      const result = toProfileFormValues(makeProfile({ birthday: "15/05/1990" }));

      expect(result.birthday).toBe("1990-05-15");
    });

    it("returns empty string when birthday is null", () => {
      const result = toProfileFormValues(makeProfile({ birthday: null }));

      expect(result.birthday).toBe("");
    });
  });

  // ── Phone splitting ────────────────────────────────────────────────────────
  // "+1 2025551234" → { phoneCountry: "US", phoneNumber: "2025551234" }

  describe("phone splitting", () => {
    it("parses an E.164 phone number into country code + national number", () => {
      const result = toProfileFormValues(makeProfile({ phone: "+1 2025551234" }));

      expect(result.phoneCountry).toBe("US");
      expect(result.phoneNumber).toBe("2025551234");
    });

    it("defaults to empty phoneNumber when phone is null", () => {
      const result = toProfileFormValues(makeProfile({ phone: null }));

      expect(result.phoneNumber).toBe("");
    });

    it("defaults to empty phoneNumber when phone is empty string", () => {
      const result = toProfileFormValues(makeProfile({ phone: "" }));

      expect(result.phoneNumber).toBe("");
    });
  });
});

// ─── toUpdateProfileRequest ──────────────────────────────────────────────────

describe("toUpdateProfileRequest", () => {
  // Giá trị form mẫu dùng chung trong các test
  const baseFormValues = {
    firstName: "Alice",
    lastName: "Smith",
    systemRole: "TENANT_ADMIN",
    birthday: "1990-05-15",
    phoneCountry: "US" as const,
    phoneNumber: "2025551234",
    address: "123 Main St",
    country: "US" as const,
    email: "alice@example.com",
    zipCode: "10001",
    city: "New York",
    department: "Engineering"
  };

  it("assembles the full phone number as +{callingCode} {nationalNumber}", () => {
    // phoneCountry "US" → calling code "1"
    const result = toUpdateProfileRequest(baseFormValues);

    expect(result.phone).toBe("+1 2025551234");
  });

  it("returns empty phone string when nationalNumber is empty", () => {
    const result = toUpdateProfileRequest({ ...baseFormValues, phoneNumber: "" });

    expect(result.phone).toBe("");
  });

  it("maps all other profile fields to the request shape", () => {
    const result = toUpdateProfileRequest(baseFormValues);

    // toMatchObject: kiểm tra object có chứa các key này với giá trị tương ứng
    // (không cần match toàn bộ object)
    expect(result).toMatchObject({
      firstName: "Alice",
      lastName: "Smith",
      birthday: "1990-05-15",
      city: "New York",
      department: "Engineering"
    });
  });

  it("omits optional fields when they are empty", () => {
    const result = toUpdateProfileRequest({
      ...baseFormValues,
      birthday: "",
      city: "",
      department: "",
      phoneNumber: ""
    });

    expect(result).toMatchObject({
      firstName: "Alice",
      lastName: "Smith"
    });
    expect(result).not.toHaveProperty("birthday");
    expect(result).not.toHaveProperty("city");
    expect(result).not.toHaveProperty("department");
    expect(result).not.toHaveProperty("phone");
  });

  it("does not include email in the update request", () => {
    // Email không thể thay đổi qua form profile → không nên gửi lên
    const result = toUpdateProfileRequest(baseFormValues);

    expect(result).not.toHaveProperty("email");
  });

  it("does not include department when includeDepartment is false", () => {
    const result = toUpdateProfileRequest(baseFormValues, { includeDepartment: false });
    expect(result).not.toHaveProperty("department");
  });

  it("does not include organization in the update request", () => {
    const result = toUpdateProfileRequest(baseFormValues);
    expect(result).not.toHaveProperty("organization");
  });
});

// ─── toNotificationPreferences ───────────────────────────────────────────────

describe("toNotificationPreferences", () => {
  it("returns exactly 8 notification items", () => {
    const result = toNotificationPreferences(makePreferences());

    expect(result).toHaveLength(8);
  });

  it("maps alert-group items with group = 'alerts'", () => {
    const result = toNotificationPreferences(makePreferences({ companyNews: true }));

    expect(result.find((p) => p.key === "companyNews")).toEqual({
      key: "companyNews",
      group: "alerts",
      enabled: true
    });
    // Kiểm tra tất cả alerts items đều có group đúng
    const alertItems = result.filter((p) => p.group === "alerts");
    expect(alertItems.map((p) => p.key)).toEqual([
      "companyNews",
      "accountActivity",
      "meetupsNearYou",
      "newMessages"
    ]);
  });

  it("maps email-group items with group = 'email'", () => {
    const emailItems = toNotificationPreferences(makePreferences()).filter(
      (p) => p.group === "email"
    );

    expect(emailItems.map((p) => p.key)).toEqual([
      "ratingReminders",
      "itemUpdateNotifications",
      "itemCommentNotifications",
      "buyerReviewNotifications"
    ]);
  });

  it("renames API field 'itemUpdateNotif' to UI key 'itemUpdateNotifications'", () => {
    // Quan trọng: API dùng tên ngắn, UI dùng tên dài hơn
    // Đây là logic rename cần phải test rõ ràng
    const result = toNotificationPreferences(makePreferences({ itemUpdateNotif: true }));
    const item = result.find((p) => p.key === "itemUpdateNotifications");

    expect(item).toBeDefined();
    expect(item?.enabled).toBe(true);
    // Đảm bảo không có key với tên cũ
    expect(result.find((p) => p.key === "itemUpdateNotif" as string)).toBeUndefined();
  });

  it("preserves the enabled boolean values from UserPreferences", () => {
    const prefs = makePreferences({
      companyNews: true,
      accountActivity: false,
      ratingReminders: true,
      buyerReviewNotif: false
    });

    const result = toNotificationPreferences(prefs);

    expect(result.find((p) => p.key === "companyNews")?.enabled).toBe(true);
    expect(result.find((p) => p.key === "accountActivity")?.enabled).toBe(false);
    expect(result.find((p) => p.key === "ratingReminders")?.enabled).toBe(true);
    expect(result.find((p) => p.key === "buyerReviewNotifications")?.enabled).toBe(false);
  });
});

// ─── toUserPreferences ───────────────────────────────────────────────────────

describe("toUserPreferences", () => {
  // Danh sách đủ 8 items
  const allPreferences: NotificationPreference[] = [
    { key: "companyNews", group: "alerts", enabled: true },
    { key: "accountActivity", group: "alerts", enabled: false },
    { key: "meetupsNearYou", group: "alerts", enabled: true },
    { key: "newMessages", group: "alerts", enabled: false },
    { key: "ratingReminders", group: "email", enabled: true },
    { key: "itemUpdateNotifications", group: "email", enabled: true },
    { key: "itemCommentNotifications", group: "email", enabled: false },
    { key: "buyerReviewNotifications", group: "email", enabled: true }
  ];

  it("maps NotificationPreference[] back to the UserPreferences API shape", () => {
    const result = toUserPreferences(allPreferences);

    // toEqual: so sánh deep equality (kiểm tra toàn bộ object)
    expect(result).toEqual({
      companyNews: true,
      accountActivity: false,
      meetupsNearYou: true,
      newMessages: false,
      ratingReminders: true,
      itemUpdateNotif: true, // UI "itemUpdateNotifications" → API "itemUpdateNotif"
      itemCommentNotif: false, // UI "itemCommentNotifications" → API "itemCommentNotif"
      buyerReviewNotif: true // UI "buyerReviewNotifications" → API "buyerReviewNotif"
    });
  });

  it("defaults missing keys to false", () => {
    // Nếu preferences rỗng → tất cả về false (tránh undefined)
    const result = toUserPreferences([]);

    expect(result.companyNews).toBe(false);
    expect(result.itemUpdateNotif).toBe(false);
    expect(result.buyerReviewNotif).toBe(false);
  });

  it("is the inverse of toNotificationPreferences (round-trip)", () => {
    // Tính chất quan trọng: convert đi rồi convert lại phải ra data gốc
    const original = makePreferences({
      companyNews: true,
      ratingReminders: true,
      itemUpdateNotif: true
    });

    const roundTripped = toUserPreferences(toNotificationPreferences(original));

    expect(roundTripped).toEqual(original);
  });
});
