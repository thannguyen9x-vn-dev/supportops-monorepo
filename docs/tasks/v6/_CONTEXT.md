# _CONTEXT.md — v6 (DESIGN-00006: Python Test Suite cho apps/ai-service)

## Cách dùng hệ thống task

1. Đọc file này trước để nắm phase, gate, bất biến.
2. Đọc task được assign trong `docs/tasks/v6/TASK-*.md`.
3. Implement đúng spec của task, không mở rộng ngoài scope.
4. Chạy quality gate của task đó.
5. Cập nhật `docs/tasks/v6/_STATUS.md`.
6. Báo cáo theo format ở cuối file này.

---

## Files bắt buộc đọc trước khi bắt đầu (theo thứ tự)

| # | File | Mục đích |
|---|---|---|
| 1 | `docs/designs/DESIGN-00006.md` | Source of truth cho test architecture + implementation order |
| 2 | `docs/requirements/REQ-00006.md` | Acceptance criteria đầy đủ (`AC-001..AC-013`) |
| 3 | `AGENTS.md` (root) | Quy tắc kiến trúc chung + quality gate |
| 4 | `apps/api/AGENTS.md` | Quy tắc multi-tenant/query scoping liên quan test DB query |
| 5 | `apps/web/AGENTS.md` | Quy tắc tham chiếu monorepo (không sửa FE trong v6) |

---

## Stack

| Layer | Tech | Vùng ảnh hưởng |
|---|---|---|
| AI Service test | Python 3.11, FastAPI, pytest, pytest-asyncio, pytest-mock, httpx, pytest-cov | `apps/ai-service/` |
| CI | GitHub Actions | `.github/workflows/ci-pr.yml` |

---

## Thứ tự thực hiện (Phase Diagram)

```text
PHASE 1 — Test Infrastructure
  TASK-401: pytest.ini + requirements test deps + tests/conftest.py
  GATE 1: pytest --collect-only

PHASE 2 — Core Unit Tests
  TASK-402: tests cho report_tool + db/queries
  GATE 2: pytest tests/test_report_tool.py tests/test_queries.py -v

PHASE 3 — Mock Hardening (bắt buộc trước adapter tests)
  TASK-403: tests/_sdk_fakes/* + shape assertions + refactor adapter tests dùng factories
  GATE 3: pytest tests/test_anthropic_adapter.py tests/test_openai_adapter.py -k "factory or shape" -v

PHASE 4 — Adapter + Router
  TASK-404: adapter unit tests hoàn chỉnh
  TASK-405: router integration tests (/ask, /health)
  GATE 4: pytest tests/test_anthropic_adapter.py tests/test_openai_adapter.py tests/test_ask_router.py -v

PHASE 5 — Startup + CI Coverage
  TASK-406: startup/shutdown tests cho main.py
  TASK-407: wire GitHub Actions Python job + enforce --cov-fail-under=80
  GATE 5: pytest -q --cov=. --cov-report=term-missing --cov-fail-under=80

FINAL GATE
  cd apps/ai-service && pytest -v
```

---

## Quy tắc bất biến

### Từ AGENTS.md (root)
- Không thay đổi API contract/endpoint của `apps/ai-service`.
- Không thêm npm dependency cho scope này.
- Không tạo migration DB.

### Từ REQ/DESIGN-00006
- Bắt buộc test: `tools/`, `db/queries.py`, `adapters/`, `routers/ask.py`, `main.py` startup/shutdown.
- Bắt buộc coverage >= 80% và enforce trong CI.
- Bắt buộc hardening mock structure bằng shared SDK factories (`tests/_sdk_fakes/*`).
- Không có external HTTP call; không có real PostgreSQL connection trong tests.
- Tenant isolation phải được assert: tenant ID lấy từ header và truyền vào query layer.

### Hygiene
- Fixture dùng chung tại `tests/conftest.py`.
- Adapter tests chỉ dùng factory objects, không mock dict ad-hoc.
- Verify `MAX_ITERATIONS = 5` cho cả Anthropic và OpenAI adapters.

---

## Quality Gates

| Gate | Command | Thời điểm |
|---|---|---|
| Infra collect | `cd apps/ai-service && pytest --collect-only` | Sau TASK-401 |
| Unit core | `cd apps/ai-service && pytest tests/test_report_tool.py tests/test_queries.py -v` | Sau TASK-402 |
| Hardening check | `cd apps/ai-service && pytest tests/test_anthropic_adapter.py tests/test_openai_adapter.py -v` | Sau TASK-403 |
| Router+startup | `cd apps/ai-service && pytest tests/test_ask_router.py tests/test_main_startup.py -v` | Sau TASK-405 + TASK-406 |
| Coverage local | `cd apps/ai-service && pytest -q --cov=. --cov-report=term-missing --cov-fail-under=80` | Sau TASK-407 |
| Full suite | `cd apps/ai-service && pytest -v` | Trước merge |

---

## Mapping Acceptance Criteria (REQ-00006) → Task

| AC | Nội dung | Covered by |
|---|---|---|
| AC-001 | `pytest` chạy 0 failures/0 errors | TASK-402, TASK-404, TASK-405, TASK-406 |
| AC-002 | Coverage >= 80% cho scope yêu cầu | TASK-407 |
| AC-003 | Không external HTTP call | TASK-401, TASK-403, TASK-404, TASK-405 |
| AC-004 | Không kết nối PostgreSQL thật | TASK-401, TASK-402, TASK-405, TASK-406 |
| AC-005 | Suite <10 giây | TASK-407 (đo ở CI), TASK-404 (giữ test lightweight) |
| AC-006 | `asyncio_mode = auto` | TASK-401 |
| AC-007 | requirements có đủ test deps | TASK-401 |
| AC-008 | `tests/conftest.py` reusable fixtures | TASK-401 |
| AC-009 | Verify `MAX_ITERATIONS` cho adapters | TASK-404 |
| AC-010 | Tenant isolation từ header -> query | TASK-402, TASK-405 |
| AC-011 | Startup/shutdown tests cho `main.py` | TASK-406 |
| AC-012 | GitHub Actions chạy pytest + cov gate | TASK-407 |
| AC-013 | Hardening bằng shared factories | TASK-403, TASK-404 |

---

## Format báo cáo sau mỗi task

```text
## TASK-XXX — [Tên task] ✅ Done

Files đã tạo/sửa:
- path/to/file.py (NEW/MODIFIED)

Quality gate:
- [x] <command> → PASS

AC liên quan:
- AC-00x, AC-00y

Deviation (nếu có):
- <lý do + impact>

Task tiếp theo:
- TASK-YYY
```
