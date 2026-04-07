# TASK-101 — Types: AI types + endpoints
> **Phase:** 1 — Types | **Prereq:** none | **Status:** ✅ Done

---

## Mục tiêu

Định nghĩa toàn bộ TypeScript contracts cho AI feature trong `packages/types` — làm xong trước khi viết bất kỳ dòng BE/FE nào.

---

## Files cần tạo / sửa

```text
packages/types/src/types/ai.types.ts          ← NEW
packages/types/src/rbac.ts                    ← MODIFIED (thêm 2 permission codes)
packages/types/src/service-ops/endpoints.ts   ← MODIFIED (thêm AI_ENDPOINTS)
packages/types/src/endpoints.ts               ← MODIFIED (re-export AI_ENDPOINTS)
packages/types/src/index.ts                   ← MODIFIED (export ai.types)
```

---

## Spec chi tiết

### `packages/types/src/types/ai.types.ts`

```typescript
export const AI_MODEL_IDS = [
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "gpt-4o",
  "gpt-4o-mini",
] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];
export const DEFAULT_AI_MODEL: AiModelId = "claude-sonnet-4-20250514";

export const AI_MODEL_OPTIONS: { value: AiModelId; label: string; hint: string }[] = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", hint: "(Faster)" },
  { value: "claude-opus-4-20250514",   label: "Claude Opus 4",   hint: "(Most powerful)" },
  { value: "gpt-4o",                   label: "GPT-4o",          hint: "(Balanced)" },
  { value: "gpt-4o-mini",             label: "GPT-4o mini",     hint: "(Cost-effective)" },
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
```

### `packages/types/src/rbac.ts` — thêm vào RBAC_PERMISSIONS

```typescript
REPORT_READ: "report.read",
AI_ASK:      "ai.ask",
```

### `packages/types/src/service-ops/endpoints.ts` — thêm

```typescript
export const AI_ENDPOINTS = {
  ask:      "/ai/ask",
  settings: "/ai/settings",
} as const;
```

### `packages/types/src/endpoints.ts` — thêm re-export

```typescript
export { AI_ENDPOINTS } from "./service-ops/endpoints";
```

### `packages/types/src/index.ts` — thêm

```typescript
export * from "./types/ai.types";
```

---

## Quality gate

```bash
pnpm --filter @supportops/types build   # dist/ generated, 0 errors
pnpm typecheck                          # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-201**
