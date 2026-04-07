import { Typography } from "@mui/material";

export function NotificationEmptyState({ message }: { message: string }) {
  return (
    <Typography color="text.secondary" sx={{ px: 2, py: 4, textAlign: "center" }} variant="body2">
      {message}
    </Typography>
  );
}
