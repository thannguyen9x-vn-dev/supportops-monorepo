from datetime import date

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from db.queries import get_report_data
from exporters.csv_exporter import build_csv
from exporters.excel_exporter import build_excel
from exporters.pdf_exporter import build_pdf

ALL_METRICS = [
    "request_volume",
    "status_breakdown",
    "sla_health",
    "team_performance",
    "service_type_breakdown",
]
VALID_METRICS = set(ALL_METRICS)

router = APIRouter(prefix="/export", tags=["export"])


class ExportRequest(BaseModel):
    from_date: date
    to_date: date
    metrics: list[str] = Field(default_factory=lambda: ALL_METRICS.copy())

    @field_validator("metrics")
    @classmethod
    def validate_metrics(cls, value: list[str]) -> list[str]:
        invalid = set(value) - VALID_METRICS
        if invalid:
            raise ValueError(f"Invalid metrics: {invalid}")
        return value


async def _do_export(request: Request, body: ExportRequest, x_tenant_id: str, fmt: str) -> StreamingResponse:
    if body.to_date < body.from_date:
        raise HTTPException(status_code=400, detail="to_date must be >= from_date")

    async with request.app.state.db_pool.acquire() as conn:
        data = await get_report_data(conn, x_tenant_id, body.from_date, body.to_date, body.metrics)

    filename = f"report_{body.from_date}_{body.to_date}.{fmt}"

    if fmt == "csv":
        buf = build_csv(data, body.from_date, body.to_date)
        media_type = "text/csv"
    elif fmt == "excel":
        buf = build_excel(data, body.from_date, body.to_date)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"report_{body.from_date}_{body.to_date}.xlsx"
    else:
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
) -> StreamingResponse:
    return await _do_export(request, body, x_tenant_id, "csv")


@router.post("/excel")
async def export_excel(
    body: ExportRequest,
    request: Request,
    x_tenant_id: str = Header(...),
) -> StreamingResponse:
    return await _do_export(request, body, x_tenant_id, "excel")


@router.post("/pdf")
async def export_pdf(
    body: ExportRequest,
    request: Request,
    x_tenant_id: str = Header(...),
) -> StreamingResponse:
    return await _do_export(request, body, x_tenant_id, "pdf")
