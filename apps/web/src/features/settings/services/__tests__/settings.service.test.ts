jest.mock("@/lib/api", () => ({
  ENDPOINTS: {
    USERS: {
      ME: "/users/me",
      AVATAR: "/users/me/avatar",
      PASSWORD: "/users/me/password",
      PREFERENCES: "/users/me/preferences",
      SESSIONS: "/users/me/sessions",
      SESSION: (id: string) => `/users/me/sessions/${id}`,
    },
  },
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    upload: jest.fn(),
    delete: jest.fn(),
  },
  graphqlQuery: jest.fn(),
}));

import { apiClient, graphqlQuery } from "@/lib/api";

import { settingsService } from "../settings.service";

describe("settingsService", () => {
  const mockGet = apiClient.get as jest.Mock;
  const mockPut = apiClient.put as jest.Mock;
  const mockUpload = apiClient.upload as jest.Mock;
  const mockDelete = apiClient.delete as jest.Mock;
  const mockGraphqlQuery = graphqlQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: { id: "user-1", language: "en" } });
    mockPut.mockResolvedValue({ data: { id: "user-1", firstName: "Ops", language: "vi" } });
    mockUpload.mockResolvedValue({ data: { url: "https://cdn.example.com/avatar.png" } });
    mockDelete.mockResolvedValue({ data: null });
    mockGraphqlQuery.mockResolvedValue({ meSettings: { language: "vi" } });
  });

  it("gets and updates profile", async () => {
    const profile = await settingsService.getProfile();
    const updated = await settingsService.updateProfile({ firstName: "Ops" } as never);

    expect(mockGet).toHaveBeenCalledWith("/users/me");
    expect(mockPut).toHaveBeenCalledWith("/users/me", { firstName: "Ops" });
    expect(profile.data.id).toBe("user-1");
    expect(updated.data.firstName).toBe("Ops");
  });

  it("uploads avatar and changes password", async () => {
    const response = await settingsService.uploadAvatar(new File(["x"], "avatar.png", { type: "image/png" }));
    await settingsService.changePassword({ currentPassword: "OldPass1!", newPassword: "NewPass1!" } as never);

    expect(mockUpload).toHaveBeenCalled();
    expect(mockPut).toHaveBeenCalledWith("/users/me/password", {
      currentPassword: "OldPass1!",
      newPassword: "NewPass1!",
    });
    expect(response.data.url).toContain("avatar.png");
  });

  it("handles preferences and graphql preferences", async () => {
    const preferences = await settingsService.getPreferences();
    const updated = await settingsService.updatePreferences({ language: "vi" });
    const gql = await settingsService.getPreferencesGraphql();

    expect(mockGet).toHaveBeenCalledWith("/users/me/preferences");
    expect(mockPut).toHaveBeenCalledWith("/users/me/preferences", { language: "vi" });
    expect(preferences.data.language).toBe("en");
    expect(updated.data.language).toBe("vi");
    expect(gql.data.language).toBe("vi");
  });

  it("lists and revokes sessions", async () => {
    mockGet.mockResolvedValueOnce({ data: [{ id: "session-1" }] });

    const sessions = await settingsService.getSessions();
    await settingsService.revokeSession("session-1");

    expect(mockGet).toHaveBeenCalledWith("/users/me/sessions");
    expect(mockDelete).toHaveBeenCalledWith("/users/me/sessions/session-1");
    expect(sessions.data).toHaveLength(1);
  });
});
