# TASK-401 — Test Infrastructure cho apps/ai-service
> **Phase:** 1 — Test Infrastructure | **Prereq:** none | **Status:** ⏳ Pending

## Mục tiêu
Thiết lập nền tảng pytest chuẩn cho service Python để chạy async tests ổn định, có shared fixtures và sẵn sàng cho các module tests phía sau.

## Files cần tạo / sửa
```text
apps/ai-service/pytest.ini                 ← NEW
apps/ai-service/requirements.txt           ← MODIFIED
apps/ai-service/tests/__init__.py          ← NEW
apps/ai-service/tests/conftest.py          ← NEW
```

## Spec chi tiết
1. Tạo `pytest.ini`:
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
```

2. Thêm test dependencies vào `requirements.txt`:
```txt
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-mock>=3.14.0
httpx>=0.27.0
pytest-cov>=5.0.0
```
- Nếu `httpx` đã có thì giữ 1 dòng duy nhất.

3. `tests/conftest.py` fixtures bắt buộc:
- `mock_conn` (`AsyncMock`) với `fetch`.
- `mock_db_pool` có async context manager cho `acquire()`.
- `mock_anthropic_adapter`, `mock_openai_adapter` (mỗi adapter có `ask = AsyncMock`).
- `async_client` bằng `httpx.AsyncClient + ASGITransport` inject `db_pool` + `ai_adapters` vào `app.state`.
- `async_client_no_adapters` cho case `503`.

4. Fixture chống external dependencies:
- Không cho test chạm network thật.
- Không cho test tạo DB pool thật (mọi nơi phải dùng mocked pool).

## Quality gate
```bash
cd apps/ai-service
pytest --collect-only
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-402**
