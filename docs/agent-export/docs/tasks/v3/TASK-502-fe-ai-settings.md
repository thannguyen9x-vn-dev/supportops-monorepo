# TASK-502 — FE: AI Settings Page
> **Phase:** 5 — Frontend | **Prereq:** TASK-501 done | **Status:** ✅ Done

---

## Mục tiêu

Tạo Settings page cho AI model preference. TENANT_ADMIN chọn model mặc định → lưu vào DB qua `PATCH /api/v1/ai/settings` → áp dụng cho mọi chat session tiếp theo.

---

## Files cần tạo / sửa

```text
apps/web/src/features/settings/ai/
├── services/
│   └── ai-settings.service.ts
├── hooks/
│   └── useAiSettings.ts
└── components/
    └── AiSettingsView.tsx

apps/web/src/app/[locale]/(authenticated)/settings/ai/
└── page.tsx                                                ← NEW

apps/web/src/i18n/messages/en.json    ← MODIFIED (thêm settings.ai.*)
apps/web/src/i18n/messages/vi.json    ← MODIFIED (thêm settings.ai.*)
```

---

## Spec chi tiết

### `services/ai-settings.service.ts`

```typescript
import { AI_ENDPOINTS } from "@supportops/types";   // KHÔNG import từ @/lib/api
import { apiClient } from "@/lib/api";
import type { AiSettings, UpdateAiSettingsRequest } from "@supportops/types";

export const aiSettingsService = {
  get: () =>
    apiClient.get<AiSettings>(AI_ENDPOINTS.settings, { cache: "no-store" }),

  update: (payload: UpdateAiSettingsRequest) =>
    apiClient.patch<AiSettings>(AI_ENDPOINTS.settings, payload),
};
```

### `hooks/useAiSettings.ts` — state shape

```typescript
const [settings, setSettings] = useState<AiSettings | null>(null);
const [selectedModel, setSelectedModel] = useState<AiModelId>(DEFAULT_AI_MODEL);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

// load(): aiSettingsService.get() → setSettings + setSelectedModel
// save(): aiSettingsService.update({ defaultModel: selectedModel }) → success/error feedback
```

### `components/AiSettingsView.tsx`

```
┌─────────────────────────────────────┐
│ SectionCard: "AI Assistant Settings" │
│                                     │
│ Default Model                       │
│ [Select: model options with hints]  │
│                                     │
│                    [Save Changes]   │
│                                     │
│ [success/error snackbar]            │
└─────────────────────────────────────┘
```

- Load settings on mount (isLoading spinner)
- Select shows `AI_MODEL_OPTIONS` với label + hint
- Save button: disabled khi `isSaving` hoặc `selectedModel === settings?.defaultModel`
- Success: green feedback; Error: red feedback

### `page.tsx`

```typescript
export default function AiSettingsPage() {
  return <AiSettingsView />;
}
```

---

## i18n keys cần thêm

```json
// en.json
"settings": {
  "ai": {
    "title": "AI Assistant",
    "defaultModel": "Default Model",
    "defaultModelHelp": "This model will be used by default in your AI chat sessions.",
    "save": "Save Changes",
    "saveSuccess": "AI settings saved successfully.",
    "saveError": "Failed to save AI settings."
  }
}

// vi.json
"settings": {
  "ai": {
    "title": "Trợ lý AI",
    "defaultModel": "Model mặc định",
    "defaultModelHelp": "Model này sẽ được dùng mặc định trong các phiên chat AI của bạn.",
    "save": "Lưu thay đổi",
    "saveSuccess": "Đã lưu cài đặt AI thành công.",
    "saveError": "Không thể lưu cài đặt AI."
  }
}
```

---

## Quality gate

```bash
pnpm --filter @supportops/web typecheck   # 0 errors
pnpm lint                                  # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-503**
