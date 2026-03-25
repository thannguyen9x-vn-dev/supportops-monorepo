import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Avatar as MuiAvatar, Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { Avatar as UserAvatar } from "@supportops/ui-avatar";
import type { UserRole } from "@supportops/types";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail } from "../../types";
import { eventIcon } from "../../utils/formatters";
import { canViewTimelineItem } from "../../utils/requestAccess";
import styles from "../request-detail-screen.module.css";

function TimelineIcon({ iconType }: { iconType: ReturnType<typeof eventIcon> }) {
  switch (iconType.name) {
    case "chevron":
      return <ChevronRightIcon color={iconType.color} fontSize="small" />;
    case "assignment":
      return <AssignmentIndOutlinedIcon color={iconType.color} fontSize="small" />;
    case "error":
      return <ErrorOutlineIcon color={iconType.color} fontSize="small" />;
    case "review":
      return <RateReviewOutlinedIcon color={iconType.color} fontSize="small" />;
    case "check":
      return <CheckCircleOutlineIcon color={iconType.color} fontSize="small" />;
    case "report":
      return <ReportProblemOutlinedIcon color={iconType.color} fontSize="small" />;
    default:
      return <PersonOutlineIcon color={iconType.color} fontSize="small" />;
  }
}

function ActorHoverCard({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email?: string;
  avatarUrl?: string | null;
}) {
  return (
    <Stack alignItems="center" direction="row" spacing={1} sx={{ minWidth: 180 }}>
      <UserAvatar dimension={28} name={name} src={avatarUrl ?? undefined} />
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, lineHeight: "18px" }}>
          {name}
        </Typography>
        {email ? (
          <Typography noWrap sx={{ color: "text.secondary", fontSize: 12, lineHeight: "16px" }}>
            {email}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

function TimelineActor({
  name,
  email,
  avatarUrl,
  actorType,
}: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  actorType?: "USER" | "SYSTEM";
}) {
  if (!name) return null;

  if (actorType !== "USER") {
    return <Typography color="text.secondary" variant="body2">{name}</Typography>;
  }

  return (
    <Tooltip
      arrow
      placement="top-start"
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "background.paper",
            border: "1px solid var(--mui-palette-divider)",
            borderRadius: 1,
            boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.14)",
            color: "text.primary",
            px: 1.25,
            py: 0.9,
          },
        },
        arrow: {
          sx: {
            color: "background.paper",
            "&:before": { border: "1px solid var(--mui-palette-divider)", boxSizing: "border-box" },
          },
        },
      }}
      title={<ActorHoverCard avatarUrl={avatarUrl} email={email} name={name} />}
    >
      <Typography
        color="text.secondary"
        component="span"
        sx={{ cursor: "help", textDecoration: "underline dotted", textUnderlineOffset: "2px" }}
        tabIndex={0}
        variant="body2"
      >
        {name}
      </Typography>
    </Tooltip>
  );
}

export function ActivityTimeline({
  request,
  viewerRole,
}: {
  request: RequestDetail;
  viewerRole: UserRole;
}) {
  const visibleEvents = request.timeline.filter((item) => canViewTimelineItem(viewerRole, item.visibility));
  const latestEventId = visibleEvents.at(-1)?.id;

  return (
    <SectionCard
      cardSx={{ mt: 2 }}
      headerRight={<Typography color="text.secondary" variant="caption">All times in local timezone</Typography>}
      title="Activity timeline"
    >
      <Stack
        className={styles.timelineWrap}
        spacing={2}
        sx={{
          mt: 1.5,
          maxHeight: { xs: 320, md: 420 },
          overflowY: "auto",
          pr: 0.5,
        }}
      >
        {visibleEvents.length === 0 ? (
          <Typography color="text.secondary" variant="body2">No activity yet.</Typography>
        ) : null}
        {visibleEvents.map((item) => (
          <Box className={styles.timelineItem} key={item.id}>
            <MuiAvatar className={styles.timelineAvatar}>
              <TimelineIcon iconType={eventIcon(item.type)} />
            </MuiAvatar>
            <Box sx={{ flex: 1 }}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Typography fontWeight={600}>{item.title}</Typography>
                {latestEventId === item.id ? <Chip color="success" label="Latest update" size="small" variant="outlined" /> : null}
                {item.visibility === "INTERNAL" ? <Chip label="Internal" size="small" variant="outlined" /> : null}
              </Stack>
              {item.description ? <Typography>{item.description}</Typography> : null}
              <TimelineActor
                actorType={item.actorType}
                avatarUrl={item.actorAvatarUrl}
                email={item.actorEmail}
                name={item.actorName}
              />
            </Box>
            <Typography color="text.secondary" variant="body2">{item.createdAt}</Typography>
          </Box>
        ))}
      </Stack>
    </SectionCard>
  );
}
