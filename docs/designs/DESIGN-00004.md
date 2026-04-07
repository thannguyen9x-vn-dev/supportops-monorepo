# DESIGN-00004 — Export Báo Cáo (CSV / Excel / PDF) — Trang Reports

> **Ngày tạo:** 2026-04-07
> **Tạo bởi:** Tech Lead Agent
> **Status:** Draft
> **Requirement:** [REQ-00004.md](../requirements/REQ-00004.md)
> **Task tracking:** [AGENT_TASKS.md](../AGENT_TASKS.md)

---

## 1. Overview

Tính năng này thêm trang Reports dành riêng cho TENANT_ADMIN, cho phép chọn date range và export dữ liệu vận hành ra 3 định dạng: CSV, Excel (nhiều sheet), và PDF. NestJS đóng vai proxy — verify JWT, inject `x-tenant-id`, rồi forward POST request sang FastAPI. FastAPI truy vấn DB qua `get_report_data()` (đã có) và stream file về client mà không buffer RAM. Không có migration DB vì toàn bộ là read-only.

---

## 2. API Design

### 2.1 Python Service — Endpoints mới (FastAPI)

> **Lưu ý:** Các endpoint Python này KHÔNG được expose trực tiếp ra internet. NestJS là gateway duy nhất.

```
POST /export/csv
POST /export/excel
POST /export/pdf

Auth: x-tenant-id header (injected by NestJS, not client)

Request Body (Pydantic model — ExportRequest):
{
  "from_date": "2026-01-01",     // ISO date string
  "to_date":   "2026-03-31",     // ISO date string
  "metrics": [                   // optional — default: tất cả 5 metrics
    "request_volume",
    "status_breakdown",
    "sla_health",
    "team_performance",
    "service_type_breakdown"
  ]
}

Response 200: StreamingResponse (binary file)
  Content-Type: text/csv | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | application/pdf
  Content-Disposition: attachment; filename="report_2026-01-01_2026-03-31.{ext}"

Response 400:
{
  "detail": "to_date must be >= from_date"
}

Response 422: (Pydantic validation — invalid metric name)
{
  "detail": [{ "loc": ["body", "metrics", 0], "msg": "value is not a valid enumeration member", ... }]
}
```

### 2.2 NestJS — Proxy Endpoints mới

```
POST /api/v1/export/csv
POST /api/v1/export/excel
POST /api/v1/export/pdf

Auth: Bearer JWT (required)
Guard: JwtAuthGuard + PermissionsGuard
Permission: report.export

Request Body: (pass-through — same as Python)
{
  "from_date": "2026-01-01",
  "to_date":   "2026-03-31",
  "metrics": ["request_volume", "status_breakdown", "sla_health", "team_performance", "service_type_breakdown"]
}

Response 200: binary stream (pipe từ Python response)
  Content-Type: forwarded from Python
  Content-Disposition: forwarded from Python

Response 400: { "error": { "code": "INVALID_DATE_RANGE", "message": "to_date must be >= from_date" } }
Response 403: { "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" } }
Response 504: { "error": { "code": "UPSTREAM_TIMEOUT", "message": "Export service timed out" } }
```

> **Lý do dùng POST thay vì GET:** File export có body (metrics list), và POST semantics phù hợp hơn với action tạo file. GET không có request body theo chuẩn HTTP.

### 2.3 Không có modified endpoints

---

## 3. Database Changes

**No migration required** — export hoàn toàn dùng `get_report_data()` đã có trong `apps/ai-service/db/queries.py`. Đây là read-only operation.

---

## 4. Types Contract

Thêm vào `packages/types/src/` trước khi implement:

```typescript
// packages/types/src/types/export.types.ts

export type ExportMetric =
  | 'request_volume'
  | 'status_breakdown'
  | 'sla_health'
  | 'team_performance'
  | 'service_type_breakdown'

export interface ExportReportRequest {
  from_date: string  // ISO date "YYYY-MM-DD"
  to_date: string    // ISO date "YYYY-MM-DD"
  metrics?: ExportMetric[]  // default: tất cả 5 metrics nếu không truyền
}

export const ALL_EXPORT_METRICS: ExportMetric[] = [
  'request_volume',
  'status_breakdown',
  'sla_health',
  'team_performance',
  'service_type_breakdown',
]
```

Thêm vào `packages/types/src/core/endpoints.ts`:

```typescript
// Thêm vào CORE_ENDPOINTS
EXPORT: {
  CSV:   '/export/csv',
  EXCEL: '/export/excel',
  PDF:   '/export/pdf',
},
```

Thêm vào `packages/types/src/index.ts` (barrel export):

```typescript
export type { ExportReportRequest, ExportMetric } from './types/export.types'
export { ALL_EXPORT_METRICS } from './types/export.types'
```

Thêm permission mới vào `packages/types/src/rbac.ts` (nếu file này tồn tại):

```typescript
// Thêm 'report.export' vào danh sách permissions
```

---

## 5. Frontend Architecture

### 5.1 Route & Page

```
apps/web/src/app/[locale]/(dashboard)/reports/
  ├── page.tsx          ← Server Component, ≤ 30 lines, render ReportsView
  ├── loading.tsx       ← Route-level skeleton
  └── error.tsx         ← Client error boundary
```

### 5.2 Component Tree

```
page.tsx (Server Component)
  └── ReportsView.tsx                    ← 'use client', orchestrator, ≤ 120 lines
      ├── ReportsHeader.tsx              ← Tiêu đề trang, mô tả, ≤ 40 lines
      ├── ReportsFilterPanel.tsx         ← Date picker (from/to) + metrics checkboxes, ≤ 100 lines
      └── ReportsExportActions.tsx       ← 3 nút export (CSV / Excel / PDF), loading state, ≤ 80 lines
```

**Responsibilities:**

| File | Responsibility | Size limit |
|---|---|---|
| `page.tsx` | Server entry, pass locale, check auth redirect | ≤ 30 lines |
| `ReportsView.tsx` | Client orchestrator — compose panels, inject hook | ≤ 120 lines |
| `ReportsHeader.tsx` | Title + description text (presentational) | ≤ 40 lines |
| `ReportsFilterPanel.tsx` | DatePicker `from_date`/`to_date` + metrics multi-select | ≤ 100 lines |
| `ReportsExportActions.tsx` | 3 nút export + per-button loading + error message | ≤ 80 lines |

### 5.3 Hook

```typescript
// apps/web/src/features/reports/hooks/useReports.ts — ≤ 120 lines

interface ReportsState {
  fromDate: string          // "YYYY-MM-DD"
  toDate: string            // "YYYY-MM-DD"
  selectedMetrics: ExportMetric[]
  isExportingCsv: boolean
  isExportingExcel: boolean
  isExportingPdf: boolean
  exportError: string | null
}

// Handlers:
// handleFromDateChange(date: string): void
// handleToDateChange(date: string): void
// handleMetricsChange(metrics: ExportMetric[]): void
// handleExportCsv(): Promise<void>
// handleExportExcel(): Promise<void>
// handleExportPdf(): Promise<void>
```

**Pattern download file:**
```typescript
const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
  const blob = await reportsService.export(format, { from_date, to_date, metrics })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report_${fromDate}_${toDate}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}
```

> Không dùng TanStack Query cho export — đây là imperative action, không phải data fetch. Dùng `useState` + async handler.

### 5.4 Service

```typescript
// apps/web/src/features/reports/services/reports.service.ts — ≤ 80 lines

import { apiClient } from '@/lib/api/apiClient'
import { ENDPOINTS } from '@supportops/types'
import type { ExportReportRequest } from '@supportops/types'

export const reportsService = {
  async exportCsv(payload: ExportReportRequest): Promise<Blob> {
    const response = await apiClient.post(ENDPOINTS.EXPORT.CSV, payload, {
      responseType: 'blob',
      timeout: 30_000,
    })
    return response.data
  },

  async exportExcel(payload: ExportReportRequest): Promise<Blob> {
    const response = await apiClient.post(ENDPOINTS.EXPORT.EXCEL, payload, {
      responseType: 'blob',
      timeout: 30_000,
    })
    return response.data
  },

  async exportPdf(payload: ExportReportRequest): Promise<Blob> {
    const response = await apiClient.post(ENDPOINTS.EXPORT.PDF, payload, {
      responseType: 'blob',
      timeout: 30_000,
    })
    return response.data
  },
}
```

### 5.5 i18n keys (thêm vào en.json và vi.json)

```json
// en.json — thêm block "reports"
"reports": {
  "pageTitle": "Reports",
  "pageDescription": "Export operational data for your tenant",
  "filters": {
    "fromDate": "From Date",
    "toDate": "To Date",
    "metrics": "Metrics to Include",
    "allMetrics": "All Metrics"
  },
  "metrics": {
    "request_volume": "Request Volume",
    "status_breakdown": "Status Breakdown",
    "sla_health": "SLA Health",
    "team_performance": "Team Performance",
    "service_type_breakdown": "Service Type Breakdown"
  },
  "actions": {
    "exportCsv": "Export CSV",
    "exportExcel": "Export Excel",
    "exportPdf": "Export PDF",
    "exporting": "Exporting..."
  },
  "errors": {
    "invalidDateRange": "End date must be on or after start date",
    "exportFailed": "Export failed. Please try again."
  }
}
```

---

## 6. Backend Design (NestJS)

### 6.1 Module structure

```
apps/api/src/modules/export/
├── export.module.ts
├── export.controller.ts
├── export.service.ts
└── dto/
    └── export-report.dto.ts
```

### 6.2 DTO

```typescript
// export-report.dto.ts
import { IsArray, IsDateString, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

enum ExportMetric {
  REQUEST_VOLUME       = 'request_volume',
  STATUS_BREAKDOWN     = 'status_breakdown',
  SLA_HEALTH           = 'sla_health',
  TEAM_PERFORMANCE     = 'team_performance',
  SERVICE_TYPE_BREAKDOWN = 'service_type_breakdown',
}

export class ExportReportDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  from_date: string

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  to_date: string

  @ApiPropertyOptional({ enum: ExportMetric, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ExportMetric, { each: true })
  metrics?: ExportMetric[]
}
```

### 6.3 Controller (thin)

```typescript
// export.controller.ts
@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('csv')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as CSV' })
  async exportCsv(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'csv', res)
  }

  @Post('excel')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as Excel' })
  async exportExcel(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'excel', res)
  }

  @Post('pdf')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as PDF' })
  async exportPdf(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'pdf', res)
  }
}
```

### 6.4 Service (proxy + stream)

```typescript
// export.service.ts
@Injectable()
export class ExportService {
  private readonly pythonBaseUrl: string
  private readonly httpService: HttpService  // @nestjs/axios

  async proxyExport(
    tenantId: string,
    dto: ExportReportDto,
    format: 'csv' | 'excel' | 'pdf',
    res: Response,
  ): Promise<void> {
    // 1. Validate date range
    if (dto.to_date < dto.from_date) {
      throw new BadRequestException('INVALID_DATE_RANGE', 'to_date must be >= from_date')
    }

    // 2. Default metrics nếu không truyền
    const metrics = dto.metrics ?? ALL_METRICS

    // 3. Forward sang Python với x-tenant-id header
    const pythonResponse = await this.httpService.axiosRef.post(
      `${this.pythonBaseUrl}/export/${format}`,
      { from_date: dto.from_date, to_date: dto.to_date, metrics },
      {
        headers: { 'x-tenant-id': tenantId },
        responseType: 'stream',
        timeout: 30_000,
      },
    )

    // 4. Forward headers + pipe stream
    res.setHeader('Content-Type', pythonResponse.headers['content-type'])
    res.setHeader('Content-Disposition', pythonResponse.headers['content-disposition'])
    pythonResponse.data.pipe(res)
  }
}
```

### 6.5 Permission mới

Thêm `report.export` permission vào seed hoặc migration data (không phải schema migration):

```typescript
// apps/api/prisma/seed.ts — thêm vào AuthPermission seed:
{ code: 'report.export', description: 'Export operational reports' }

// Gán cho role TENANT_ADMIN trong AuthRolePermission seed
```

---

## 7. Python Service Design

### 7.1 Exporter files cần tạo

```
apps/ai-service/exporters/
├── __init__.py          (đã có)
├── csv_exporter.py      (đã có — dùng ngay)
├── excel_exporter.py    (NEW — openpyxl)
└── pdf_exporter.py      (NEW — fpdf2 + DejaVu font để support Unicode)
```

### 7.2 Excel exporter — Sheet structure

```
Sheet: Summary
  - Tiêu đề, period, tổng request volume, SLA compliance rate

Sheet: Status Breakdown
  - Columns: Status | Count
  - Header row: bold, màu #4472C4, font trắng

Sheet: SLA Health
  - Columns: Metric | Value
  - Rows: Total SLA Records, Breached, Compliance Rate (%)

Sheet: Team Performance
  - Columns: Technician | Assigned | Resolved
  - Sort: resolved desc (đã sort từ query)

Sheet: Service Types
  - Columns: Service Type | Count
```

### 7.3 PDF exporter — Decision về font

> **Decision:** Dùng `fpdf2` + embed **DejaVu Sans** font (TTF, free, bundled trong repo tại `apps/ai-service/fonts/DejaVuSans.ttf`). DejaVu support Latin + Vietnamese characters (precomposed). Không dùng `reportlab` để tránh thêm dependency nặng.

```python
# pdf_exporter.py structure
from fpdf import FPDF

class ReportPDF(FPDF):
    def header(self): ...   # tenant name + period
    def section_title(self, title: str): ...
    def data_table(self, headers: list[str], rows: list[list]): ...
```

### 7.4 Export router

```python
# apps/ai-service/routers/export.py
from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from typing import Literal
from datetime import date
from db.queries import get_report_data
from exporters.csv_exporter import build_csv
from exporters.excel_exporter import build_excel
from exporters.pdf_exporter import build_pdf

VALID_METRICS = {
    "request_volume", "status_breakdown", "sla_health",
    "team_performance", "service_type_breakdown"
}
ALL_METRICS = list(VALID_METRICS)

router = APIRouter(prefix="/export", tags=["export"])

class ExportRequest(BaseModel):
    from_date: date
    to_date: date
    metrics: list[str] = ALL_METRICS

    @field_validator("metrics")
    @classmethod
    def validate_metrics(cls, v):
        invalid = set(v) - VALID_METRICS
        if invalid:
            raise ValueError(f"Invalid metrics: {invalid}")
        return v

@router.post("/csv")
async def export_csv(body: ExportRequest, request: Request, x_tenant_id: str = Header(...)):
    if body.to_date < body.from_date:
        raise HTTPException(400, "to_date must be >= from_date")
    async with request.app.state.db_pool.acquire() as conn:
        data = await get_report_data(conn, x_tenant_id, body.from_date, body.to_date, body.metrics)
    buf = build_csv(data, body.from_date, body.to_date)
    filename = f"report_{body.from_date}_{body.to_date}.csv"
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

# Tương tự cho /excel và /pdf
```

### 7.5 requirements.txt — thêm

```
openpyxl>=3.1.0
fpdf2>=2.7.0
```

---

## 8. Navigation — thêm route Reports

```typescript
// apps/web/src/features/layout/config/navigation.tsx
// Thêm vào group "nav.main", sau "nav.dashboard":
{
  label: "nav.reports",
  href: "/reports",
  icon: <BarChartOutlinedIcon fontSize="small" />,
  allowedRoles: ["TENANT_ADMIN"],
},
```

i18n keys cần thêm:

```json
// en.json: "nav": { "reports": "Reports" }
// vi.json: "nav": { "reports": "Báo cáo" }
```

---

## 9. Implementation Order

> Thực hiện theo thứ tự này để tránh breaking changes:

1. [ ] **Step 1 — Types:** Thêm `ExportReportRequest`, `ExportMetric`, `ALL_EXPORT_METRICS` vào `packages/types/src/types/export.types.ts`; thêm `EXPORT` key vào `CORE_ENDPOINTS`; export từ `index.ts`
2. [ ] **Step 2 — Python exporters:** Tạo `excel_exporter.py` và `pdf_exporter.py`; download DejaVu font vào `apps/ai-service/fonts/`; cập nhật `requirements.txt`
3. [ ] **Step 3 — Python router:** Tạo `apps/ai-service/routers/export.py`; mount vào `main.py` (`app.include_router(export_router)`)
4. [ ] **Step 4 — NestJS permission:** Thêm `report.export` vào seed data và gán cho `TENANT_ADMIN` role
5. [ ] **Step 5 — NestJS module:** Tạo `apps/api/src/modules/export/` (dto + controller + service + module); import `ExportModule` vào `app.module.ts`; thêm `@nestjs/axios` nếu chưa có
6. [ ] **Step 6 — Frontend service + hook:** Tạo `features/reports/services/reports.service.ts` và `features/reports/hooks/useReports.ts`
7. [ ] **Step 7 — Frontend components:** Tạo `ReportsView`, `ReportsHeader`, `ReportsFilterPanel`, `ReportsExportActions`
8. [ ] **Step 8 — Route + navigation:** Tạo `app/[locale]/(dashboard)/reports/page.tsx`; cập nhật `navigation.tsx`; thêm i18n keys
9. [ ] **Step 9 — E2E smoke test:** Gọi POST /api/v1/export/csv với JWT của TENANT_ADMIN, verify Content-Disposition header và file hợp lệ

---

## 10. Testing Plan

### 10.1 Python — Unit Tests (pytest)

| Test case | Expected |
|---|---|
| `build_csv` với data đầy đủ | StringIO chứa 5 sections, đúng header row |
| `build_csv` với data rỗng (0 records) | File hợp lệ, chỉ có metadata header, không crash |
| `build_excel` với 5 metrics | Workbook có 6 sheets (Summary + 5 metrics) |
| `build_excel` — Summary sheet | Row 1 có total request count |
| `build_pdf` với Vietnamese text | Không raise font error |
| `POST /export/csv` — to_date < from_date | HTTP 400 với message rõ ràng |
| `POST /export/csv` — invalid metric name | HTTP 422 Pydantic validation error |
| `POST /export/csv` — thiếu x-tenant-id | HTTP 422 (Header required) |
| `POST /export/csv` — happy path | StreamingResponse, Content-Disposition đúng format |
| Tenant isolation | Tenant A không thấy data của Tenant B (verify SQL WHERE clause) |

### 10.2 NestJS — Service/Controller Tests

| Test case | Expected |
|---|---|
| `exportService.proxyExport` — to_date < from_date | throw `BadRequestException('INVALID_DATE_RANGE')` |
| `exportService.proxyExport` — Python timeout (mock) | throw `GatewayTimeoutException` hoặc pipe error |
| Controller `POST /export/csv` — missing auth | 401 (JwtAuthGuard) |
| Controller `POST /export/csv` — role không phải TENANT_ADMIN | 403 (PermissionsGuard) |
| Controller `POST /export/csv` — valid TENANT_ADMIN | Gọi `exportService.proxyExport` với đúng args |
| tenantId lấy từ JWT, KHÔNG từ body | Header `x-tenant-id` forward đúng tenant |

### 10.3 Frontend — Component Tests

| Component | Test cases |
|---|---|
| `ReportsFilterPanel` | Render date pickers; to_date < from_date → hiện error; thay đổi metrics → update state |
| `ReportsExportActions` | Render 3 nút; click CSV → gọi `handleExportCsv`; loading state khi exporting; error message khi fail |
| `useReports` hook | Default state đúng; handleExportCsv gọi `reportsService.exportCsv`; set isExportingCsv true khi pending |

---

## 11. Risks & Constraints

| Risk | Mức độ | Mitigation |
|---|---|---|
| `fpdf2` + DejaVu font không render tiếng Việt đúng | High | Test với sample Vietnamese text trong CI; nếu vẫn lỗi → fallback sang `reportlab` (cần evaluate trước khi implement) |
| Python service timeout khi export 10k records trong 30s | Med | `StreamingResponse` — không buffer toàn bộ; set timeout 30s cả NestJS lẫn Python httpx; monitor với sample load |
| `@nestjs/axios` chưa có trong `apps/api` | Low | Kiểm tra `package.json` trước; nếu chưa có thì `pnpm add @nestjs/axios axios` |
| NestJS `ResponseTransformInterceptor` wrap binary response | High | Export endpoints phải dùng `@Res()` + raw `res.pipe()` để bypass interceptor hoàn toàn |
| DejaVu font file chưa có trong repo | Med | Tải từ nguồn chính thức (DejaVu project, SIL license) và commit vào `apps/ai-service/fonts/` |
| Metrics mặc định (all 5) — query chậm nếu data lớn | Low | `NFR-001` cho phép 10s với 10k records; `get_report_data` dùng GROUP BY — efficient |
| Permission `report.export` chưa tồn tại trong RBAC | Med | Thêm vào seed script (Step 4) trước khi implement NestJS controller |

---

## 12. Forbidden Actions

- [ ] KHÔNG tạo migration schema mới — export là read-only
- [ ] KHÔNG sửa `get_report_data()` trong `db/queries.py` — đủ data rồi
- [ ] KHÔNG expose Python service trực tiếp ra ngoài — luôn qua NestJS proxy
- [ ] KHÔNG tin `tenantId` từ request body — luôn lấy từ `@CurrentTenant()` decorator (JWT)
- [ ] KHÔNG bỏ `@Permissions({ all: ['report.export'] })` trên export endpoints
- [ ] KHÔNG buffer toàn bộ file trong RAM — dùng `StreamingResponse` / pipe
- [ ] KHÔNG sửa legacy modules (`product`, `kanban`, `billing`, v.v.)
- [ ] KHÔNG thêm biểu đồ/chart vào PDF (out of scope theo REQ)
- [ ] KHÔNG để `ResponseTransformInterceptor` wrap binary response — dùng `@Res()` để bypass
