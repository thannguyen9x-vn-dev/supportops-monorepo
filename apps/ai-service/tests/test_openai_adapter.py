from unittest.mock import AsyncMock, MagicMock

from adapters.base import ChatMessage
from adapters.openai_adapter import MAX_ITERATIONS, OpenAiAdapter
from tests._sdk_fakes.openai_fakes import (
    assert_openai_shape,
    stop_response,
    tool_calls_response,
)


def _build_adapter_with_client(mocker, client: MagicMock) -> OpenAiAdapter:  # type: ignore[no-untyped-def]
    mocker.patch("adapters.openai_adapter.AsyncOpenAI", return_value=client)
    return OpenAiAdapter(api_key="test-key")


async def test_ask_returns_message_content_when_stop(mocker) -> None:  # type: ignore[no-untyped-def]
    response = stop_response("OpenAI final")
    assert_openai_shape(response)

    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="gpt-4o",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(),
    )

    assert reply == "OpenAI final"
    assert client.chat.completions.create.await_count == 1


async def test_ask_handles_tool_calls_and_continues_loop(mocker) -> None:  # type: ignore[no-untyped-def]
    response_tool = tool_calls_response(
        call_id="call-1",
        fn_name="get_report_data",
        arguments={"from_date": "2026-01-01", "to_date": "2026-01-31", "metrics": ["sla_health"]},
    )
    response_final = stop_response("Done")
    assert_openai_shape(response_tool)
    assert_openai_shape(response_final)

    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=[response_tool, response_final])
    adapter = _build_adapter_with_client(mocker, client)
    tool_executor = AsyncMock(return_value='{"sla_health":{"total":10}}')

    reply = await adapter.ask(
        model="gpt-4o",
        system_prompt="system",
        history=[ChatMessage(role="assistant", content="history")],
        user_message="show me sla",
        tool_executor=tool_executor,
    )

    assert reply == "Done"
    tool_executor.assert_awaited_once_with(
        "get_report_data",
        {"from_date": "2026-01-01", "to_date": "2026-01-31", "metrics": ["sla_health"]},
    )
    assert client.chat.completions.create.await_count == 2


async def test_ask_returns_fallback_for_unknown_finish_reason(mocker) -> None:  # type: ignore[no-untyped-def]
    unknown_response = MagicMock(
        choices=[MagicMock(finish_reason="length", message=MagicMock(content=None, tool_calls=None))]
    )
    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=unknown_response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="gpt-4o",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(),
    )

    assert reply == "I was unable to complete the request. Please try again."


async def test_ask_does_not_exceed_max_iterations(mocker) -> None:  # type: ignore[no-untyped-def]
    looping_response = tool_calls_response("call-1", "get_report_data", {"metrics": ["request_volume"]})
    assert_openai_shape(looping_response)

    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=looping_response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="gpt-4o",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(return_value="{}"),
    )

    assert reply == "I was unable to complete the request. Please try again."
    assert client.chat.completions.create.await_count == MAX_ITERATIONS


async def test_ask_wrong_shape_response_falls_back_instead_of_crash(mocker) -> None:  # type: ignore[no-untyped-def]
    wrong_shape_response = MagicMock(choices=[MagicMock(finish_reason="unexpected", message=MagicMock())])
    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=wrong_shape_response)
    adapter = _build_adapter_with_client(mocker, client)

    reply = await adapter.ask(
        model="gpt-4o-mini",
        system_prompt="system",
        history=[],
        user_message="hello",
        tool_executor=AsyncMock(),
    )

    assert reply == "I was unable to complete the request. Please try again."
