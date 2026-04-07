# TASK-402 — Unit Tests cho report_tool và db/queries
> **Phase:** 2 — Core Unit Tests | **Prereq:** TASK-401 | **Status:** ⏳ Pending

## Mục tiêu
Tạo unit tests cho parser/schema của tool và query layer để đảm bảo output shape ổn định và tenant isolation không bị regression.

## Files cần tạo / sửa
```text
apps/ai-service/tests/test_report_tool.py   ← NEW
apps/ai-service/tests/test_queries.py       ← NEW
```

## Spec chi tiết
1. `test_report_tool.py`:
- `parse_tool_input` happy path trả đúng tuple `(from_date, to_date, metrics)`.
- Missing fields (`from_date`, `to_date`, `metrics`) raise `KeyError`.
- Validate schema invariants:
  - `ANTHROPIC_TOOL` có `name`, `description`, `input_schema`.
  - Required fields chứa đủ 3 keys.
  - `OPENAI_FUNCTION["function"]["name"] == "get_report_data"`.
  - Description OpenAI == Description Anthropic.
  - Metrics enum chứa đủ 5 metrics.

2. `test_queries.py`:
- Cover từng metric output: `request_volume`, `status_breakdown`, `sla_health`, `team_performance`, `service_type_breakdown`.
- Cover case nhiều metrics cùng lúc.
- Empty result không crash, trả structure hợp lệ.
- Verify tenant isolation: mỗi `conn.fetch` call đều có `tenant_id` trong args.

3. Không gọi DB thật; toàn bộ qua mocked `asyncpg.Connection`.

## Quality gate
```bash
cd apps/ai-service
pytest tests/test_report_tool.py tests/test_queries.py -v
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-403**
