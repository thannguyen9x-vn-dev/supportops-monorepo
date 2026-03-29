"use client";

import { LanguageMenu } from "./LanguageMenu";
import { NotificationBell } from "@/features/notification/components/NotificationBell";
import { SearchBar } from "./SearchBar";
import { ThemeModeToggle } from "./ThemeModeToggle";
import { UserMenu } from "./UserMenu";
import styles from "./header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <SearchBar />
      </div>

      <div className={styles.right}>
        <LanguageMenu />
        <ThemeModeToggle />
        <NotificationBell />
        <div className={styles.userMenuWrap}>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
