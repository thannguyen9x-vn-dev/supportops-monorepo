import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslations } from "next-intl";

import type { RequestPriority } from "../../types";

export function PriorityChip({ priority }: { priority: RequestPriority }) {
  const t = useTranslations("pages.requests.detail");

  return (
    <Chip
      label={t(`priorityLabels.${priority}`)}
      size="small"
      sx={(theme) => {
        if (priority === "CRITICAL") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.22),
            color: theme.palette.error.dark,
          };
        }

        if (priority === "HIGH") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.15),
            color: theme.palette.error.dark,
          };
        }

        if (priority === "MEDIUM") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.18),
            color: theme.palette.warning.dark,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.success.main, 0.14),
          color: theme.palette.success.dark,
        };
      }}
      variant="outlined"
    />
  );
}
