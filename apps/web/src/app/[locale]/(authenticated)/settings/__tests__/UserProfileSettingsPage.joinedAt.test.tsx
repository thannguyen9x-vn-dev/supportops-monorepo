import { render, screen, waitFor } from "@testing-library/react";

import SettingsPage from "../UserProfileSettingsPage";

jest.mock("@/components/tabs/EntityTabs", () => ({
  EntityTabs: () => null,
}));

jest.mock("@/components/tabs/useEntityTabs", () => ({
  useEntityTabs: () => ({}),
}));

jest.mock("@/features/common/toast/useToast", () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock("@/features/settings/services/settings.service", () => ({
  settingsService: {
    getSessions: jest.fn().mockResolvedValue({ data: [] }),
    revokeSession: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "u-1",
      email: "admin@supportops.dev",
      firstName: "Admin",
      lastName: "User",
      avatarUrl: null,
      role: "TENANT_ADMIN",
      tenantId: "t-1",
      tenantName: "SupportOps",
      joinedAt: null,
    },
    updateUser: jest.fn(),
  }),
}));

jest.mock("../hooks/useSettingsLoader", () => ({
  useSettingsLoader: () => ({
    loadState: "ready",
    data: {
      avatarUrl: null,
      joinedAt: "2026-03-16T14:43:39.400Z",
      profile: {
        firstName: "Admin",
        lastName: "User",
        systemRole: "TENANT_ADMIN",
        birthday: "",
        phoneCountry: "US",
        phoneNumber: "",
        address: "",
        country: "US",
        email: "admin@supportops.dev",
        zipCode: "",
        city: "",
        department: "Operations",
      },
      notifications: [],
    },
    reload: jest.fn(),
    setData: jest.fn(),
  }),
}));

jest.mock("../hooks/useNotificationPreferences", () => ({
  useNotificationPreferences: () => ({
    preferences: [],
    toggle: jest.fn(),
    setPreferences: jest.fn(),
  }),
}));

jest.mock("../hooks/useProfileForm", () => ({
  useProfileForm: () => ({
    control: {},
    handleSubmit: (fn: unknown) => fn,
    isDirty: false,
    onSubmit: jest.fn(),
    submitState: "idle",
    reset: jest.fn(),
  }),
}));

jest.mock("../hooks/usePasswordForm", () => ({
  usePasswordForm: () => ({
    control: {},
    handleSubmit: (fn: unknown) => fn,
    onSubmit: jest.fn(),
    submitState: "idle",
  }),
}));

jest.mock("../components/ProfileCard", () => ({
  ProfileCard: () => <div data-testid="profile-card" />,
}));

jest.mock("../components/ProfileForm", () => ({
  ProfileForm: () => <div data-testid="profile-form" />,
}));

jest.mock("../components/PasswordForm", () => ({
  PasswordForm: () => <div data-testid="password-form" />,
}));

describe("UserProfileSettingsPage joinedAt smoke", () => {
  it("shows joined date value in general tab from settings data", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.queryByText("organizationAccess.fields.joinedDate")).not.toBeNull();
      expect(screen.queryByText(/2026/)).not.toBeNull();
    });
  });
});
