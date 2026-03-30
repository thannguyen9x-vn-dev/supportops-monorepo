import { Chip, Stack, Typography } from "@mui/material";
import type { Asset, AssetStatus } from "@supportops/types";

type StatusColor = "success" | "warning" | "error" | "default";

const ASSET_STATUS_COLOR: Record<AssetStatus, StatusColor> = {
  ACTIVE: "success",
  UNDER_MAINTENANCE: "warning",
  OUT_OF_SERVICE: "error",
  RETIRED: "default",
};

export function AssetDetailSummary({
  asset,
  statusLabel,
}: {
  asset: Asset;
  statusLabel: string;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ fontSize: 26, fontWeight: 600, lineHeight: "34px" }}>{asset.name}</Typography>
      <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 0.25 }}>
        <Chip
          color={ASSET_STATUS_COLOR[asset.status]}
          label={statusLabel}
          size="small"
          variant="outlined"
        />
        <Typography color="text.secondary" sx={{ fontFamily: "monospace", fontWeight: 600 }} variant="body2">
          {asset.assetCode}
        </Typography>
      </Stack>
    </Stack>
  );
}
