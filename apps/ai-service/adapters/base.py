"""Base adapter interface for AI providers."""

from abc import ABC, abstractmethod
from typing import Any


class ChatMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content


class AiAdapter(ABC):
    """Common interface for Anthropic and OpenAI adapters."""

    @abstractmethod
    async def ask(
        self,
        model: str,
        system_prompt: str,
        history: list[ChatMessage],
        user_message: str,
        tool_executor: Any,
    ) -> str:
        """Send a message to the AI model and return the final text response.

        The adapter handles multi-turn tool use internally:
        it calls tool_executor when the model requests a tool, then continues
        the conversation until a final text response is produced.

        Args:
            model: Model ID string.
            system_prompt: System instructions for the model.
            history: Previous conversation turns.
            user_message: Latest user message.
            tool_executor: Async callable(tool_name, tool_input) -> str (JSON).

        Returns:
            Final text response from the model.
        """
        ...
