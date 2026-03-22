import { Stack, Typography } from "@mui/material";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail } from "../../types";

export function AuditSummaryCard({ request }: { request: RequestDetail }) {
  return (
    <SectionCard
      headerRight={<Typography color="text.secondary" variant="caption">Immutable log</Typography>}
      title="Audit summary"
    >
      <Stack spacing={0.9} sx={{ mt: 1.25 }}>
        {(request.auditSummary ?? []).map((item) => (
          <Typography key={item.id} variant="body2">
            <strong>{item.createdAt}</strong> · {item.summary}
          </Typography>
        ))}
      </Stack>
    </SectionCard>
  );
}
