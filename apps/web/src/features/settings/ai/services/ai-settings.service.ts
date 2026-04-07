import type { AiSettings, UpdateAiSettingsRequest } from "@supportops/types";
import { AI_ENDPOINTS } from "@supportops/types";
import { apiClient } from "@/lib/api";

export const aiSettingsService = {
  get: () =>
    apiClient.get<AiSettings>(AI_ENDPOINTS.settings, { cache: "no-store" }),

  update: (payload: UpdateAiSettingsRequest) =>
    apiClient.patch<AiSettings>(AI_ENDPOINTS.settings, payload),
};
