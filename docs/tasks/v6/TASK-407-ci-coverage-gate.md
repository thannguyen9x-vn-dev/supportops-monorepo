# TASK-407 — CI Python Job + Coverage Gate 80%
> **Phase:** 5 — CI Integration | **Prereq:** TASK-405, TASK-406 | **Status:** ⏳ Pending

## Mục tiêu
Wire `apps/ai-service` test suite vào GitHub Actions và enforce coverage >= 80% trong CI cho mỗi PR.

## Files cần tạo / sửa
```text
.github/workflows/ci-pr.yml   ← MODIFIED
```

## Spec chi tiết
1. Thêm Python job riêng trong `ci-pr.yml`:
- Setup Python 3.11.
- Install deps:
```bash
cd apps/ai-service
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```
- Run tests + coverage:
```bash
cd apps/ai-service
pytest -q --cov=. --cov-report=term-missing --cov-fail-under=80
```

2. Job requirements:
- Chạy trên pull requests (main/develop như workflow hiện tại).
- Không dùng `continue-on-error`.
- Fail ngay khi coverage < 80 hoặc có test fail.

3. Verify local command trước khi push:
```bash
cd apps/ai-service
pytest -q --cov=. --cov-report=term-missing --cov-fail-under=80
```

4. Ghi lại runtime pytest trong CI summary (mục tiêu <10s).

## Quality gate
```bash
cd apps/ai-service
pytest -q --cov=. --cov-report=term-missing --cov-fail-under=80
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **none**
