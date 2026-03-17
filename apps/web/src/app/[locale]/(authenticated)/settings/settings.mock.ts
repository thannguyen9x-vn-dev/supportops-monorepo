import type { SettingsData } from "./settings.types";

export const MOCK_SETTINGS_DATA: SettingsData = {
  avatarUrl: null,
  profile: {
    firstName: "Thomas",
    lastName: "Lean",
    birthday: "1786-08-12",
    phoneCountry: "US",
    phoneNumber: "3456 789",
    address: "California",
    country: "US",
    email: "name@example.com",
    organization: "Themesberg",
    zipCode: "123456",
    city: "San Francisco",
    department: "Marketing",
  },
  notifications: [
    { key: "companyNews", group: "alerts", enabled: false },
    { key: "accountActivity", group: "alerts", enabled: true },
    { key: "meetupsNearYou", group: "alerts", enabled: true },
    { key: "newMessages", group: "alerts", enabled: false },
    { key: "ratingReminders", group: "email", enabled: true },
    { key: "itemUpdateNotifications", group: "email", enabled: true },
    { key: "itemCommentNotifications", group: "email", enabled: true },
    { key: "buyerReviewNotifications", group: "email", enabled: false },
  ],
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function mockFetchSettings(): Promise<SettingsData | null> {
  await wait(450);
  return MOCK_SETTINGS_DATA;
}

export async function mockSave() {
  await wait(500);
}
