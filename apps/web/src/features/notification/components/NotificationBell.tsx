"use client";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { Badge, IconButton } from "@mui/material";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useNotificationCount } from "../hooks/useNotificationCount";
import { NotificationPopover } from "./NotificationPopover";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const count = useNotificationCount();

  return (
    <>
      <IconButton
        aria-label={t("ariaLabel")}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
      >
        <Badge badgeContent={count} color="error" invisible={count === 0} max={99}>
          <NotificationsOutlinedIcon fontSize="small" />
        </Badge>
      </IconButton>
      <NotificationPopover
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        open={Boolean(anchorEl)}
      />
    </>
  );
}
