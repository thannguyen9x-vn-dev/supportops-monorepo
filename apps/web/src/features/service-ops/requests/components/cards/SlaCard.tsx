"use client";

import { Alert, Box, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail, SectionVisibility, SlaState } from "../../types";
import { useSlaCountdown } from "../../hooks/useSlaCountdown";
import { resolveSlaSummaryState } from "../../utils/formatters";
import { SlaStateChip } from "../shared/SlaStateChip";
import styles from "../request-detail-screen.module.css";

function formatTimeLeft(minutes: number, t: ReturnType<typeof useTranslations>) {
  if (minutes < 60) {
    return t("sla.minutesLeft", { minutes });
  }

  const hours = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;
  return t("sla.hoursLeft", { hours, minutes: minutesPart });
}

function resolveDisplayState(base: SlaState, isPaused: boolean, minutesRemaining: number): SlaState {
  if (isPaused) {
    return "PAUSED";
  }

  if (base !== "BREACHED" && minutesRemaining > 0 && minutesRemaining <= 30) {
    return "NEAR_BREACH";
  }

  return base;
}

function formatDueAt(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
}

export function SlaCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const t = useTranslations("pages.requests.detail");
  const isPaused = request.status === "WAITING_FOR_CUSTOMER";

  const assignmentMinutesRemaining = useSlaCountdown(
    request.sla.assignmentSla?.targetAt,
    request.sla.assignmentSla?.totalPausedSeconds ?? 0,
    isPaused,
  );

  const resolutionMinutesRemaining = useSlaCountdown(
    request.sla.resolutionSla?.targetAt,
    request.sla.resolutionSla?.totalPausedSeconds ?? 0,
    isPaused,
  );

  const assignmentState = request.sla.assignmentSla
    ? resolveDisplayState(request.sla.assignmentSla.state, isPaused, assignmentMinutesRemaining)
    : null;

  const resolutionState = request.sla.resolutionSla
    ? resolveDisplayState(request.sla.resolutionSla.state, isPaused, resolutionMinutesRemaining)
    : null;

  const summaryState = isPaused
    ? "PAUSED"
    : resolveSlaSummaryState({
        ...request.sla,
        assignmentSla: request.sla.assignmentSla
          ? { ...request.sla.assignmentSla, state: assignmentState ?? request.sla.assignmentSla.state }
          : undefined,
        resolutionSla: request.sla.resolutionSla
          ? { ...request.sla.resolutionSla, state: resolutionState ?? request.sla.resolutionSla.state }
          : undefined,
      });

  return (
    <SectionCard headerRight={<SlaStateChip state={summaryState} />} title={t("sla.title")}>
      {visibility.showSlaDetails ? (
        <>
          {request.sla.assignmentSla ? (
            <Box className={styles.sideBlock}>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography color="text.secondary" variant="body2">{t("sla.assignment")}</Typography>
                <Typography color="text.secondary" variant="body2">Due: {formatDueAt(request.sla.assignmentSla.targetAt)}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography fontWeight={600}>{formatTimeLeft(assignmentMinutesRemaining, t)}</Typography>
                {assignmentState ? <SlaStateChip state={assignmentState} /> : null}
              </Stack>
            </Box>
          ) : null}

          {request.sla.resolutionSla ? (
            <Box className={styles.sideBlock}>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography color="text.secondary" variant="body2">{t("sla.resolution")}</Typography>
                <Typography color="text.secondary" variant="body2">Due: {formatDueAt(request.sla.resolutionSla.targetAt)}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography fontWeight={600}>{formatTimeLeft(resolutionMinutesRemaining, t)}</Typography>
                {resolutionState ? <SlaStateChip state={resolutionState} /> : null}
              </Stack>
            </Box>
          ) : null}

          {isPaused ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              {t("sla.pausedReason")}
            </Alert>
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
          <Typography color="text.secondary" variant="body2">{t("sla.resolution")}</Typography>
          <Typography fontWeight={600}>{formatTimeLeft(resolutionMinutesRemaining, t)}</Typography>
        </Box>
      )}
    </SectionCard>
  );
}
