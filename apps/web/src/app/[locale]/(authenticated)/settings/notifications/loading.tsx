import { CircularProgress, Stack } from "@mui/material";

export default function NotificationSettingsLoading() {
  return (
    <Stack alignItems="center" py={6}>
      <CircularProgress size={24} />
    </Stack>
  );
}
