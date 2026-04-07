"""OpenAI adapter."""

import json
from typing import Any

from openai import AsyncOpenAI

from .base import AiAdapter, ChatMessage
from tools.report_tool import OPENAI_FUNCTION

MAX_ITERATIONS = 5  # prevent infinite tool loops


class OpenAiAdapter(AiAdapter):
    def __init__(self, api_key: str):
        self._client = AsyncOpenAI(api_key=api_key)

    async def ask(
        self,
        model: str,
        system_prompt: str,
        history: list[ChatMessage],
        user_message: str,
        tool_executor: Any,
    ) -> str:
        messages = [{"role": "system", "content": system_prompt}]
        messages += [{"role": m.role, "content": m.content} for m in history]
        messages.append({"role": "user", "content": user_message})

        for _ in range(MAX_ITERATIONS):
            response = await self._client.chat.completions.create(
                model=model,
                messages=messages,
                tools=[OPENAI_FUNCTION],
                tool_choice="auto",
            )

            choice = response.choices[0]

            if choice.finish_reason == "stop":
                return choice.message.content or ""

            if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
                tool_call = choice.message.tool_calls[0]
                tool_input = json.loads(tool_call.function.arguments)
                tool_result_content = await tool_executor(tool_call.function.name, tool_input)

                # Append assistant message + tool result
                messages.append(choice.message)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": tool_result_content,
                    }
                )
            else:
                break

        return "I was unable to complete the request. Please try again."
