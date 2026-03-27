import { Box, Chip, Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useParams } from "next/navigation";

import { SectionCard } from "@/components/section-card";

import type { MetadataAccessLevel, RequestDetail, SectionVisibility } from "../../types";

export function MetadataCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const { locale } = useParams<{ locale: string }>();
  const toDisplayValue = (value?: string) => {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : "-";
  };
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
              {row.key === "asset" && row.value ? (
                <Link component={NextLink} href={`/${locale}/assets/${row.value}`} underline="hover" variant="body1">
                  {row.value}
                </Link>
              ) : (
                <Typography>{toDisplayValue(row.value)}</Typography>
              )}
              {row.editable ? <Chip color="primary" label="Editable" size="small" variant="outlined" /> : null}
            </Stack>
          </Box>
        ))}

        <Box>
          <Typography color="text.secondary" variant="body2">Tags</Typography>
          {request.metadata.tags.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
              {request.metadata.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          ) : (
            <Typography sx={{ mt: 0.5 }} variant="body2">-</Typography>
          )}
        </Box>
      </Stack>
    </SectionCard>
  );
}
