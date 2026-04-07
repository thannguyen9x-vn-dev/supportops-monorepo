from unittest.mock import AsyncMock, MagicMock

from adapters.anthropic_adapter import AnthropicAdapter, MAX_ITERATIONS
from adapters.base import ChatMessage
from tests._sdk_fakes.anthropic_fakes import (
    assert_anthropic_shape,
    end_turn_response,
    tool_use_response,
)


def _build_adapter_with_client(mocker, client: MagicMock) -> AnthropicAdapter:  # type: ignore[no-untyped-def]
    mocker.patch("anthropic.AsyncAnthropic", return_value=client)
    return AnthropicAdapter(api_key="test-key")


async def test_ask_returns_text_when_end_turn(mocker) -> None:  # type: ignore[no-untyped-def]
    response = end_turn_response("Final answer")
    assert_anthropic_shape(response)

    client = MagicMock()
    client.messages.create = AsyncMock(return_value=response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="claude-sonnet-4-20250514",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(),
    )

    assert reply == "Final answer"
    assert client.messages.create.await_count == 1


async def test_ask_runs_tool_loop_and_returns_final_text(mocker) -> None:  # type: ignore[no-untyped-def]
    response_tool = tool_use_response(
        tool_id="tool-1",
        tool_name="get_report_data",
        tool_input={"from_date": "2026-01-01", "to_date": "2026-01-31", "metrics": ["request_volume"]},
    )
    response_final = end_turn_response("Done with data")
    assert_anthropic_shape(response_tool)
    assert_anthropic_shape(response_final)

    client = MagicMock()
    client.messages.create = AsyncMock(side_effect=[response_tool, response_final])
    adapter = _build_adapter_with_client(mocker, client)

    tool_executor = AsyncMock(return_value='{"request_volume":{"total":3}}')

    reply = await adapter.ask(
        model="claude-sonnet-4-20250514",
        system_prompt="system",
        history=[ChatMessage(role="user", content="old")],
        user_message="new",
        tool_executor=tool_executor,
    )

    assert reply == "Done with data"
    tool_executor.assert_awaited_once_with(
        "get_report_data",
        {"from_date": "2026-01-01", "to_date": "2026-01-31", "metrics": ["request_volume"]},
    )
    assert client.messages.create.await_count == 2


async def test_ask_returns_fallback_for_unknown_stop_reason(mocker) -> None:  # type: ignore[no-untyped-def]
    bad_response = MagicMock(stop_reason="unknown_reason", content=[])
    client = MagicMock()
    client.messages.create = AsyncMock(return_value=bad_response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="claude-sonnet-4-20250514",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(),
    )

    assert reply == "I was unable to complete the request. Please try again."


async def test_ask_does_not_exceed_max_iterations(mocker) -> None:  # type: ignore[no-untyped-def]
    looping_response = tool_use_response("tool-1", "get_report_data", {"metrics": ["request_volume"]})
    assert_anthropic_shape(looping_response)

    client = MagicMock()
    client.messages.create = AsyncMock(return_value=looping_response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="claude-sonnet-4-20250514",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(return_value="{}"),
    )

    assert reply == "I was unable to complete the request. Please try again."
    assert client.messages.create.await_count == MAX_ITERATIONS


async def test_ask_wrong_shape_response_falls_back_instead_of_crash(mocker) -> None:  # type: ignore[no-untyped-def]
    wrong_shape_response = MagicMock(stop_reason="unexpected", content=[object()])
    client = MagicMock()
    client.messages.create = AsyncMock(return_value=wrong_shape_response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="claude-sonnet-4-20250514",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(),
    )

    assert reply == "I was unable to complete the request. Please try again."
