import type { AiModelId, AiSettings, AskRequest, AskResponse, ChatMessage } from "@supportops/types";

export type { AiModelId, AiSettings, AskRequest, AskResponse, ChatMessage };

export type MessageRole = "user" | "assistant";

export interface UiChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  isError?: boolean;
}

export type ChatLoadState = "idle" | "loading" | "ready" | "error";
