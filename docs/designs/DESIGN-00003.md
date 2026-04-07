# DESIGN-00003 — AI Assistant Chat cho TENANT_ADMIN

> **Ngày tạo:** 2026-04-06
> **Tạo bởi:** Tech Lead Agent
> **Status:** ✅ Implemented
> **Requirement:** [REQ-00003.md](../requirements/REQ-00003.md)
> **Task tracking:** [tasks/v3/_STATUS.md](../tasks/v3/_STATUS.md)

---

## 1. Overview

AI Assistant là một chat panel trong dashboard, chỉ hiển thị với TENANT_ADMIN. NestJS đóng vai proxy (verify JWT + inject tenantId), sau đó forward request sang một Python FastAPI service độc lập (`apps/ai-service`). AI Service dùng tool use / function calling với predefined queries để trả lời câu hỏi về data vận hành — không bao giờ tự sinh số liệu.

---

## 2. Architecture

```
Browser (TENANT_ADMIN)
    │ POST /api/v1/ai/ask
    ▼
NestJS API (apps/api)
    │ verify JWT
    │ check ai.ask permission
    │ inject x-tenant-id header
    │ POST http://ai-service:8000/ask
    ▼
Python FastAPI (apps/ai-service)
    │ read x-tenant-id (không tin body)
    │ call Anthropic / OpenAI với tool
    │     └─ tool: get_report_data(tenantId, from, to, metrics[])
    │              └─ query PostgreSQL (read-only)
    ▼
Response → NestJS → Browser
```

---

## 2. API Design

### 2.1 Endpoints

```
POST /api/v1/ai/ask
Auth: Bearer JWT (required)
Permission: ai.ask (chỉ TENANT_ADMIN có)

Request:
{
  "message": "Tuần này có bao nhiêu request mới?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "model": "claude-sonnet-4-20250514"   // optional, override per-session
}

Response 200:
{
  "data": {
    "reply": "Tuần này (31/03 - 06/04) có 47 request mới...",
    "model": "claude-sonnet-4-20250514"
  }
}

Response 403: { "error": { "code": "FORBIDDEN", "message": "..." } }
Response 503: { "error": { "code": "AI_SERVICE_UNAVAILABLE", "message": "..." } }
```

```
GET /api/v1/ai/settings
Auth: Bearer JWT (required)
Permission: ai.ask

Response 200:
{
  "data": { "defaultModel": "claude-sonnet-4-20250514" }
}
```

```
PATCH /api/v1/ai/settings
Auth: Bearer JWT (required)
Permission: ai.ask

Request: { "defaultModel": "gpt-4o" }
Response 200: { "data": { "defaultModel": "gpt-4o" } }
```

---

## 3. Database Changes

### 3.1 Schema

```prisma
model TenantAiSettings {
  id           String   @id @default(uuid())
  tenantId     String   @unique
  defaultModel String   @default("claude-sonnet-4-20250514")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

Migration: `20260406000000_add_tenant_ai_settings`

---

## 4. Types Contract

```typescript
// packages/types/src/types/ai.types.ts

export const AI_MODEL_IDS = [
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "gpt-4o",
  "gpt-4o-mini",
] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];
export const DEFAULT_AI_MODEL: AiModelId = "claude-sonnet-4-20250514";

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
```

---

## 5. AI Service Design (Python)

### 5.1 Tool Definition

```python
# tools/report_tool.py
TOOL_NAME = "get_report_data"
METRICS = ["request_volume", "status_breakdown", "sla_health",
           "team_performance", "service_type_breakdown"]
```

AI không được generate data — bắt buộc gọi tool trước khi trả lời số liệu.

### 5.2 Adapter Pattern

```python
class AiAdapter(ABC):
    async def ask(self, model, system_prompt, history, user_message, tool_executor) -> str: ...

class AnthropicAdapter(AiAdapter): ...   # Claude tool use
class OpenAiAdapter(AiAdapter): ...      # OpenAI function calling
```

### 5.3 System Prompt (key rules)

1. Bắt buộc dùng `get_report_data` tool — không tự bịa số liệu
2. Nếu không rõ date range → hỏi lại trước khi gọi tool
3. Từ chối câu hỏi ngoài domain SupportOps
4. Trả lời theo ngôn ngữ của câu hỏi

---

## 6. Frontend Architecture

### 6.1 Component Tree

```
DashboardOverview (client)
├── [non-TENANT_ADMIN] DashboardContent (full width)
└── [TENANT_ADMIN] Grid 2-column
    ├── DashboardContent (xl:8 cols)
    └── AiChatPanel (xl:4 cols)
        ├── Header: title + AiModelSelector + clear button
        ├── Messages: AiChatMessage[] + loading indicator
        └── Input: OutlinedInput + send button
```

### 6.2 Hook & Service

```
features/ai-assistant/
├── types.ts                    ← UiChatMessage, ChatLoadState
├── utils/aiAccess.ts           ← canUseAiAssistant(role)
├── services/ai.service.ts      ← ask(), getSettings(), updateSettings()
├── hooks/useAiChat.ts          ← messages, isLoading, sendMessage, clear
└── components/
    ├── AiChatPanel.tsx
    ├── AiChatMessage.tsx
    └── AiModelSelector.tsx

features/settings/ai/
├── services/ai-settings.service.ts
├── hooks/useAiSettings.ts
└── components/AiSettingsView.tsx
```

### 6.3 RBAC Gate

```typescript
// canUseAiAssistant(role) → true chỉ khi role === "TENANT_ADMIN"
// Panel không render với các role khác — không cần 403 handling ở FE
```

---

## 7. Security Checklist

| Check | Status |
|---|---|
| tenantId từ JWT, không từ request body | ✅ |
| ANTHROPIC_API_KEY + OPENAI_API_KEY chỉ trong env ai-service | ✅ |
| ai.ask permission guard trên mọi endpoint | ✅ |
| AI Service DB connection: read-only intent (no INSERT/UPDATE/DELETE) | ✅ |
| Tool use predefined — không text-to-SQL tự do | ✅ |
| AI Service chỉ nhận request từ internal network (same server) | ✅ |

---

## 8. Models hỗ trợ

| Model ID | Provider | Hint |
|---|---|---|
| `claude-sonnet-4-20250514` | Anthropic | Faster — **default** |
| `claude-opus-4-20250514` | Anthropic | Most powerful |
| `gpt-4o` | OpenAI | Balanced |
| `gpt-4o-mini` | OpenAI | Cost-effective |

---

## 9. Risks & Mitigations

| Risk | Mức độ | Mitigation |
|---|---|---|
| AI hallucinate số liệu | Med | Tool use bắt buộc — system prompt cấm tự sinh số |
| tenantId bypass | High | NestJS inject header, AI Service không đọc từ body |
| AI Service down | Low | NestJS bắt lỗi → 503, FE hiển thị degraded state |
| Cost vượt kiểm soát | Low | Label rõ "Most powerful" bên cạnh Opus |

---

## 10. Forbidden Actions

- [x] KHÔNG để AI Service đọc tenantId từ request body
- [x] KHÔNG trả về API key về phía client hay log ra
- [x] KHÔNG để AI tự sinh số liệu — bắt buộc qua tool
- [x] KHÔNG INSERT/UPDATE/DELETE trong AI Service DB queries
- [x] KHÔNG expose AI endpoints với role khác TENANT_ADMIN
