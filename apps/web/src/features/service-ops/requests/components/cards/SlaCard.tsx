"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail, SectionVisibility } from "../../types";
import { formatRemainingTime, formatTargetMinutes, resolveSlaSummaryState } from "../../utils/formatters";
import { SlaStateChip } from "../shared/SlaStateChip";
import styles from "../request-detail-screen.module.css";

function resolveLiveRemainingSeconds(targetAt: string | undefined, fallbackSeconds: number, nowTimestamp: number): number {
  if (!targetAt) return fallbackSeconds;
  const targetTimestamp = new Date(targetAt).getTime();
  if (Number.isNaN(targetTimestamp)) return fallbackSeconds;
  return Math.max(0, Math.floor((targetTimestamp - nowTimestamp) / 1000));
}

export function SlaCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const liveAssignmentRemainingSeconds = useMemo(
    () =>
      request.sla.assignmentSla
        ? resolveLiveRemainingSeconds(
            request.sla.assignmentSla.targetAt,
            request.sla.assignmentSla.remainingSeconds,
            nowTimestamp,
          )
        : 0,
    [nowTimestamp, request.sla.assignmentSla],
  );

  const liveResolutionRemainingSeconds = useMemo(
    () =>
      request.sla.resolutionSla
        ? resolveLiveRemainingSeconds(
            request.sla.resolutionSla.targetAt,
            request.sla.resolutionSla.remainingSeconds,
            nowTimestamp,
          )
        : 0,
    [nowTimestamp, request.sla.resolutionSla],
  );

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
                <Typography fontWeight={600}>{formatRemainingTime(liveAssignmentRemainingSeconds)} remaining</Typography>
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
                <Typography fontWeight={600}>{formatRemainingTime(liveResolutionRemainingSeconds)} remaining</Typography>
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
          <Typography fontWeight={600}>{formatRemainingTime(liveResolutionRemainingSeconds)} remaining</Typography>
        </Box>
      )}
    </SectionCard>
  );
}
