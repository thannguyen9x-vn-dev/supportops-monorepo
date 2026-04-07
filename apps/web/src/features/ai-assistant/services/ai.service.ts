import type { AiSettings, AskRequest, AskResponse } from "@supportops/types";
import { AI_ENDPOINTS } from "@supportops/types";
import { apiClient } from "@/lib/api";

export const aiService = {
  ask: (payload: AskRequest) =>
    apiClient.post<AskResponse>(AI_ENDPOINTS.ask, payload),

  getSettings: () =>
    apiClient.get<AiSettings>(AI_ENDPOINTS.settings, { cache: "no-store" }),

  updateSettings: (payload: Partial<AiSettings>) =>
    apiClient.patch<AiSettings>(AI_ENDPOINTS.settings, payload),
};
