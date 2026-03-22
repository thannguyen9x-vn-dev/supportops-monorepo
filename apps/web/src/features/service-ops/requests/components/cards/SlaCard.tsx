import { Box, Stack, Typography } from "@mui/material";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail, SectionVisibility } from "../../types";
import { formatRemainingTime, formatTargetMinutes, resolveSlaSummaryState } from "../../utils/formatters";
import { SlaStateChip } from "../shared/SlaStateChip";
import styles from "../request-detail-screen.module.css";

export function SlaCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const summaryState = resolveSlaSummaryState(request.sla);

  return (
    <SectionCard headerRight={<SlaStateChip state={summaryState} />} title="SLA">
      {visibility.showSlaDetails ? (
        <>
          {request.sla.assignmentSla ? (
            <Box className={styles.sideBlock}>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography color="text.secondary" variant="body2">Assignment SLA</Typography>
                <Typography color="text.secondary" variant="body2">Target: {formatTargetMinutes(request.sla.assignmentSla.targetMinutes)}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography fontWeight={600}>{formatRemainingTime(request.sla.assignmentSla.remainingSeconds)} remaining</Typography>
                <SlaStateChip state={request.sla.assignmentSla.state} />
              </Stack>
            </Box>
          ) : null}

          {request.sla.resolutionSla ? (
            <Box className={styles.sideBlock}>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography color="text.secondary" variant="body2">Resolution SLA</Typography>
                <Typography color="text.secondary" variant="body2">Target: {formatTargetMinutes(request.sla.resolutionSla.targetMinutes)}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography fontWeight={600}>{formatRemainingTime(request.sla.resolutionSla.remainingSeconds)} remaining</Typography>
                <SlaStateChip state={request.sla.resolutionSla.state} />
              </Stack>
            </Box>
          ) : null}

          {visibility.showEscalationRules ? (
            <>
              <Typography className={styles.sectionTitle} sx={{ mt: 2 }}>Escalation rules</Typography>
              <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
                {request.sla.escalationRules.map((rule) => (
                  <Typography component="li" key={rule} variant="body2">{rule}</Typography>
                ))}
              </Box>
            </>
          ) : null}
        </>
      ) : (
        <Box className={styles.sideBlock}>
          <Typography color="text.secondary" variant="body2">Resolution SLA</Typography>
          <Typography fontWeight={600}>{formatRemainingTime(request.sla.resolutionSla?.remainingSeconds ?? 0)} remaining</Typography>
        </Box>
      )}
    </SectionCard>
  );
}
