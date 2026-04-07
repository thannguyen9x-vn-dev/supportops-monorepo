"use client";

import { useCallback, useRef, useState } from "react";
import type { AiModelId, ChatMessage } from "@supportops/types";
import { DEFAULT_AI_MODEL } from "@supportops/types";
import { ApiError } from "@/lib/api";
import { aiService } from "../services/ai.service";
import type { UiChatMessage } from "../types";

function generateId(): string {
  return crypto.randomUUID();
}

function toApiHistory(messages: UiChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => !m.isError)
    .map((m) => ({ role: m.role, content: m.content }));
}

export function useAiChat(defaultModel: AiModelId = DEFAULT_AI_MODEL) {
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionModel, setSessionModel] = useState<AiModelId>(defaultModel);
  const abortRef = useRef<boolean>(false);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      const userMsg: UiChatMessage = {
        id: generateId(),
        role: "user",
        content: userText.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      abortRef.current = false;

      try {
        const history = toApiHistory([...messages, userMsg]).slice(0, -1);

        const { data } = await aiService.ask({
          message: userText.trim(),
          history,
          model: sessionModel,
        });

        if (!abortRef.current) {
          setMessages((prev) => [
            ...prev,
            { id: generateId(), role: "assistant", content: data.reply },
          ]);
        }
      } catch (error) {
        if (!abortRef.current) {
          const errorText =
            error instanceof ApiError && error.status === 503
              ? "AI service is currently unavailable. Please try again later."
              : "Something went wrong. Please try again.";

          setMessages((prev) => [
            ...prev,
            { id: generateId(), role: "assistant", content: errorText, isError: true },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, sessionModel]
  );

  const clearConversation = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    sessionModel,
    setSessionModel,
    sendMessage,
    clearConversation,
  };
}
