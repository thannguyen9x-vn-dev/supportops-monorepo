"use client";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import {
  Box,
  ButtonBase,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { Avatar } from "@supportops/ui-avatar";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { mockUser } from "../../../../shared/mock/user";
import styles from "./header.module.css";

const popupPaperSx = {
  border: "1px solid var(--mui-palette-divider)",
  borderRadius: "8px",
  boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
  overflow: "hidden",
  minWidth: 260,
  mt: 1,
} as const;

export function UserMenu() {
  const t = useTranslations("header");
  const { logout, user } = useAuth();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "en";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    logout();
  };

  const handleOpenProfile = () => {
    handleClose();
    router.push(`/${locale}/account/profile?tab=general`);
  };

  const handleOpenUpdatePassword = () => {
    handleClose();
    router.push(`/${locale}/account/profile?tab=security`);
  };

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : mockUser.name;
  const email = user?.email;

  return (
    <>
      <ButtonBase
        className={styles.userButton}
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="header-user-menu"
        aria-label={t("userMenuAriaLabel")}
      >
        <Avatar name={displayName} ring ringVariant="neutral" size="sm" src={user?.avatarUrl ?? undefined} />
      </ButtonBase>

      <Menu
        id="header-user-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        keepMounted
        slotProps={{
          paper: {
            sx: popupPaperSx,
          },
          list: {
            sx: { p: 1 },
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1.25, display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar dimension={36} name={displayName} ring ringVariant="neutral" src={user?.avatarUrl ?? undefined} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: "20px" }} noWrap>
              {displayName}
            </Typography>
            {email ? (
              <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: "18px" }} noWrap>
                {email}
              </Typography>
            ) : null}
          </Box>
        </Box>
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleOpenProfile} sx={{ borderRadius: 1, minHeight: 40 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <PersonOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("profile")}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600, lineHeight: "20px" }}
          />
        </MenuItem>

        <MenuItem onClick={handleOpenUpdatePassword} sx={{ borderRadius: 1, minHeight: 40 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LockResetOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("updatePassword")}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600, lineHeight: "20px" }}
          />
        </MenuItem>

        <MenuItem onClick={handleSignOut} sx={{ borderRadius: 1, minHeight: 40, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 32, color: "error.main" }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("signOut")}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600, lineHeight: "20px" }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
