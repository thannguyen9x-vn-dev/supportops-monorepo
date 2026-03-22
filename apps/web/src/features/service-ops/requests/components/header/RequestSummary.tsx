import { Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslations } from "next-intl";

import { CopyTextButton } from "@/components/copy/CopyTextButton";

import type { RequestDetail } from "../../types";
import { SLA_STATE_LABELS } from "../../types";
import { formatRemainingTime, resolveSlaSummaryState } from "../../utils/formatters";
import { PriorityChip } from "../shared/PriorityChip";
import { StatusChip } from "../shared/StatusChip";

export function RequestSummary({ request }: { request: RequestDetail }) {
  const t = useTranslations("pages.requests.detail");
  const summaryState = resolveSlaSummaryState(request.sla);
  const summaryRemaining = request.sla.resolutionSla?.remainingSeconds ?? request.sla.assignmentSla?.remainingSeconds ?? 0;

  return (
    <Stack alignItems="flex-start" spacing={0.5}>
      <Typography sx={{ fontSize: 26, fontWeight: 600, lineHeight: "34px" }}>{request.title}</Typography>

      <CopyTextButton
        copiedMessage={t("header.copyCodeSuccess")}
        copyErrorMessage={t("header.copyCodeError")}
        label={t("header.copyCodeAriaLabel")}
        value={request.requestCode}
      />

      <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 0.25 }}>
        <StatusChip status={request.status} />
        <PriorityChip priority={request.priority} />
        <Chip
          label={`${SLA_STATE_LABELS[summaryState]} · ${formatRemainingTime(summaryRemaining)} left`}
          size="small"
          sx={(theme) => ({
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.success.main, 0.16),
            color: theme.palette.success.dark,
          })}
          variant="outlined"
        />
      </Stack>
    </Stack>
  );
}
