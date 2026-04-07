import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CircleNotificationsOutlinedIcon from "@mui/icons-material/CircleNotificationsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { useParams, useRouter } from "next/navigation";

import type { NotificationItem as NotificationItemModel, NotificationEventType } from "@supportops/types";

import { getNotificationHref } from "../hooks/useNotifications";

function resolveIcon(type: NotificationEventType) {
  if (type === "REQUEST_ASSIGNED") return <AssignmentOutlinedIcon fontSize="small" />;
  if (type === "REQUEST_COMMENTED" || type === "REQUEST_MENTIONED") {
    return <ChatBubbleOutlineOutlinedIcon fontSize="small" />;
  }
  if (type === "SLA_NEAR_BREACH_RESPONSE" || type === "SLA_NEAR_BREACH_RESOLUTION") {
    return <WarningAmberOutlinedIcon color="warning" fontSize="small" />;
  }
  return <CircleNotificationsOutlinedIcon fontSize="small" />;
}

export function NotificationItem({
  item,
  onRead,
  onClose,
}: {
  item: NotificationItemModel;
  onRead: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const handleClick = async () => {
    if (!item.isRead) {
      await onRead(item.id);
    }

    const href = getNotificationHref(item);
    if (href) {
      router.push(`/${locale}${href}`);
    }

    onClose();
  };

  return (
    <ListItemButton
      onClick={() => void handleClick()}
      sx={{ alignItems: "flex-start", bgcolor: item.isRead ? "transparent" : "action.hover" }}
    >
      <ListItemIcon sx={{ minWidth: 34, pt: 0.5 }}>{resolveIcon(item.type)}</ListItemIcon>
      <ListItemText
        primary={
          <Stack spacing={0.5}>
            <Typography fontWeight={item.isRead ? 500 : 700} variant="body2">
              {item.title}
            </Typography>
            <Typography color="text.secondary" noWrap variant="caption">
              {item.body}
            </Typography>
          </Stack>
        }
        secondary={
          <Typography color="text.secondary" variant="caption">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
