from datetime import date
from unittest.mock import AsyncMock

from db.queries import get_report_data


def _make_conn_with_rows(rows: list[dict]) -> AsyncMock:
    conn = AsyncMock()
    conn.fetch = AsyncMock(return_value=rows)
    return conn


def _make_conn_with_side_effect(side_effect) -> AsyncMock:  # type: ignore[no-untyped-def]
    conn = AsyncMock()
    conn.fetch = AsyncMock(side_effect=side_effect)
    return conn


def _assert_tenant_id_in_every_fetch(conn: AsyncMock, tenant_id: str) -> None:
    assert conn.fetch.call_count > 0
    for call in conn.fetch.call_args_list:
        assert call.args[1] == tenant_id


async def test_get_report_data_request_volume_metric() -> None:
    conn = _make_conn_with_rows(
        [
            {"status": "SUBMITTED", "count": 3},
            {"status": "RESOLVED", "count": 2},
        ]
    )

    result = await get_report_data(
        conn=conn,
        tenant_id="tenant-a",
        from_date=date(2026, 1, 1),
        to_date=date(2026, 1, 31),
        metrics=["request_volume"],
    )

    assert result == {
        "request_volume": {
            "total": 5,
            "period": {"from": "2026-01-01", "to": "2026-01-31"},
        }
    }
    _assert_tenant_id_in_every_fetch(conn, "tenant-a")


async def test_get_report_data_status_breakdown_metric() -> None:
    conn = _make_conn_with_rows(
        [
            {"status": "SUBMITTED", "count": 4},
            {"status": "IN_PROGRESS", "count": 1},
        ]
    )

    result = await get_report_data(
        conn=conn,
        tenant_id="tenant-b",
        from_date=date(2026, 2, 1),
        to_date=date(2026, 2, 28),
        metrics=["status_breakdown"],
    )

    assert result == {"status_breakdown": {"SUBMITTED": 4, "IN_PROGRESS": 1}}
    _assert_tenant_id_in_every_fetch(conn, "tenant-b")


async def test_get_report_data_sla_health_metric() -> None:
    conn = _make_conn_with_rows(
        [
            {"isBreached": False, "count": 9},
            {"isBreached": True, "count": 1},
        ]
    )

    result = await get_report_data(
        conn=conn,
        tenant_id="tenant-c",
        from_date=date(2026, 3, 1),
        to_date=date(2026, 3, 31),
        metrics=["sla_health"],
    )

    assert result["sla_health"]["total"] == 10
    assert result["sla_health"]["breached"] == 1
    assert result["sla_health"]["compliance_rate_pct"] == 90.0
    _assert_tenant_id_in_every_fetch(conn, "tenant-c")


async def test_get_report_data_team_performance_metric() -> None:
    conn = _make_conn_with_rows(
        [
            {"technician_name": "Alice Nguyen", "assigned_count": 7, "resolved_count": 5},
            {"technician_name": "Bob Tran", "assigned_count": 3, "resolved_count": 2},
        ]
    )

    result = await get_report_data(
        conn=conn,
        tenant_id="tenant-d",
        from_date=date(2026, 4, 1),
        to_date=date(2026, 4, 30),
        metrics=["team_performance"],
    )

    assert result == {
        "team_performance": [
            {"technician": "Alice Nguyen", "assigned": 7, "resolved": 5},
            {"technician": "Bob Tran", "assigned": 3, "resolved": 2},
        ]
    }
    _assert_tenant_id_in_every_fetch(conn, "tenant-d")


async def test_get_report_data_service_type_breakdown_metric() -> None:
    conn = _make_conn_with_rows(
        [
            {"service_type": "Laptop Support", "count": 6},
            {"service_type": "Account Access", "count": 2},
        ]
    )

    result = await get_report_data(
        conn=conn,
        tenant_id="tenant-e",
        from_date=date(2026, 5, 1),
        to_date=date(2026, 5, 31),
        metrics=["service_type_breakdown"],
    )

    assert result == {
        "service_type_breakdown": [
            {"service_type": "Laptop Support", "count": 6},
            {"service_type": "Account Access", "count": 2},
        ]
    }
    _assert_tenant_id_in_every_fetch(conn, "tenant-e")


async def test_get_report_data_multiple_metrics_and_empty_results() -> None:
    fetch_results = [
        [],
        [],
        [],
        [],
    ]
    conn = _make_conn_with_side_effect(fetch_results)

    result = await get_report_data(
        conn=conn,
        tenant_id="tenant-z",
        from_date=date(2026, 6, 1),
        to_date=date(2026, 6, 30),
        metrics=[
            "request_volume",
            "status_breakdown",
            "sla_health",
            "team_performance",
            "service_type_breakdown",
        ],
    )

    assert result["request_volume"]["total"] == 0
    assert result["status_breakdown"] == {}
    assert result["sla_health"] == {"total": 0, "breached": 0, "compliance_rate_pct": 100.0}
    assert result["team_performance"] == []
    assert result["service_type_breakdown"] == []
    _assert_tenant_id_in_every_fetch(conn, "tenant-z")
