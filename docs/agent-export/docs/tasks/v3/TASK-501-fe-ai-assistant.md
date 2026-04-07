# TASK-501 — FE: AI Assistant Chat Panel
> **Phase:** 5 — Frontend | **Prereq:** TASK-301 done | **Status:** ✅ Done

---

## Mục tiêu

Tạo `apps/web/src/features/ai-assistant/` — toàn bộ chat panel: types, service, hook, components. Panel hiển thị trong dashboard chỉ khi role là `TENANT_ADMIN`.

---

## Files cần tạo / sửa

```text
apps/web/src/features/ai-assistant/
├── types.ts
├── utils/
│   └── aiAccess.ts
├── services/
│   └── ai.service.ts
├── hooks/
│   └── useAiChat.ts
└── components/
    ├── AiChatPanel.tsx
    ├── AiChatMessage.tsx
    └── AiModelSelector.tsx

apps/web/src/i18n/messages/en.json    ← MODIFIED (thêm aiAssistant.*)
apps/web/src/i18n/messages/vi.json    ← MODIFIED (thêm aiAssistant.*)
```

---

## Spec chi tiết

### `types.ts`

```typescript
export interface UiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

export type ChatLoadState = "idle" | "loading" | "error";
```

### `utils/aiAccess.ts`

```typescript
import type { UserRole } from "@supportops/types";

export function canUseAiAssistant(role?: UserRole): boolean {
  return role === "TENANT_ADMIN";
}
```

### `services/ai.service.ts`

```typescript
import { AI_ENDPOINTS } from "@supportops/types";   // KHÔNG import từ @/lib/api
import { apiClient } from "@/lib/api";

export const aiService = {
  ask: (payload: AskRequest) =>
    apiClient.post<AskResponse>(AI_ENDPOINTS.ask, payload),

  getSettings: () =>
    apiClient.get<AiSettings>(AI_ENDPOINTS.settings, { cache: "no-store" }),

  updateSettings: (payload: Partial<AiSettings>) =>
    apiClient.patch<AiSettings>(AI_ENDPOINTS.settings, payload),
};
```

### `hooks/useAiChat.ts` — state shape

```typescript
const [messages, setMessages] = useState<UiChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [sessionModel, setSessionModel] = useState<AiModelId | undefined>(defaultModel);

// toApiHistory(): lọc bỏ isError messages, convert UiChatMessage → ChatMessage
// sendMessage(text): append user msg → call aiService.ask → append reply or error msg
// clearConversation(): setMessages([])
```

### `components/AiChatPanel.tsx` — layout

```
┌─────────────────────────────────────────┐
│ AI Assistant    [Model dropdown] [Clear] │  ← Header
├─────────────────────────────────────────┤
│                                         │
│  [chat messages scroll area]            │  ← Messages
│  [loading indicator: 3 dots pulse]      │
│                                         │
├─────────────────────────────────────────┤
│ [OutlinedInput       ] [Send button →]  │  ← Input
└─────────────────────────────────────────┘
```

- Enter để send (Shift+Enter = newline)
- Send button disabled khi `isLoading`
- Messages scroll to bottom khi có message mới

### `components/AiChatMessage.tsx`

- User message: align right, background primary.light
- Assistant message: align left, background grey.100
- Error message: color error.main, italic

### `components/AiModelSelector.tsx`

- MUI Select với `AI_MODEL_OPTIONS`
- Hiển thị hint "(Faster)", "(Most powerful)", etc.
- onChange → setSessionModel trong useAiChat

---

## i18n keys cần thêm

```json
// en.json
"aiAssistant": {
  "title": "AI Assistant",
  "placeholder": "Ask about your operations...",
  "send": "Send",
  "clear": "Clear conversation",
  "modelLabel": "Model",
  "errorUnavailable": "AI Assistant is currently unavailable. Please try again later.",
  "errorGeneric": "Something went wrong. Please try again."
}

// vi.json
"aiAssistant": {
  "title": "Trợ lý AI",
  "placeholder": "Hỏi về vận hành của bạn...",
  "send": "Gửi",
  "clear": "Xóa hội thoại",
  "modelLabel": "Model",
  "errorUnavailable": "Trợ lý AI hiện không khả dụng. Vui lòng thử lại sau.",
  "errorGeneric": "Có lỗi xảy ra. Vui lòng thử lại."
}
```

---

## Quality gate

```bash
pnpm --filter @supportops/web typecheck   # 0 errors
pnpm lint                                  # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-502**
