"""Read-only database queries for AI service.

All queries are scoped to tenantId received from NestJS header.
This module never performs INSERT / UPDATE / DELETE.
"""

import asyncpg
from datetime import date, datetime, timezone


async def get_report_data(
    conn: asyncpg.Connection,
    tenant_id: str,
    from_date: date,
    to_date: date,
    metrics: list[str],
) -> dict:
    """Fetch operational data for the given tenant and date range.

    Args:
        conn: asyncpg connection (read-only intent).
        tenant_id: Scoped tenant — injected by NestJS, never trusted from client.
        from_date: Start of date range (inclusive, UTC midnight).
        to_date: End of date range (inclusive, UTC 23:59:59).
        metrics: List of metric keys to include in the response.

    Returns:
        dict with requested metric data.
    """
    from_dt = datetime(from_date.year, from_date.month, from_date.day, 0, 0, 0, tzinfo=timezone.utc)
    to_dt = datetime(to_date.year, to_date.month, to_date.day, 23, 59, 59, tzinfo=timezone.utc)

    result: dict = {}

    if "request_volume" in metrics or "status_breakdown" in metrics:
        rows = await conn.fetch(
            """
            SELECT status, COUNT(*) AS count
            FROM "ServiceRequest"
            WHERE "tenantId" = $1
              AND "createdAt" >= $2
              AND "createdAt" <= $3
            GROUP BY status
            """,
            tenant_id,
            from_dt,
            to_dt,
        )
        status_breakdown = {row["status"]: row["count"] for row in rows}
        total = sum(status_breakdown.values())

        if "request_volume" in metrics:
            result["request_volume"] = {"total": total, "period": {"from": str(from_date), "to": str(to_date)}}

        if "status_breakdown" in metrics:
            result["status_breakdown"] = status_breakdown

    if "sla_health" in metrics:
        rows = await conn.fetch(
            """
            SELECT
                sr."isBreached",
                COUNT(*) AS count
            FROM "SlaRecord" sr
            JOIN "ServiceRequest" req ON req.id = sr."requestId"
            WHERE sr."tenantId" = $1
              AND req."createdAt" >= $2
              AND req."createdAt" <= $3
            GROUP BY sr."isBreached"
            """,
            tenant_id,
            from_dt,
            to_dt,
        )
        total_sla = sum(row["count"] for row in rows)
        breached = next((row["count"] for row in rows if row["isBreached"]), 0)
        compliance_rate = round((total_sla - breached) / total_sla * 100, 2) if total_sla > 0 else 100.0
        result["sla_health"] = {
            "total": total_sla,
            "breached": breached,
            "compliance_rate_pct": compliance_rate,
        }

    if "team_performance" in metrics:
        rows = await conn.fetch(
            """
            SELECT
                u."firstName" || ' ' || u."lastName" AS technician_name,
                COUNT(req.id) AS assigned_count,
                COUNT(CASE WHEN req.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved_count
            FROM "ServiceRequest" req
            JOIN "User" u ON u.id = req."assigneeId"
            WHERE req."tenantId" = $1
              AND req."createdAt" >= $2
              AND req."createdAt" <= $3
              AND req."assigneeId" IS NOT NULL
            GROUP BY req."assigneeId", u."firstName", u."lastName"
            ORDER BY resolved_count DESC
            LIMIT 10
            """,
            tenant_id,
            from_dt,
            to_dt,
        )
        result["team_performance"] = [
            {
                "technician": row["technician_name"],
                "assigned": row["assigned_count"],
                "resolved": row["resolved_count"],
            }
            for row in rows
        ]

    if "service_type_breakdown" in metrics:
        rows = await conn.fetch(
            """
            SELECT
                st.name AS service_type,
                COUNT(req.id) AS count
            FROM "ServiceRequest" req
            JOIN "ServiceType" st ON st.id = req."serviceTypeId"
            WHERE req."tenantId" = $1
              AND req."createdAt" >= $2
              AND req."createdAt" <= $3
            GROUP BY st.id, st.name
            ORDER BY count DESC
            """,
            tenant_id,
            from_dt,
            to_dt,
        )
        result["service_type_breakdown"] = [
            {"service_type": row["service_type"], "count": row["count"]} for row in rows
        ]

    return result
