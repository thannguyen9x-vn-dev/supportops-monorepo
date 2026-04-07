# TASK-404 — Unit Tests cho Anthropic/OpenAI Adapters
> **Phase:** 4 — Adapter Unit Tests | **Prereq:** TASK-403 | **Status:** ⏳ Pending

## Mục tiêu
Hoàn thiện test coverage cho hai adapter theo đầy đủ nhánh stop/tool/fallback/max-iterations bằng SDK fake factories đã chuẩn hóa.

## Files cần tạo / sửa
```text
apps/ai-service/tests/test_anthropic_adapter.py   ← MODIFIED
apps/ai-service/tests/test_openai_adapter.py      ← MODIFIED
```

## Spec chi tiết
1. `test_anthropic_adapter.py` bắt buộc cover:
- `stop_reason == "end_turn"` trả text.
- `stop_reason == "tool_use"` gọi `tool_executor` với đúng `tool_name` + args.
- Sau tool result, gọi LLM vòng tiếp theo và trả final text.
- Unknown `stop_reason` -> fallback.
- Tool loop không vượt `MAX_ITERATIONS = 5`.

2. `test_openai_adapter.py` bắt buộc cover:
- `finish_reason == "stop"` trả `message.content`.
- `finish_reason == "tool_calls"` parse JSON args, gọi `tool_executor`, append tool result, continue loop.
- Unknown `finish_reason` -> fallback.
- Không vượt `MAX_ITERATIONS = 5`.

3. Constraints:
- Patch đúng constructor paths (`anthropic.AsyncAnthropic`, `AsyncOpenAI`).
- Không dùng API key thật, không network thật.
- Sử dụng factories từ `tests/_sdk_fakes/*`.

## Quality gate
```bash
cd apps/ai-service
pytest tests/test_anthropic_adapter.py tests/test_openai_adapter.py -v
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-405**
