export const AI_MODEL_IDS = [
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "gpt-4o",
  "gpt-4o-mini",
] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];

export const DEFAULT_AI_MODEL: AiModelId = "claude-sonnet-4-20250514";

export interface AiModelOption {
  id: AiModelId;
  label: string;
  hint: string;
  provider: "anthropic" | "openai";
}

export const AI_MODEL_OPTIONS: AiModelOption[] = [
  {
    id: "claude-sonnet-4-20250514",
    label: "Claude Sonnet 4",
    hint: "Faster",
    provider: "anthropic",
  },
  {
    id: "claude-opus-4-20250514",
    label: "Claude Opus 4",
    hint: "Most powerful",
    provider: "anthropic",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    hint: "Balanced",
    provider: "openai",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    hint: "Cost-effective",
    provider: "openai",
  },
];

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AskRequest {
  message: string;
  history: ChatMessage[];
  model?: AiModelId;
}

export interface AskResponse {
  reply: string;
  model: AiModelId;
}

export interface AiSettings {
  defaultModel: AiModelId;
}

export interface UpdateAiSettingsRequest {
  defaultModel: AiModelId;
}
