"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Avatar, ButtonBase, Menu, MenuItem } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { mockUser } from "../../../../shared/mock/user";
import styles from "./header.module.css";

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
    router.push(`/${locale}/settings`);
  };

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : mockUser.name;
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : mockUser.initials;

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
        <Avatar src={user?.avatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
          {initials}
        </Avatar>
        <span className={styles.userButtonName}>{displayName}</span>
        <KeyboardArrowDownIcon fontSize="small" />
      </ButtonBase>

      <Menu
        id="header-user-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        keepMounted
      >
        <MenuItem onClick={handleOpenProfile}>{t("profile")}</MenuItem>
        <MenuItem onClick={handleSignOut}>{t("signOut")}</MenuItem>
      </Menu>
    </>
  );
}
