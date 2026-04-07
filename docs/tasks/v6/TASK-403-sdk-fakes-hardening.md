# TASK-403 — Hardening SDK Mocks bằng Shared Factories
> **Phase:** 3 — Mock Hardening | **Prereq:** TASK-402 | **Status:** ⏳ Pending

## Mục tiêu
Chuẩn hóa mock response shape cho Anthropic/OpenAI bằng factory module dùng chung để tránh mock sai cấu trúc gây false-positive tests.

## Files cần tạo / sửa
```text
apps/ai-service/tests/_sdk_fakes/anthropic_fakes.py   ← NEW
apps/ai-service/tests/_sdk_fakes/openai_fakes.py      ← NEW
apps/ai-service/tests/test_anthropic_adapter.py        ← MODIFIED (chuyển sang dùng fake factories)
apps/ai-service/tests/test_openai_adapter.py           ← MODIFIED (chuyển sang dùng fake factories)
```

## Spec chi tiết
1. Tạo `tests/_sdk_fakes/anthropic_fakes.py`:
- Factory functions cho:
  - `end_turn_response(text: str)`
  - `tool_use_response(tool_id: str, tool_name: str, tool_input: dict)`
- Shape assertion helper (ví dụ `assert_anthropic_shape(obj)`) để đảm bảo object có attributes adapter cần dùng:
  - `.stop_reason`
  - `.content[]` block với `.type` và (`.text` hoặc `.id/.name/.input`)

2. Tạo `tests/_sdk_fakes/openai_fakes.py`:
- Factory functions cho:
  - `stop_response(text: str)`
  - `tool_calls_response(call_id: str, fn_name: str, arguments: dict)`
- Shape assertion helper đảm bảo object có:
  - `.choices[0].finish_reason`
  - `.choices[0].message.content/tool_calls`
  - `.function.arguments` là JSON string

3. Refactor adapter tests hiện có:
- Bỏ mock dict ad-hoc hoặc loose MagicMock không kiểm soát shape.
- Chỉ dùng objects sinh từ factories.

4. Thêm tối thiểu 1 regression test/adapter:
- Cố tình truyền object sai shape và assert code đi fallback path thay vì crash không kiểm soát.

## Quality gate
```bash
cd apps/ai-service
pytest tests/test_anthropic_adapter.py tests/test_openai_adapter.py -v
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-404**
