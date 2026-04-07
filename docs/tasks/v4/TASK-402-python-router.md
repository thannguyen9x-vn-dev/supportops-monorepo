# TASK-402 — Python: routers/export.py + mount main.py
> **Phase:** 2 — Python Service | **Prereq:** TASK-401 | **Status:** ⏳ Pending

## Mục tiêu
Tạo FastAPI router với 3 endpoints `/export/csv|excel|pdf`, validate input, gọi `get_report_data()` + exporter tương ứng, trả về `StreamingResponse`. Mount router vào `main.py`.

## Files cần tạo / sửa

```text
apps/ai-service/routers/export.py    ← NEW
apps/ai-service/main.py              ← MODIFIED (include_router)
```

## Spec chi tiết

### 1. `apps/ai-service/routers/export.py`

```python
import io
from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from datetime import date
from db.queries import get_report_data
from exporters.csv_exporter import build_csv
from exporters.excel_exporter import build_excel
from exporters.pdf_exporter import build_pdf

VALID_METRICS = {
    "request_volume",
    "status_breakdown",
    "sla_health",
    "team_performance",
    "service_type_breakdown",
}
ALL_METRICS = list(VALID_METRICS)

router = APIRouter(prefix="/export", tags=["export"])


class ExportRequest(BaseModel):
    from_date: date
    to_date: date
    metrics: list[str] = ALL_METRICS

    @field_validator("metrics")
    @classmethod
    def validate_metrics(cls, v: list[str]) -> list[str]:
        invalid = set(v) - VALID_METRICS
        if invalid:
            raise ValueError(f"Invalid metrics: {invalid}")
        return v


async def _do_export(request: Request, body: ExportRequest, x_tenant_id: str, fmt: str) -> StreamingResponse:
    if body.to_date < body.from_date:
        raise HTTPException(status_code=400, detail="to_date must be >= from_date")

    async with request.app.state.db_pool.acquire() as conn:
        data = await get_report_data(
            conn, x_tenant_id, body.from_date, body.to_date, body.metrics
        )

    filename = f"report_{body.from_date}_{body.to_date}.{fmt}"

    if fmt == "csv":
        buf = build_csv(data, body.from_date, body.to_date)
        media_type = "text/csv"
    elif fmt == "excel":
        buf = build_excel(data, body.from_date, body.to_date)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"report_{body.from_date}_{body.to_date}.xlsx"
    else:  # pdf
        buf = build_pdf(data, body.from_date, body.to_date)
        media_type = "application/pdf"

    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/csv")
async def export_csv(
    body: ExportRequest,
    request: Request,
    x_tenant_id: str = Header(...),
):
    return await _do_export(request, body, x_tenant_id, "csv")


@router.post("/excel")
async def export_excel(
    body: ExportRequest,
    request: Request,
    x_tenant_id: str = Header(...),
):
    return await _do_export(request, body, x_tenant_id, "excel")


@router.post("/pdf")
async def export_pdf(
    body: ExportRequest,
    request: Request,
    x_tenant_id: str = Header(...),
):
    return await _do_export(request, body, x_tenant_id, "pdf")
```

### 2. `apps/ai-service/main.py` — thêm include_router

Tìm phần mount các router trong `main.py` và thêm:

```python
from routers.export import router as export_router

# Trong app startup (sau khi tạo app object):
app.include_router(export_router)
```

> Xem cách các router khác được mount (ví dụ `/ask`) để đặt đúng vị trí.

## Quality gate

```bash
cd apps/ai-service

# Chạy server locally:
uvicorn main:app --reload --port 8000

# Trong terminal khác — test smoke:
curl -X POST http://localhost:8000/export/csv \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test-tenant-id" \
  -d '{"from_date": "2026-01-01", "to_date": "2026-03-31"}' \
  --output /tmp/test_report.csv
# Expected: file /tmp/test_report.csv được tạo, size > 0

# Test validation:
curl -X POST http://localhost:8000/export/csv \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test" \
  -d '{"from_date": "2026-03-31", "to_date": "2026-01-01"}' \
  -w "%{http_code}"
# Expected: 400

# Test invalid metric:
curl -X POST http://localhost:8000/export/csv \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test" \
  -d '{"from_date": "2026-01-01", "to_date": "2026-03-31", "metrics": ["invalid_metric"]}' \
  -w "%{http_code}"
# Expected: 422

# Test thiếu x-tenant-id header:
curl -X POST http://localhost:8000/export/csv \
  -H "Content-Type: application/json" \
  -d '{"from_date": "2026-01-01", "to_date": "2026-03-31"}' \
  -w "%{http_code}"
# Expected: 422
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-302** (sau khi TASK-301 xong)
