import type { SettingsData } from "./settings.types";

export const MOCK_SETTINGS_DATA: SettingsData = {
  avatarUrl: null,
  joinedAt: "2025-01-01T00:00:00.000Z",
  profile: {
    firstName: "Thomas",
    lastName: "Lean",
    systemRole: "TENANT_ADMIN",
    birthday: "1786-08-12",
    phoneCountry: "US",
    phoneNumber: "3456 789",
    address: "California",
    country: "US",
    email: "name@example.com",
    zipCode: "123456",
    city: "San Francisco",
    department: "Marketing",
  },
  notifications: [
    { key: "assignmentAlerts", group: "alerts", enabled: false },
    { key: "statusUpdateAlerts", group: "alerts", enabled: true },
    { key: "slaRiskAlerts", group: "alerts", enabled: true },
    { key: "escalationAlerts", group: "alerts", enabled: false },
    { key: "resolutionReminders", group: "email", enabled: true },
    { key: "requestUpdateDigest", group: "email", enabled: true },
    { key: "commentNotifications", group: "email", enabled: true },
    { key: "mentionNotifications", group: "email", enabled: false },
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
