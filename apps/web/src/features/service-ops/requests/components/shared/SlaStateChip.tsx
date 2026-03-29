import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { SLA_STATE_LABELS } from "../../types";
import type { SlaState } from "../../types";

export function SlaStateChip({ state }: { state: SlaState }) {
  const icon =
    state === "BREACHED"
      ? <ErrorOutlineOutlinedIcon fontSize="small" />
      : state === "AT_RISK" || state === "NEAR_BREACH"
      ? <WarningAmberOutlinedIcon fontSize="small" />
      : state === "PAUSED"
      ? <PauseCircleOutlineOutlinedIcon fontSize="small" />
      : undefined;

  return (
    <Chip
      icon={icon}
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

        if (state === "NEAR_BREACH") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.22),
            color: theme.palette.warning.dark,
          };
        }

        if (state === "PAUSED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.grey[600], 0.18),
            color: theme.palette.grey[800],
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
