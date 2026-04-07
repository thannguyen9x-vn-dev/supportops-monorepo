export const AI_MODEL_IDS = [
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "gpt-4o",
    "gpt-4o-mini",
];
export const DEFAULT_AI_MODEL = "claude-sonnet-4-20250514";
export const AI_MODEL_OPTIONS = [
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
