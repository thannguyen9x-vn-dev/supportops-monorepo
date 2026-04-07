import { Paper, Popover, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useNotifications } from "../hooks/useNotifications";
import { NotificationList } from "./NotificationList";

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export function NotificationPopover({ anchorEl, open, onClose }: NotificationPopoverProps) {
  const t = useTranslations("notifications");
  const notifications = useNotifications();
  const { filter, resetPage } = notifications;

  useEffect(() => {
    resetPage();
  }, [filter, resetPage]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      onClose={onClose}
      open={open}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Paper sx={{ width: 420, maxWidth: "90vw", p: 1 }}>
        <Stack sx={{ px: 1.5, py: 1 }}>
          <Typography variant="h6">{t("title")}</Typography>
        </Stack>

        <NotificationList
          filter={notifications.filter}
          hasMore={notifications.hasMore}
          isLoading={notifications.isLoading}
          items={notifications.items}
          onClose={onClose}
          onLoadMore={notifications.loadMore}
          onMarkAllRead={notifications.markAllRead}
          onRead={notifications.markRead}
          setFilter={notifications.setFilter}
          unreadCountInList={notifications.unreadCountInList}
        />
      </Paper>
    </Popover>
  );
}
