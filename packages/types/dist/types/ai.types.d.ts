export declare const AI_MODEL_IDS: readonly ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "gpt-4o", "gpt-4o-mini"];
export type AiModelId = (typeof AI_MODEL_IDS)[number];
export declare const DEFAULT_AI_MODEL: AiModelId;
export interface AiModelOption {
    id: AiModelId;
    label: string;
    hint: string;
    provider: "anthropic" | "openai";
}
export declare const AI_MODEL_OPTIONS: AiModelOption[];
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
//# sourceMappingURL=ai.types.d.ts.map