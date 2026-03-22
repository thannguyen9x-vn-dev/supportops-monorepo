"use client";

import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Badge, IconButton } from "@mui/material";
import { useTranslations } from "next-intl";

import { LanguageMenu } from "./LanguageMenu";
import { SearchBar } from "./SearchBar";
import { ThemeModeToggle } from "./ThemeModeToggle";
import { UserMenu } from "./UserMenu";
import styles from "./header.module.css";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <SearchBar />
      </div>

      <div className={styles.right}>
        <LanguageMenu />
        <ThemeModeToggle />
        <IconButton className={styles.notificationButton} size="small" aria-label={t("notificationsAriaLabel")}>
          <Badge badgeContent={5} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <div className={styles.userMenuWrap}>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
