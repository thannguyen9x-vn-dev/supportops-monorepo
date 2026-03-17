import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserPreferences,
  UserProfile,
  UserSession
} from "@supportops/contracts";

import { ENDPOINTS, apiClient, graphqlQuery } from "@/lib/api";
import { MeSettingsDocument, type MeSettingsQuery } from "@/graphql/generated";

export const settingsService = {
  getProfile: () => apiClient.get<UserProfile>(ENDPOINTS.USERS.ME),

  updateProfile: (data: UpdateProfileRequest) => apiClient.put<UserProfile>(ENDPOINTS.USERS.ME, data),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<{ url: string }>(ENDPOINTS.USERS.AVATAR, formData);
  },

  changePassword: (data: ChangePasswordRequest) => apiClient.put<void>(ENDPOINTS.USERS.PASSWORD, data),

  getPreferences: () => apiClient.get<UserPreferences>(ENDPOINTS.USERS.PREFERENCES),

  getPreferencesGraphql: async () => {
    const data = await graphqlQuery<MeSettingsQuery>(MeSettingsDocument);
    return { data: data.meSettings };
  },

  updatePreferences: (data: Partial<UserPreferences>) =>
    apiClient.put<UserPreferences>(ENDPOINTS.USERS.PREFERENCES, data),

  getSessions: () => apiClient.get<UserSession[]>(ENDPOINTS.USERS.SESSIONS),

  revokeSession: (sessionId: string) => apiClient.delete<void>(ENDPOINTS.USERS.SESSION(sessionId))
};
