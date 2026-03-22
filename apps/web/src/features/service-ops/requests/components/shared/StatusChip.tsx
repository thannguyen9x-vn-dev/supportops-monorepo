import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslations } from "next-intl";

import type { RequestStatus } from "../../types";

export function StatusChip({ status }: { status: RequestStatus }) {
  const t = useTranslations("pages.requests.detail");

  return (
    <Chip
      label={t(`statusLabels.${status}`)}
      size="small"
      sx={(theme) => {
        if (status === "IN_PROGRESS") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.info.main, 0.16),
            color: theme.palette.info.dark,
          };
        }

        if (status === "RESOLVED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.success.main, 0.16),
            color: theme.palette.success.dark,
          };
        }

        if (status === "TRIAGE" || status === "ASSIGNED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.18),
            color: theme.palette.warning.dark,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.grey[500], 0.12),
          color: theme.palette.text.primary,
        };
      }}
      variant="outlined"
    />
  );
}
