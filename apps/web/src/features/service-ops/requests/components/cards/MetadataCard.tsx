import { Box, Chip, Stack, Typography } from "@mui/material";

import { SectionCard } from "@/components/section-card";

import type { MetadataAccessLevel, RequestDetail, SectionVisibility } from "../../types";

export function MetadataCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const rows: Array<{ key: string; label: string; value?: string; editable?: boolean; minAccess: MetadataAccessLevel }> = [
    { key: "tenant", label: "Tenant", value: request.metadata.tenantName, minAccess: "BASIC" },
    { key: "serviceType", label: "Service type", value: request.metadata.serviceType, minAccess: "BASIC" },
    { key: "location", label: "Location", value: request.metadata.location, minAccess: "BASIC" },
    { key: "source", label: "Source channel", value: request.metadata.sourceChannel, minAccess: "LIMITED" },
    {
      key: "impact",
      label: "Impact level",
      value: request.metadata.impactLevel,
      editable: visibility.metadataEditable,
      minAccess: "LIMITED",
    },
    {
      key: "urgency",
      label: "Urgency",
      value: request.metadata.urgency,
      editable: visibility.metadataEditable,
      minAccess: "LIMITED",
    },
    { key: "asset", label: "Asset", value: request.metadata.asset, minAccess: "FULL" },
  ];

  const canReadRow = (rowAccess: MetadataAccessLevel) => {
    if (visibility.metadataAccess === "FULL") return true;
    if (visibility.metadataAccess === "LIMITED") return rowAccess === "LIMITED" || rowAccess === "BASIC";
    return rowAccess === "BASIC";
  };

  const visibleRows = rows.filter((row) => canReadRow(row.minAccess));

  return (
    <SectionCard
      headerRight={visibility.metadataAccess === "BASIC" ? null : <Typography color="text.secondary" variant="caption">Internal view</Typography>}
      title="Request metadata"
    >
      <Stack spacing={1} sx={{ mt: 1.25 }}>
        {visibleRows.map((row) => (
          <Box key={row.key}>
            <Typography color="text.secondary" variant="body2">{row.label}</Typography>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
              <Typography>{row.value ?? "-"}</Typography>
              {row.editable ? <Chip color="primary" label="Editable" size="small" variant="outlined" /> : null}
            </Stack>
          </Box>
        ))}

        <Box>
          <Typography color="text.secondary" variant="body2">Tags</Typography>
          <Stack direction="row" flexWrap="wrap" spacing={0.75} sx={{ mt: 0.5 }}>
            {request.metadata.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Stack>
    </SectionCard>
  );
}
