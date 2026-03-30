import { Alert, Box, Chip, Divider, Stack, Typography } from "@mui/material";
import type { AssetDetail, RequestStatus } from "@supportops/types";

import { SectionCard } from "@/components/section-card";

type StatusColor = "success" | "warning" | "error" | "default";

const REQUEST_STATUS_COLOR: Partial<Record<string, StatusColor>> = {
  SUBMITTED: "warning",
  TRIAGE: "warning",
  ASSIGNED: "default",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "success",
  CANCELLED: "default",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

export function AssetLinkedRequestsCard({
  detail,
  onRequestClick,
  t,
  tRequestList,
}: {
  detail: AssetDetail;
  onRequestClick: (requestId: string) => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  tRequestList: (key: string) => string;
}) {
  return (
    <>
      {detail.openRequestCount > 0 ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("openRequestCount", { count: detail.openRequestCount })}
        </Alert>
      ) : null}

      <SectionCard title={t("linkedRequests")}>
        {detail.requests.length === 0 ? (
          <Typography color="text.secondary" variant="body2">{t("noRequests")}</Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {detail.requests.map((req) => (
              <Box
                key={req.id}
                onClick={() => onRequestClick(req.id)}
                sx={{
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                  px: 1,
                  borderRadius: 1,
                }}
              >
                <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography fontWeight={600} variant="body2">{req.requestCode ?? req.id.slice(0, 8)}</Typography>
                    <Typography color="text.secondary" variant="body2">{req.title}</Typography>
                  </Box>
                  <Chip
                    color={REQUEST_STATUS_COLOR[req.status as RequestStatus] ?? "default"}
                    label={tRequestList(`statusApi.${req.status}`)}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Typography color="text.secondary" variant="caption">{formatDate(req.updatedAt)}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </SectionCard>
    </>
  );
}
