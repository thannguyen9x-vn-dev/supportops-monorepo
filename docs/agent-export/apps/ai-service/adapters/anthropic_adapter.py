"""Anthropic (Claude) adapter."""

import json
from typing import Any

import anthropic

from .base import AiAdapter, ChatMessage
from tools.report_tool import ANTHROPIC_TOOL

MAX_ITERATIONS = 5  # prevent infinite tool loops


class AnthropicAdapter(AiAdapter):
    def __init__(self, api_key: str):
        self._client = anthropic.AsyncAnthropic(api_key=api_key)

    async def ask(
        self,
        model: str,
        system_prompt: str,
        history: list[ChatMessage],
        user_message: str,
        tool_executor: Any,
    ) -> str:
        messages = [{"role": m.role, "content": m.content} for m in history]
        messages.append({"role": "user", "content": user_message})

        for _ in range(MAX_ITERATIONS):
            response = await self._client.messages.create(
                model=model,
                max_tokens=2048,
                system=system_prompt,
                messages=messages,
                tools=[ANTHROPIC_TOOL],
            )

            if response.stop_reason == "end_turn":
                text_blocks = [b.text for b in response.content if hasattr(b, "text")]
                return "\n".join(text_blocks)

            if response.stop_reason == "tool_use":
                tool_use_block = next((b for b in response.content if b.type == "tool_use"), None)
                if tool_use_block is None:
                    break

                tool_result_content = await tool_executor(tool_use_block.name, tool_use_block.input)

                # Append assistant turn + tool result
                messages.append({"role": "assistant", "content": response.content})
                messages.append(
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": tool_use_block.id,
                                "content": tool_result_content,
                            }
                        ],
                    }
                )
            else:
                break

        return "I was unable to complete the request. Please try again."
