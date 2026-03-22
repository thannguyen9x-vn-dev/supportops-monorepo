"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { useCallback, useId, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

import type { EntityAction } from "./types";

export interface EntityActionMenuProps {
  actions: EntityAction[];
  /** Custom trigger icon. Defaults to MoreVertIcon. */
  icon?: ReactNode;
  size?: "small" | "medium";
  tooltip?: string;
  disabled?: boolean;
}

export function EntityActionMenu({ actions, icon, size = "medium", tooltip, disabled }: EntityActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleAction = useCallback(
    (action: EntityAction) => {
      handleClose();
      action.onClick();
    },
    [handleClose],
  );

  const button = (
    <IconButton
      aria-controls={open ? menuId : undefined}
      aria-expanded={open || undefined}
      aria-haspopup="true"
      disabled={disabled}
      onClick={handleOpen}
      size={size}
    >
      {icon ?? <MoreVertIcon fontSize="small" />}
    </IconButton>
  );

  return (
    <>
      {tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button}

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        id={menuId}
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            sx: {
              minWidth: 180,
              mt: "4px",
              border: "1px solid var(--mui-palette-divider)",
              borderRadius: "8px",
              boxShadow:
                "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
              overflow: "hidden",
            },
          },
          list: {
            sx: { p: 1 },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {actions.map((action) => {
          const isError = action.color === "error";

          return [
            action.divider ? <Divider key={`${action.key}-divider`} /> : null,
            <MenuItem
              disabled={action.disabled}
              key={action.key}
              onClick={() => handleAction(action)}
              sx={{
                borderRadius: 1,
                minHeight: 40,
                ...(isError ? { color: "error.main" } : {}),
              }}
            >
              {action.icon ? (
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    ...(isError ? { color: "error.main" } : {}),
                  }}
                >
                  {action.icon}
                </ListItemIcon>
              ) : null}
              <ListItemText
                primary={action.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600, lineHeight: "20px" }}
              />
            </MenuItem>,
          ];
        })}
      </Menu>
    </>
  );
}
