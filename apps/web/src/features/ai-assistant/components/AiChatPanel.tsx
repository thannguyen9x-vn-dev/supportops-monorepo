"use client";

import {
  alpha,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { RiDeleteBinLine, RiRobot2Line, RiSendPlaneLine } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { AiModelId } from "../types";
import { useAiChat } from "../hooks/useAiChat";
import { AiChatMessage } from "./AiChatMessage";
import { AiModelSelector } from "./AiModelSelector";

type AiChatPanelProps = {
  defaultModel: AiModelId;
};

export function AiChatPanel({ defaultModel }: AiChatPanelProps) {
  const t = useTranslations("aiAssistant");
  const theme = useTheme();
  const { messages, isLoading, sessionModel, setSessionModel, sendMessage, clearConversation } =
    useAiChat(defaultModel);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    void sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 520,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <RiRobot2Line size={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={600}>
            {t("title")}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AiModelSelector
            value={sessionModel}
            onChange={setSessionModel}
            disabled={isLoading}
          />
          <Tooltip title={t("clearConversation")}>
            <span>
              <IconButton
                size="small"
                onClick={clearConversation}
                disabled={messages.length === 0 || isLoading}
              >
                <RiDeleteBinLine size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5 }}>
        {messages.length === 0 && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }} spacing={1}>
            <RiRobot2Line size={32} color={theme.palette.text.disabled} />
            <Typography variant="body2" color="text.disabled" textAlign="center">
              {t("emptyState")}
            </Typography>
          </Stack>
        )}
        {messages.map((msg) => (
          <AiChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              {t("thinking")}
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <OutlinedInput
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder={t("inputPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                color="primary"
              >
                <RiSendPlaneLine size={18} />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>
    </Paper>
  );
}
