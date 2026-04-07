# TASK-405 — Integration Tests cho ask router và health
> **Phase:** 4 — Router Integration | **Prereq:** TASK-404 | **Status:** ⏳ Pending

## Mục tiêu
Kiểm thử luồng endpoint `POST /ask` và `GET /health` với async client, đảm bảo header validation, model routing, tool_executor wiring và tenant scoping đúng.

## Files cần tạo / sửa
```text
apps/ai-service/tests/test_ask_router.py   ← NEW/MODIFIED
```

## Spec chi tiết
1. `GET /health`:
- `200` và body `{"status": "ok"}`.

2. `POST /ask`:
- Happy path: `200`, có `reply` và `model`.
- Missing `x-tenant-id` -> `422`.
- Adapter không config -> `503`.

3. Adapter selection:
- `claude-sonnet-4-20250514`, `claude-opus-4-20250514` -> anthropic.
- `gpt-4o`, `gpt-4o-mini` -> openai.
- Invalid model -> fallback `claude-sonnet-4-20250514`.

4. Tool executor behavior:
- Unknown tool -> JSON error string (`{"error": ...}`).
- parse_tool_input exception -> JSON error string.
- Tenant propagation: verify `get_report_data` nhận tenant từ header, không từ body.

## Quality gate
```bash
cd apps/ai-service
pytest tests/test_ask_router.py -v
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-406**
