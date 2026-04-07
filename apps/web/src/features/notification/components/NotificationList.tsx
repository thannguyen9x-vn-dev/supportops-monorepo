import { Button, CircularProgress, Divider, List, Stack, Tab, Tabs } from "@mui/material";
import { useTranslations } from "next-intl";

import type { NotificationFilter } from "../hooks/useNotifications";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  items: Parameters<typeof NotificationItem>[0]["item"][];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  unreadCountInList: number;
  onClose: () => void;
}

export function NotificationList({
  filter,
  setFilter,
  items,
  isLoading,
  hasMore,
  onLoadMore,
  onRead,
  onMarkAllRead,
  unreadCountInList,
  onClose,
}: NotificationListProps) {
  const t = useTranslations("notifications");

  return (
    <Stack spacing={1}>
      <Tabs onChange={(_, value: NotificationFilter) => setFilter(value)} value={filter}>
        <Tab label={t("tabs.all")} value="all" />
        <Tab label={t("tabs.unread")} value="unread" />
      </Tabs>

      {unreadCountInList > 0 ? (
        <Button onClick={() => void onMarkAllRead()} size="small" sx={{ alignSelf: "flex-end", mr: 1 }}>
          {t("markAllRead")}
        </Button>
      ) : null}

      <Divider />

      {isLoading ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={20} />
        </Stack>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <NotificationEmptyState message={filter === "unread" ? t("emptyUnread") : t("empty")} />
      ) : null}

      <List disablePadding sx={{ maxHeight: 360, overflowY: "auto" }}>
        {items.map((item) => (
          <NotificationItem item={item} key={item.id} onClose={onClose} onRead={onRead} />
        ))}
      </List>

      {hasMore ? (
        <Button onClick={onLoadMore} size="small" sx={{ mb: 1 }}>
          {t("loadMore")}
        </Button>
      ) : null}
    </Stack>
  );
}
