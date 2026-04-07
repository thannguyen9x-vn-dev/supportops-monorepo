"""CSV export — converts report data dict to a multi-section CSV file.

Why multi-section instead of one flat table?
  Each metric has a different shape (dict vs list), so we separate them
  with section headers. Excel/Google Sheets can still open this fine.
"""

import csv
import io
from datetime import date


def build_csv(data: dict, from_date: date, to_date: date) -> io.StringIO:
    """Return a StringIO containing the full CSV content.

    The caller is responsible for seeking to 0 before reading.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Document metadata — makes the file self-describing when opened standalone
    writer.writerow(["SupportOps Operational Report"])
    writer.writerow(["Period", f"{from_date} to {to_date}"])
    writer.writerow([])  # blank spacer row

    # ── Request Volume ────────────────────────────────────────────────────────
    if "request_volume" in data:
        vol = data["request_volume"]
        writer.writerow(["=== Request Volume ==="])
        writer.writerow(["Total Requests"])
        writer.writerow([vol["total"]])
        writer.writerow([])

    # ── Status Breakdown ──────────────────────────────────────────────────────
    # data["status_breakdown"] = {"OPEN": 10, "IN_PROGRESS": 3, "CLOSED": 7, ...}
    if "status_breakdown" in data:
        writer.writerow(["=== Status Breakdown ==="])
        writer.writerow(["Status", "Count"])
        for status, count in data["status_breakdown"].items():
            writer.writerow([status, count])
        writer.writerow([])

    # ── SLA Health ────────────────────────────────────────────────────────────
    if "sla_health" in data:
        sla = data["sla_health"]
        writer.writerow(["=== SLA Health ==="])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total SLA Records", sla["total"]])
        writer.writerow(["Breached", sla["breached"]])
        writer.writerow(["Compliance Rate (%)", sla["compliance_rate_pct"]])
        writer.writerow([])

    # ── Team Performance ──────────────────────────────────────────────────────
    # data["team_performance"] = [{"technician": "...", "assigned": 5, "resolved": 3}, ...]
    if "team_performance" in data:
        writer.writerow(["=== Team Performance ==="])
        writer.writerow(["Technician", "Assigned", "Resolved"])
        for row in data["team_performance"]:
            writer.writerow([row["technician"], row["assigned"], row["resolved"]])
        writer.writerow([])

    # ── Service Type Breakdown ────────────────────────────────────────────────
    if "service_type_breakdown" in data:
        writer.writerow(["=== Service Type Breakdown ==="])
        writer.writerow(["Service Type", "Count"])
        for row in data["service_type_breakdown"]:
            writer.writerow([row["service_type"], row["count"]])
        writer.writerow([])

    output.seek(0)
    return output
