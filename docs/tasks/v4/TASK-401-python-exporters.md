# TASK-401 — Python: excel_exporter.py + pdf_exporter.py + DejaVu font
> **Phase:** 2 — Python Service | **Prereq:** none | **Status:** ⏳ Pending

## Mục tiêu
Tạo 2 exporter mới cho Excel và PDF trong `apps/ai-service/exporters/`. `csv_exporter.py` đã có sẵn — KHÔNG sửa. Tải DejaVu font để hỗ trợ tiếng Việt trong PDF.

## Files cần tạo / sửa

```text
apps/ai-service/exporters/excel_exporter.py     ← NEW (openpyxl)
apps/ai-service/exporters/pdf_exporter.py       ← NEW (fpdf2 + DejaVu)
apps/ai-service/fonts/DejaVuSans.ttf            ← NEW (download, commit vào repo)
apps/ai-service/requirements.txt               ← MODIFIED (thêm openpyxl, fpdf2)
```

## Spec chi tiết

### 1. `requirements.txt` — thêm 2 dòng

```
openpyxl>=3.1.0
fpdf2>=2.7.0
```

### 2. Download DejaVu font

```bash
# Tải từ nguồn chính thức (SIL license, free)
# URL: https://sourceforge.net/projects/dejavu/files/dejavu/2.37/dejavu-fonts-ttf-2.37.tar.bz2
# Giải nén lấy DejaVuSans.ttf, đặt vào:
mkdir -p apps/ai-service/fonts
cp DejaVuSans.ttf apps/ai-service/fonts/DejaVuSans.ttf
```

Commit font file vào repo (kích thước ~756KB, chấp nhận được).

### 3. `excel_exporter.py`

Data shape nhận vào từ `get_report_data()` (xem `apps/ai-service/db/queries.py`):
```python
data = {
    "request_volume": int,
    "status_breakdown": [{"status": str, "count": int}, ...],
    "sla_health": {"total": int, "breached": int, "compliance_rate": float},
    "team_performance": [{"technician": str, "assigned": int, "resolved": int}, ...],
    "service_type_breakdown": [{"service_type": str, "count": int}, ...],
}
```

```python
# apps/ai-service/exporters/excel_exporter.py
import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from datetime import date

HEADER_FONT = Font(bold=True, color="FFFFFF")
HEADER_FILL = PatternFill(fill_type="solid", fgColor="4472C4")


def _apply_header(ws, headers: list[str]):
    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center")


def build_excel(data: dict, from_date: date, to_date: date) -> io.BytesIO:
    wb = Workbook()

    # Sheet: Summary
    ws_summary = wb.active
    ws_summary.title = "Summary"
    ws_summary["A1"] = "SupportOps Report"
    ws_summary["A2"] = f"Period: {from_date} → {to_date}"
    ws_summary["A4"] = "Total Request Volume"
    ws_summary["B4"] = data.get("request_volume", 0)
    sla = data.get("sla_health", {})
    ws_summary["A5"] = "SLA Compliance Rate (%)"
    ws_summary["B5"] = sla.get("compliance_rate", 0)

    # Sheet: Status Breakdown
    ws_status = wb.create_sheet("Status Breakdown")
    _apply_header(ws_status, ["Status", "Count"])
    for i, row in enumerate(data.get("status_breakdown", []), 2):
        ws_status.cell(row=i, column=1, value=row.get("status", ""))
        ws_status.cell(row=i, column=2, value=row.get("count", 0))

    # Sheet: SLA Health
    ws_sla = wb.create_sheet("SLA Health")
    _apply_header(ws_sla, ["Metric", "Value"])
    ws_sla.cell(row=2, column=1, value="Total SLA Records")
    ws_sla.cell(row=2, column=2, value=sla.get("total", 0))
    ws_sla.cell(row=3, column=1, value="Breached")
    ws_sla.cell(row=3, column=2, value=sla.get("breached", 0))
    ws_sla.cell(row=4, column=1, value="Compliance Rate (%)")
    ws_sla.cell(row=4, column=2, value=sla.get("compliance_rate", 0))

    # Sheet: Team Performance
    ws_team = wb.create_sheet("Team Performance")
    _apply_header(ws_team, ["Technician", "Assigned", "Resolved"])
    for i, row in enumerate(data.get("team_performance", []), 2):
        ws_team.cell(row=i, column=1, value=row.get("technician", ""))
        ws_team.cell(row=i, column=2, value=row.get("assigned", 0))
        ws_team.cell(row=i, column=3, value=row.get("resolved", 0))

    # Sheet: Service Types
    ws_svc = wb.create_sheet("Service Types")
    _apply_header(ws_svc, ["Service Type", "Count"])
    for i, row in enumerate(data.get("service_type_breakdown", []), 2):
        ws_svc.cell(row=i, column=1, value=row.get("service_type", ""))
        ws_svc.cell(row=i, column=2, value=row.get("count", 0))

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf
```

### 4. `pdf_exporter.py`

```python
# apps/ai-service/exporters/pdf_exporter.py
import io
import os
from fpdf import FPDF
from datetime import date

FONT_PATH = os.path.join(os.path.dirname(__file__), "..", "fonts", "DejaVuSans.ttf")


class ReportPDF(FPDF):
    def __init__(self, from_date: date, to_date: date):
        super().__init__()
        self.from_date = from_date
        self.to_date = to_date
        self.add_font("DejaVu", "", FONT_PATH, uni=True)
        self.set_font("DejaVu", size=10)

    def header(self):
        self.set_font("DejaVu", size=14)
        self.cell(0, 10, "SupportOps Report", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("DejaVu", size=10)
        self.cell(0, 8, f"Period: {self.from_date} to {self.to_date}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)

    def section_title(self, title: str):
        self.set_font("DejaVu", size=12)
        self.set_fill_color(68, 114, 196)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, title, fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
        self.set_font("DejaVu", size=10)
        self.ln(2)

    def data_table(self, headers: list[str], rows: list[list]):
        col_w = (self.w - self.l_margin - self.r_margin) / max(len(headers), 1)
        # Header row
        self.set_fill_color(220, 230, 241)
        for h in headers:
            self.cell(col_w, 7, str(h), border=1, fill=True)
        self.ln()
        # Data rows
        for row in rows:
            for val in row:
                self.cell(col_w, 6, str(val) if val is not None else "", border=1)
            self.ln()
        self.ln(3)


def build_pdf(data: dict, from_date: date, to_date: date) -> io.BytesIO:
    pdf = ReportPDF(from_date, to_date)
    pdf.add_page()

    # Request Volume
    pdf.section_title("Request Volume")
    pdf.data_table(["Metric", "Value"], [["Total Requests", data.get("request_volume", 0)]])

    # Status Breakdown
    pdf.section_title("Status Breakdown")
    rows = [[r.get("status", ""), r.get("count", 0)] for r in data.get("status_breakdown", [])]
    pdf.data_table(["Status", "Count"], rows or [["(no data)", ""]])

    # SLA Health
    sla = data.get("sla_health", {})
    pdf.section_title("SLA Health")
    pdf.data_table(
        ["Metric", "Value"],
        [
            ["Total SLA Records", sla.get("total", 0)],
            ["Breached", sla.get("breached", 0)],
            ["Compliance Rate (%)", sla.get("compliance_rate", 0)],
        ],
    )

    # Team Performance
    pdf.section_title("Team Performance")
    rows = [[r.get("technician", ""), r.get("assigned", 0), r.get("resolved", 0)] for r in data.get("team_performance", [])]
    pdf.data_table(["Technician", "Assigned", "Resolved"], rows or [["(no data)", "", ""]])

    # Service Type Breakdown
    pdf.section_title("Service Type Breakdown")
    rows = [[r.get("service_type", ""), r.get("count", 0)] for r in data.get("service_type_breakdown", [])]
    pdf.data_table(["Service Type", "Count"], rows or [["(no data)", ""]])

    buf = io.BytesIO(pdf.output())
    return buf
```

## Quality gate

```bash
# Từ thư mục gốc repo:
cd apps/ai-service

# Cài deps (nếu chưa có)
pip install openpyxl fpdf2

# Smoke test manual — chạy Python shell
python3 -c "
from exporters.excel_exporter import build_excel
from exporters.pdf_exporter import build_pdf
from datetime import date

sample = {
    'request_volume': 42,
    'status_breakdown': [{'status': 'OPEN', 'count': 20}, {'status': 'CLOSED', 'count': 22}],
    'sla_health': {'total': 42, 'breached': 5, 'compliance_rate': 88.1},
    'team_performance': [{'technician': 'Nguyễn Văn A', 'assigned': 10, 'resolved': 9}],
    'service_type_breakdown': [{'service_type': 'IT Support', 'count': 30}],
}
buf_excel = build_excel(sample, date(2026,1,1), date(2026,3,31))
buf_pdf = build_pdf(sample, date(2026,1,1), date(2026,3,31))
print('Excel bytes:', len(buf_excel.read()))
print('PDF bytes:', len(buf_pdf.read()))
print('OK')
"
# Expected: không có exception, in ra bytes > 0
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-402**
