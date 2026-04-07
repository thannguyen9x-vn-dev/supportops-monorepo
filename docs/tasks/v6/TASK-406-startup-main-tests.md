# TASK-406 — Startup/Shutdown Tests cho main.py
> **Phase:** 5 — Startup Validation | **Prereq:** TASK-401 | **Status:** ⏳ Pending

## Mục tiêu
Đảm bảo lifecycle `main.py` được test đầy đủ cho success/failure paths: env validation, pool init, adapter init conditional, shutdown close.

## Files cần tạo / sửa
```text
apps/ai-service/tests/test_main_startup.py   ← NEW
```

## Spec chi tiết
1. Cases bắt buộc:
- Missing `DATABASE_URL` -> `RuntimeError("DATABASE_URL environment variable is required")`.
- `DATABASE_URL` có giá trị -> `asyncpg.create_pool` được gọi với config hiện tại (`min_size`, `max_size`, `command_timeout`) và `app.state.db_pool` được set.
- Thiếu cả `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` -> `app.state.ai_adapters == {}`.
- Có từng key tương ứng -> adapter class tương ứng được instantiate.
- `shutdown()` await `app.state.db_pool.close()` đúng 1 lần.

2. Kỹ thuật:
- Dùng `monkeypatch.setenv` hoặc patch `os.getenv`.
- Patch `asyncpg.create_pool` bằng `AsyncMock`.
- Trigger startup/shutdown bằng `await startup()`/`await shutdown()` hoặc app router lifecycle.

3. Không được tạo connection thật.

## Quality gate
```bash
cd apps/ai-service
pytest tests/test_main_startup.py -v
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-407**
