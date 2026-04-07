import json
from dataclasses import dataclass
from typing import Any, List, Optional


@dataclass
class _FunctionCall:
    name: str
    arguments: str


@dataclass
class _ToolCall:
    id: str
    function: _FunctionCall


@dataclass
class _Message:
    content: Optional[str]
    tool_calls: Optional[List[_ToolCall]]


@dataclass
class _Choice:
    finish_reason: str
    message: _Message


@dataclass
class _OpenAiResponse:
    choices: List[_Choice]


def stop_response(text: str) -> _OpenAiResponse:
    return _OpenAiResponse(choices=[_Choice(finish_reason="stop", message=_Message(content=text, tool_calls=None))])


def tool_calls_response(call_id: str, fn_name: str, arguments: dict[str, Any]) -> _OpenAiResponse:
    tool_call = _ToolCall(
        id=call_id,
        function=_FunctionCall(name=fn_name, arguments=json.dumps(arguments)),
    )
    return _OpenAiResponse(
        choices=[_Choice(finish_reason="tool_calls", message=_Message(content=None, tool_calls=[tool_call]))]
    )


def assert_openai_shape(obj: Any) -> None:
    assert hasattr(obj, "choices")
    assert isinstance(obj.choices, list)
    assert len(obj.choices) > 0

    choice = obj.choices[0]
    assert hasattr(choice, "finish_reason")
    assert hasattr(choice, "message")
    assert hasattr(choice.message, "content")
    assert hasattr(choice.message, "tool_calls")

    if choice.message.tool_calls:
        tool_call = choice.message.tool_calls[0]
        assert hasattr(tool_call, "id")
        assert hasattr(tool_call, "function")
        assert hasattr(tool_call.function, "name")
        assert hasattr(tool_call.function, "arguments")
        assert isinstance(tool_call.function.arguments, str)
