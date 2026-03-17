import { CircularProgress, Stack } from "@mui/material";

export default function ProjectsLoading() {
  return (
    <Stack alignItems="center" justifyContent="center" minHeight={280} spacing={1.5}>
      <CircularProgress size={24} />
    </Stack>
  );
}
