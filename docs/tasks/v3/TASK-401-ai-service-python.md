# TASK-401 — AI Service: FastAPI + Adapters + Tool + DB queries
> **Phase:** 4 — AI Service | **Prereq:** TASK-301 done | **Status:** ✅ Done

---

## Mục tiêu

Tạo `apps/ai-service/` — Python FastAPI app độc lập, không nằm trong pnpm workspace. Xử lý AI chat với adapter pattern (Anthropic + OpenAI), tool use `get_report_data` predefined, DB read-only.

---

## Files cần tạo

```text
apps/ai-service/
├── main.py                           ← FastAPI app, startup, health endpoint
├── requirements.txt
├── .env.example
├── routers/
│   └── ask.py                        ← POST /ask endpoint
├── adapters/
│   ├── base.py                       ← AiAdapter ABC
│   ├── anthropic_adapter.py          ← Claude tool use
│   └── openai_adapter.py             ← OpenAI function calling
├── tools/
│   └── report_tool.py                ← Tool/function schema definition
└── db/
    └── queries.py                    ← get_report_data() — read-only PostgreSQL
```

---

## Spec chi tiết

### Architecture flow

```
POST /ask (Header: x-tenant-id required)
  │
  ├─ Validate: x-tenant-id present → else 400
  ├─ Validate: model in AI_MODEL_IDS → else 422
  │
  ├─ Pick adapter: Anthropic (claude-*) or OpenAI (gpt-*)
  │
  └─ adapter.ask(model, system_prompt, history, user_message, tool_executor)
       │
       ├─ Loop up to MAX_ITERATIONS=5:
       │   ├─ Call LLM API
       │   ├─ If stop_reason == tool_use/tool_calls:
       │   │   └─ Execute tool_executor(args) → get_report_data(conn, tenant_id, ...)
       │   └─ Append tool result → continue loop
       └─ Return final text response
```

### `main.py`

```python
app = FastAPI(title="SupportOps AI Service")

@app.on_event("startup")
async def startup():
    app.state.pool = await asyncpg.create_pool(DATABASE_URL)
    app.state.anthropic_client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None
    app.state.openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

@app.get("/health")
async def health(): return {"status": "ok"}
```

### `routers/ask.py` — QUAN TRỌNG: tenantId từ header

```python
@router.post("/ask")
async def ask_endpoint(
    request: Request,
    body: AskBody,
    x_tenant_id: str = Header(..., alias="x-tenant-id"),   # BẮT BUỘC từ header
):
    # tenantId = x_tenant_id  ← KHÔNG đọc từ body
    async def tool_executor(args: dict) -> str:
        async with request.app.state.pool.acquire() as conn:
            return await get_report_data(conn, x_tenant_id, ...)
```

### `adapters/base.py`

```python
class AiAdapter(ABC):
    @abstractmethod
    async def ask(
        self,
        model: str,
        system_prompt: str,
        history: list[dict],
        user_message: str,
        tool_executor: Callable[[dict], Awaitable[str]],
    ) -> str: ...
```

### `tools/report_tool.py`

```python
TOOL_NAME = "get_report_data"
METRICS = ["request_volume", "status_breakdown", "sla_health",
           "team_performance", "service_type_breakdown"]

# Anthropic format tool schema
ANTHROPIC_TOOL = { "name": TOOL_NAME, "description": "...", "input_schema": {...} }

# OpenAI format function schema
OPENAI_FUNCTION = { "type": "function", "function": { "name": TOOL_NAME, ... } }
```

### `db/queries.py` — READ-ONLY

```python
async def get_report_data(
    conn: asyncpg.Connection,
    tenant_id: str,   # BẮT BUỘC filter
    from_date: str,
    to_date: str,
    metrics: list[str],
) -> dict:
    # Chỉ SELECT — KHÔNG INSERT/UPDATE/DELETE
    # Mọi query đều có WHERE tenant_id = $1
    # Metrics: request_volume, status_breakdown, sla_health, team_performance, service_type_breakdown
```

### System prompt (key rules)

```text
1. MUST call get_report_data tool — never fabricate numbers
2. If date range unclear → ask user before calling tool
3. Refuse questions outside SupportOps domain — suggest relevant questions
4. Respond in the same language as the user's question
```

### `requirements.txt`

```
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
asyncpg>=0.29.0
anthropic>=0.25.0
openai>=1.30.0
pydantic>=2.7.0
python-dotenv>=1.0.0
```

### `.env.example`

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@localhost:5432/supportops
PORT=8000
```

---

## Security checklist

- [x] `x-tenant-id` là Header required — 400 nếu thiếu
- [x] `get_report_data` luôn filter `tenant_id` — không bao giờ query tất cả tenants
- [x] Không INSERT/UPDATE/DELETE trong bất kỳ DB query nào
- [x] API keys chỉ từ env — không log, không trả về client
- [x] Model validated against whitelist trước khi gọi API

---

## Chạy locally

```bash
cd apps/ai-service
pip install -r requirements.txt
cp .env.example .env   # điền API keys + DATABASE_URL
uvicorn main:app --reload --port 8000
```

## Quality gate

```bash
# Startup không crash:
uvicorn main:app --port 8000
# → INFO: Application startup complete.

# Health check:
curl http://localhost:8000/health
# → {"status": "ok"}
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-501**
