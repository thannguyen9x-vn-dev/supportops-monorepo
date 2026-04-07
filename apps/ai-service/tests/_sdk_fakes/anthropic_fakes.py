from dataclasses import dataclass
from typing import Any


@dataclass
class _TextBlock:
    type: str
    text: str


@dataclass
class _ToolUseBlock:
    type: str
    id: str
    name: str
    input: dict[str, Any]


@dataclass
class _AnthropicResponse:
    stop_reason: str
    content: list[Any]


def end_turn_response(text: str) -> _AnthropicResponse:
    return _AnthropicResponse(stop_reason="end_turn", content=[_TextBlock(type="text", text=text)])


def tool_use_response(tool_id: str, tool_name: str, tool_input: dict[str, Any]) -> _AnthropicResponse:
    return _AnthropicResponse(
        stop_reason="tool_use",
        content=[_ToolUseBlock(type="tool_use", id=tool_id, name=tool_name, input=tool_input)],
    )


def assert_anthropic_shape(obj: Any) -> None:
    assert hasattr(obj, "stop_reason")
    assert hasattr(obj, "content")
    assert isinstance(obj.content, list)

    for block in obj.content:
        assert hasattr(block, "type")
        if block.type == "text":
            assert hasattr(block, "text")
        if block.type == "tool_use":
            assert hasattr(block, "id")
            assert hasattr(block, "name")
            assert hasattr(block, "input")
