import io
import os
from datetime import date

from fpdf import FPDF

FONT_PATH = os.path.join(os.path.dirname(__file__), "..", "fonts", "DejaVuSans.ttf")


class ReportPDF(FPDF):
    def __init__(self, from_date: date, to_date: date):
        super().__init__()
        self.from_date = from_date
        self.to_date = to_date
        self.add_font("DejaVu", "", FONT_PATH)
        self.set_font("DejaVu", size=10)

    def header(self) -> None:
        self.set_font("DejaVu", size=14)
        self.cell(0, 10, "SupportOps Report", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("DejaVu", size=10)
        self.cell(
            0,
            8,
            f"Period: {self.from_date} to {self.to_date}",
            align="C",
            new_x="LMARGIN",
            new_y="NEXT",
        )
        self.ln(4)

    def section_title(self, title: str) -> None:
        self.set_font("DejaVu", size=12)
        self.set_fill_color(68, 114, 196)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, title, fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
        self.set_font("DejaVu", size=10)
        self.ln(2)

    def data_table(self, headers: list[str], rows: list[list]) -> None:
        col_w = (self.w - self.l_margin - self.r_margin) / max(len(headers), 1)
        self.set_fill_color(220, 230, 241)
        for header in headers:
            self.cell(col_w, 7, str(header), border=1, fill=True)
        self.ln()
        for row in rows:
            for value in row:
                self.cell(col_w, 6, str(value) if value is not None else "", border=1)
            self.ln()
        self.ln(3)


def build_pdf(data: dict, from_date: date, to_date: date) -> io.BytesIO:
    pdf = ReportPDF(from_date, to_date)
    pdf.add_page()

    request_volume = data.get("request_volume", {})
    total_requests = request_volume.get("total", 0) if isinstance(request_volume, dict) else request_volume
    pdf.section_title("Request Volume")
    pdf.data_table(["Metric", "Value"], [["Total Requests", total_requests]])

    pdf.section_title("Status Breakdown")
    status_breakdown = data.get("status_breakdown", {})
    if isinstance(status_breakdown, dict):
        status_rows = [[status, count] for status, count in status_breakdown.items()]
    else:
        status_rows = [[row.get("status", ""), row.get("count", 0)] for row in status_breakdown]
    pdf.data_table(["Status", "Count"], status_rows or [["(no data)", ""]])

    sla = data.get("sla_health", {})
    pdf.section_title("SLA Health")
    pdf.data_table(
        ["Metric", "Value"],
        [
            ["Total SLA Records", sla.get("total", 0)],
            ["Breached", sla.get("breached", 0)],
            ["Compliance Rate (%)", sla.get("compliance_rate_pct", sla.get("compliance_rate", 0))],
        ],
    )

    pdf.section_title("Team Performance")
    team_rows = [
        [row.get("technician", ""), row.get("assigned", 0), row.get("resolved", 0)]
        for row in data.get("team_performance", [])
    ]
    pdf.data_table(["Technician", "Assigned", "Resolved"], team_rows or [["(no data)", "", ""]])

    pdf.section_title("Service Type Breakdown")
    service_rows = [
        [row.get("service_type", ""), row.get("count", 0)] for row in data.get("service_type_breakdown", [])
    ]
    pdf.data_table(["Service Type", "Count"], service_rows or [["(no data)", ""]])

    buf = io.BytesIO(bytes(pdf.output()))
    buf.seek(0)
    return buf
