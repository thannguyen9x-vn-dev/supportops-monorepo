import { Box, Skeleton } from "@mui/material";

export default function ReportsLoading(): React.JSX.Element {
  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="text" width={300} height={24} sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" height={150} sx={{ mt: 3, borderRadius: 1 }} />
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}
