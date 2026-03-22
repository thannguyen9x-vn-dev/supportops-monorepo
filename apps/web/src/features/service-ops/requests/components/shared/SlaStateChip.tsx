import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { SLA_STATE_LABELS } from "../../types";
import type { SlaState } from "../../types";

export function SlaStateChip({ state }: { state: SlaState }) {
  return (
    <Chip
      label={SLA_STATE_LABELS[state]}
      size="small"
      sx={(theme) => {
        if (state === "BREACHED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.18),
            color: theme.palette.error.dark,
          };
        }

        if (state === "AT_RISK") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.2),
            color: theme.palette.warning.dark,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.success.main, 0.16),
          color: theme.palette.success.dark,
        };
      }}
      variant="outlined"
    />
  );
}
