import json
from datetime import date
from unittest.mock import AsyncMock


async def test_health_returns_ok(async_client) -> None:  # type: ignore[no-untyped-def]
    response = await async_client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_ask_happy_path_returns_reply_and_model(async_client) -> None:  # type: ignore[no-untyped-def]
    payload = {"message": "Hello", "history": [], "model": "claude-sonnet-4-20250514"}

    response = await async_client.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 200
    body = response.json()
    assert "reply" in body
    assert body["model"] == "claude-sonnet-4-20250514"


async def test_ask_returns_422_when_missing_tenant_header(async_client) -> None:  # type: ignore[no-untyped-def]
    payload = {"message": "Hello", "history": [], "model": "claude-sonnet-4-20250514"}

    response = await async_client.post("/ask", json=payload)

    assert response.status_code == 422


async def test_ask_returns_503_when_adapter_not_configured(async_client_no_adapters) -> None:  # type: ignore[no-untyped-def]
    payload = {"message": "Hello", "history": [], "model": "claude-sonnet-4-20250514"}

    response = await async_client_no_adapters.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 503
    assert response.json()["detail"] == "AI provider not configured"


async def test_ask_selects_anthropic_for_claude_models(  # type: ignore[no-untyped-def]
    async_client,
    mock_anthropic_adapter,
    mock_openai_adapter,
) -> None:
    payload = {"message": "Hello", "history": [], "model": "claude-opus-4-20250514"}
    mock_anthropic_adapter.ask = AsyncMock(return_value="anthropic reply")

    response = await async_client.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 200
    assert response.json()["reply"] == "anthropic reply"
    mock_anthropic_adapter.ask.assert_awaited_once()
    mock_openai_adapter.ask.assert_not_awaited()


async def test_ask_selects_openai_for_gpt_models(  # type: ignore[no-untyped-def]
    async_client,
    mock_anthropic_adapter,
    mock_openai_adapter,
) -> None:
    payload = {"message": "Hello", "history": [], "model": "gpt-4o-mini"}
    mock_openai_adapter.ask = AsyncMock(return_value="openai reply")

    response = await async_client.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 200
    assert response.json()["reply"] == "openai reply"
    mock_openai_adapter.ask.assert_awaited_once()
    mock_anthropic_adapter.ask.assert_not_awaited()


async def test_ask_invalid_model_falls_back_to_default_claude(  # type: ignore[no-untyped-def]
    async_client,
    mock_anthropic_adapter,
    mock_openai_adapter,
) -> None:
    payload = {"message": "Hello", "history": [], "model": "unknown-model"}

    response = await async_client.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 200
    assert response.json()["model"] == "claude-sonnet-4-20250514"
    mock_anthropic_adapter.ask.assert_awaited_once()
    mock_openai_adapter.ask.assert_not_awaited()


async def test_tool_executor_returns_error_json_for_unknown_tool(  # type: ignore[no-untyped-def]
    async_client,
    mock_anthropic_adapter,
) -> None:
    async def _ask_side_effect(*, tool_executor, **kwargs):  # type: ignore[no-untyped-def]
        return await tool_executor("unknown_tool", {})

    mock_anthropic_adapter.ask = AsyncMock(side_effect=_ask_side_effect)
    payload = {"message": "Hello", "history": [], "model": "claude-sonnet-4-20250514"}

    response = await async_client.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 200
    tool_result = json.loads(response.json()["reply"])
    assert "error" in tool_result
    assert tool_result["error"] == "Unknown tool: unknown_tool"


async def test_tool_executor_returns_error_json_when_parse_fails(  # type: ignore[no-untyped-def]
    async_client,
    mock_anthropic_adapter,
    mocker,
) -> None:
    mocker.patch("routers.ask.parse_tool_input", side_effect=ValueError("invalid input"))

    async def _ask_side_effect(*, tool_executor, **kwargs):  # type: ignore[no-untyped-def]
        return await tool_executor("get_report_data", {"bad": "payload"})

    mock_anthropic_adapter.ask = AsyncMock(side_effect=_ask_side_effect)
    payload = {"message": "Hello", "history": [], "model": "claude-sonnet-4-20250514"}

    response = await async_client.post("/ask", json=payload, headers={"x-tenant-id": "tenant-1"})

    assert response.status_code == 200
    tool_result = json.loads(response.json()["reply"])
    assert tool_result["error"] == "invalid input"


async def test_tool_executor_propagates_tenant_id_from_header(  # type: ignore[no-untyped-def]
    async_client,
    mock_anthropic_adapter,
    mocker,
) -> None:
    mocker.patch(
        "routers.ask.parse_tool_input",
        return_value=("2026-01-01", "2026-01-31", ["request_volume"]),
    )
    get_report_data_mock = mocker.patch(
        "routers.ask.get_report_data",
        new=AsyncMock(return_value={"request_volume": {"total": 1}}),
    )

    async def _ask_side_effect(*, tool_executor, **kwargs):  # type: ignore[no-untyped-def]
        return await tool_executor("get_report_data", {"ignored": True})

    mock_anthropic_adapter.ask = AsyncMock(side_effect=_ask_side_effect)
    payload = {
        "message": "Hello",
        "history": [],
        "model": "claude-sonnet-4-20250514",
        "tenantId": "tenant-from-body-must-not-be-used",
    }

    response = await async_client.post(
        "/ask",
        json=payload,
        headers={"x-tenant-id": "tenant-from-header"},
    )

    assert response.status_code == 200
    assert json.loads(response.json()["reply"]) == {"request_volume": {"total": 1}}

    call_args = get_report_data_mock.await_args.args
    assert call_args[1] == "tenant-from-header"
    assert isinstance(call_args[2], date)
    assert isinstance(call_args[3], date)
    assert call_args[4] == ["request_volume"]
