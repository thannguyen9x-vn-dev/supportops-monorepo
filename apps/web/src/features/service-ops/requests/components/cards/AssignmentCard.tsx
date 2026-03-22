import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { UserRole } from "@supportops/types";

import { SectionCard } from "@/components/section-card";
import { UserIdentity } from "@/components/user";

import type { HeaderAction, RequestDetail } from "../../types";
import styles from "../request-detail-screen.module.css";

export function AssignmentCard({
  request,
  headerActions,
  role,
  onAssign,
  onAssignToMe,
  isSubmitting,
}: {
  request: RequestDetail;
  headerActions: HeaderAction[];
  role: UserRole;
  onAssign: (reassign: boolean) => void;
  onAssignToMe: () => void;
  isSubmitting: boolean;
}) {
  const showAssignToMe = headerActions.includes("ASSIGN_TO_ME");
  const showAssign = headerActions.includes("ASSIGN");
  const showReassign = headerActions.includes("REASSIGN");

  return (
    <SectionCard
      headerRight={
        request.assignment.queueLabel ? (
          <Chip label={request.assignment.queueLabel} size="small" variant="outlined" />
        ) : null
      }
      title="Assignment"
    >
      {request.assignee ? (
        <Box sx={{ mt: 1.25 }}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
            <UserIdentity
              avatarSize={36}
              avatarUrl={request.assignee.avatarUrl}
              email={request.assignee.email}
              name={request.assignee.name}
              variant="full"
            />
            <Stack alignItems="center" direction="row" spacing={0.75}>
              <Chip color="success" label={request.assignee.roleLabel} size="small" variant="outlined" />
            </Stack>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
            {[request.assignee.etaLabel, request.assignee.team].filter(Boolean).join(" · ")}
          </Typography>
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 1.25 }} variant="body2">No assignee yet.</Typography>
      )}

      {role === "EMPLOYEE" ? null : (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {showAssignToMe ? (
            <Button disabled={isSubmitting} fullWidth onClick={onAssignToMe} size="small" variant="outlined">
              Assign to me
            </Button>
          ) : null}
          {showAssign ? (
            <Button disabled={isSubmitting} fullWidth onClick={() => onAssign(false)} size="small" variant="outlined">
              Assign
            </Button>
          ) : null}
          {showReassign ? (
            <Button disabled={isSubmitting} fullWidth onClick={() => onAssign(true)} size="small" variant="outlined">
              Reassign
            </Button>
          ) : null}
        </Stack>
      )}

      <Typography className={styles.sectionTitle} sx={{ mt: 2 }}>HANDOFF HISTORY</Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {request.assignment.handoffHistory.map((item) => (
          <Box key={item.id}>
            <Typography fontWeight={600} variant="body2">{`${item.from} -> ${item.to}`}</Typography>
            <Typography color="text.secondary" variant="body2">{item.at} · by {item.by}</Typography>
          </Box>
        ))}
      </Stack>
    </SectionCard>
  );
}
