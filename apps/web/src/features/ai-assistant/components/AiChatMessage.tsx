import { alpha, Box, Paper, Typography, useTheme } from "@mui/material";
import type { UiChatMessage } from "../types";

type AiChatMessageProps = {
  message: UiChatMessage;
};

export function AiChatMessage({ message }: AiChatMessageProps) {
  const theme = useTheme();
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "80%",
          px: 2,
          py: 1.25,
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          bgcolor: isUser
            ? theme.palette.primary.main
            : message.isError
              ? alpha(theme.palette.error.main, 0.08)
              : alpha(theme.palette.action.hover, 0.6),
          border: message.isError ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : "none",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: isUser
              ? theme.palette.primary.contrastText
              : message.isError
                ? theme.palette.error.main
                : theme.palette.text.primary,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </Typography>
      </Paper>
    </Box>
  );
}
