"use client";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Badge, IconButton } from "@mui/material";
import { useTranslations } from "next-intl";

import { useSidebar } from "../../context/SidebarContext";
import { LanguageMenu } from "./LanguageMenu";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import styles from "./header.module.css";

export function Header() {
  const { toggleSidebar } = useSidebar();
  const t = useTranslations("header");

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <IconButton
          onClick={toggleSidebar}
          size="small"
          aria-label={t("toggleNavigationAriaLabel")}
        >
          <MenuIcon />
        </IconButton>
        <SearchBar />
      </div>

      <div className={styles.right}>
        <LanguageMenu />
        <IconButton size="small" aria-label={t("notificationsAriaLabel")}>
          <Badge badgeContent={5} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <UserMenu />
      </div>
    </header>
  );
}
