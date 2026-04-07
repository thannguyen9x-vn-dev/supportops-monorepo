# DESIGN-00006 — Python Test Suite cho `apps/ai-service`

> **Ngày tạo:** 2026-04-07
> **Tạo bởi:** Tech Lead Agent
> **Status:** Draft
> **Requirement:** [REQ-00006.md](../requirements/REQ-00006.md)
> **Task tracking:** [AGENT_TASKS.md](../AGENT_TASKS.md)

---

## 1. Overview

Thiết lập Python test suite cho `apps/ai-service` (FastAPI) với mục tiêu:
- Có unit tests cho `tools/`, `db/queries.py`, `adapters/`, và integration tests cho `routers/ask.py`.
- Enforce **coverage ≥ 80%** trong **CI (GitHub Actions)**.
- Bổ sung tests cho **startup failure case** trong `main.py` (ví dụ: thiếu `DATABASE_URL`).
- Bổ sung một task kỹ thuật để **giảm rủi ro mock sai structure** (mock phải bám sát SDK object shape).

`apps/ai-service` là Python app độc lập, không nằm trong pnpm workspace, nhưng sẽ được **wire vào CI pipeline** của monorepo.

### Design Decisions (Tech Lead)

| # | Quyết định | Lý do |
|---|---|---|
| D1 | Dùng `pytest` + `pytest-asyncio` (asyncio_mode=auto) | Test async cho adapters/router là bắt buộc; tránh async tests bị skip |
| D2 | Dùng `httpx.AsyncClient` + `ASGITransport` | Test FastAPI async đúng chuẩn, không cần chạy server thật |
| D3 | Enforce coverage threshold (`--cov-fail-under=80`) trong CI | PO confirm Q1: enforce 80% |
| D4 | Thêm job CI riêng cho `apps/ai-service` | PO confirm Q2: đưa vào GitHub Actions |
| D5 | Có test `main.py` startup failure case | PO confirm Q3: cần test startup fail |
| D6 | **Hardening mocks**: tạo helper/factory mô phỏng response objects theo SDK shape + snapshot tests cho shape | PO yêu cầu “sửa luôn phần mock response sai structure” |
| D7 | Không thay đổi runtime behavior của service trong scope này | Task tập trung test infra + reliability của tests |

---

## 2. API Design

Không tạo endpoint mới. Test sẽ cover các endpoint hiện có:

| Method | Path | Notes |
|---|---|---|
| `POST` | `/ask` | tenantId bắt buộc từ header `x-tenant-id` |
| `GET` | `/health` | health check |

---

## 3. RBAC Scoping

Không áp dụng RBAC trong `apps/ai-service` (service này nằm sau NestJS proxy đã guard bằng permission `ai.ask`).

**Security scope bắt buộc trong tests:**
- `x-tenant-id` header là required.
- Prisma không có ở layer này; DB queries dùng `asyncpg` và **mọi query phải include tenant filter** (verified bằng test).

---

## 4. Database Changes

Không có migration. `apps/ai-service` chỉ read-only SELECT.

---

## 5. Types Contract (`packages/types/`)

Không có types mới cho REQ-00006 (Python-only testing).

---

## 6. Test Suite Architecture

### 6.1 Folder structure

```text
apps/ai-service/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── _sdk_fakes/                       ← NEW: factories cho SDK response objects
│   │   ├── anthropic_fakes.py
│   │   └── openai_fakes.py
│   ├── test_main_startup.py              ← NEW: startup success/failure tests
│   ├── test_report_tool.py
│   ├── test_queries.py
│   ├── test_anthropic_adapter.py
│   ├── test_openai_adapter.py
│   └── test_ask_router.py
├── pytest.ini
└── requirements.txt
```

### 6.2 `pytest.ini`

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
```

### 6.3 Python test dependencies

Thêm vào `apps/ai-service/requirements.txt` (hoặc tách `requirements-test.txt`):

```
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-mock>=3.14.0
httpx>=0.27.0
pytest-cov>=5.0.0
```

---

## 7. CI Design (GitHub Actions)

### 7.1 New CI step (monorepo workflow)

Thêm một job/step trong CI workflow hiện tại (ví dụ: `.github/workflows/ci-pr.yml`) để chạy:

```bash
cd apps/ai-service
python -m pip install -r requirements.txt
pytest -q --cov=. --cov-report=term-missing --cov-fail-under=80
```

Notes:
- Cần dùng Python version đồng bộ với production (khuyến nghị 3.11).
- Job này chạy độc lập với pnpm jobs.

---

## 8. Testing Plan (per module)

### 8.1 `tools/report_tool.py`

- parse_tool_input: happy path + missing field errors.
- Schema invariants: tool name, required fields, enum values, description consistency giữa Anthropic/OpenAI definitions.

### 8.2 `db/queries.py`

- Verify key output shape cho từng metric:
  - `request_volume` (total + period)
  - `status_breakdown` (map status->count)
  - `sla_health` (total/breached/compliance_rate_pct)
  - `team_performance` (list với `technician/assigned/resolved`)
  - `service_type_breakdown` (list)
- Tenant isolation: verify `conn.fetch` được gọi với `tenant_id` là param (tối thiểu check presence trong `call.args`).

### 8.3 `adapters/*`

- Happy path: `end_turn` / `stop` returns text.
- Tool loop path: tool_use/tool_calls triggers tool_executor, then second LLM call returns final.
- Max iteration: fallback message sau 5 iterations.
- Unknown stop_reason/finish_reason returns fallback.

### 8.4 `routers/ask.py`

- Header validation: missing `x-tenant-id` -> 422 (FastAPI header required).
- Adapter selection: claude -> anthropic; gpt -> openai; invalid model fallback to default claude.
- 503 when adapter not configured.
- Tool executor: unknown tool returns `{"error": ...}`; parse_tool_input error returns error JSON; ensures tenantId from header is used.

### 8.5 `main.py` startup tests (NEW)

Test cases:
- Missing `DATABASE_URL` -> startup raises RuntimeError("DATABASE_URL environment variable is required").
- When `DATABASE_URL` present, `asyncpg.create_pool` is called with expected params (min/max/timeout), and `app.state.db_pool` is set.
- When provider API keys missing -> adapters dict remains empty and logs warnings (optional assertion).
- When API key exists -> correct adapter class instantiated (mock class), and key injected.

Implementation approach:
- Patch `os.getenv` hoặc set `monkeypatch.setenv`.
- Patch `asyncpg.create_pool` to AsyncMock.
- Trigger startup by calling `await app.router.startup()` hoặc directly call `startup()` function import from main.

---

## 9. Mock Hardening Task (NEW)

### Problem

Mocking response objects bằng dict/loose MagicMock có thể khiến test pass nhưng production fail nếu adapter code access nested attributes khác real SDK shape.

### Solution design

- Tạo `tests/_sdk_fakes/anthropic_fakes.py` và `tests/_sdk_fakes/openai_fakes.py`:
  - Provide factory functions returning objects có attribute structure đúng theo adapter usage.
  - Provide “shape assertions” (small helper) để ensure fake objects có đủ fields trước khi dùng.
- Update adapter tests to use these factories only (ban direct dict mocks).
- Add regression test that intentionally uses wrong shape and asserts adapter fails fast (optional), hoặc assert factory objects expose required attributes.

---

## 10. Implementation Order

> Lưu ý: REQ-00006 là Python-only nhưng vẫn theo nguyên tắc “contracts first” — ở đây không có packages/types changes.

```
Step 1: Add test infra
  - pytest.ini
  - requirements.txt test deps
  - tests/ + conftest.py

Step 2: Unit tests (tools + queries)
  - test_report_tool.py
  - test_queries.py

Step 3: SDK fake factories (hardening)
  - tests/_sdk_fakes/*
  - refactor adapter tests to use factories

Step 4: Adapter tests
  - test_anthropic_adapter.py
  - test_openai_adapter.py

Step 5: Router integration tests
  - test_ask_router.py

Step 6: main.py startup tests
  - test_main_startup.py

Step 7: Wire to CI
  - Update GitHub Actions workflow
  - Enforce coverage 80%
```

---

## 11. Testing Plan (CI + local commands)

Local:
```bash
cd apps/ai-service
pip install -r requirements.txt
pytest -v
pytest --cov=. --cov-report=term-missing --cov-fail-under=80
```

CI:
- Run same commands with pinned Python version.

---

## 12. Risk list

| Risk | Mức độ | Mitigation |
|---|---|---|
| Test flakiness do async event loop config | Medium | `asyncio_mode=auto`, avoid real network, deterministic mocks |
| Coverage drops khi thêm code mới | Medium | CI enforce `--cov-fail-under=80`, require tests in PR |
| Mock shape drift với SDK updates | High | Centralize factories; update one place when SDK changes |
| Startup test brittle (depends on FastAPI internals) | Low | Call startup function directly; patch asyncpg.create_pool |
| `apps/ai-service` CI job slows pipeline | Low | Tests offline; keep runtime <10s; cache pip if needed |

---

## 13. Constraints Checklist

- [x] KHÔNG tạo Prisma migration
- [x] KHÔNG sửa legacy modules
- [x] KHÔNG thêm npm dependency mới (Python deps only; CI update is YAML)
- [x] Mọi DB query phải có tenant filter (verified by tests)
- [x] `packages/types/` là source of truth — không cần update trong REQ-00006
- [x] Mỗi endpoint mới phải pass security checklist — không có endpoint mới
- [x] CI enforce coverage 80% (PO confirmed)

---

## 14. Tóm tắt cho PO

### Implementation order ưu tiên
1) Test infrastructure + unit tests (tools/queries)  
2) Mock hardening factories cho Anthropic/OpenAI  
3) Adapter + router integration tests  
4) `main.py` startup tests  
5) Wire vào CI + enforce coverage 80%

### Dependency cần unlock trước
- Cần update GitHub Actions workflow để có Python 3.11 runner + pip install.
- Không cần DB hay API key thật (tất cả đều mock).

### Risk cần PO quyết định
- Có muốn tách `requirements-test.txt` để không inflate production image size không? (khuyến nghị: YES nếu đang build Docker image cho ai-service)
