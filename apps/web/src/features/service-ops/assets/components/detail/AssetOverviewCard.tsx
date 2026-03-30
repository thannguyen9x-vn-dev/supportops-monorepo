import { Divider, Stack, Typography } from "@mui/material";
import type { Asset } from "@supportops/types";

import { SectionCard } from "@/components/section-card";

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="textSmRegular">{label}</Typography>
      <Typography variant="textBase">{value ?? "-"}</Typography>
    </Stack>
  );
}

export function AssetOverviewCard({
  asset,
  statusLabel,
  t,
}: {
  asset: Asset;
  statusLabel: string;
  t: (key: string) => string;
}) {
  return (
    <SectionCard title={t("overview")}>
      <Stack spacing={1.5}>
        <MetaRow label={t("fields.assetCode")} value={asset.assetCode} />
        <MetaRow label={t("fields.assetType")} value={asset.assetType?.name} />
        <MetaRow label={t("fields.location")} value={asset.locationId} />
        <MetaRow label={t("fields.status")} value={statusLabel} />
        <Divider />
        <MetaRow label={t("fields.serialNumber")} value={asset.serialNumber} />
        <MetaRow label={t("fields.model")} value={asset.model} />
        <MetaRow label={t("fields.assignedDepartment")} value={asset.assignedDepartment} />
        <MetaRow label={t("fields.responsibleTeam")} value={asset.responsibleTeam} />
        <MetaRow
          label={t("fields.installedAt")}
          value={asset.installedAt ? new Date(asset.installedAt).toLocaleDateString() : null}
        />
        {asset.description ? (
          <>
            <Divider />
            <MetaRow label={t("fields.description")} value={asset.description} />
          </>
        ) : null}
      </Stack>
    </SectionCard>
  );
}
