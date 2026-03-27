"use client";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { IconButton } from "@mui/material";
import { Avatar } from "@supportops/ui-avatar";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import type { UserRole } from "@supportops/types";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { navigationConfig } from "../../config/navigation";
import { useSidebar } from "../../context/SidebarContext";
import type { NavGroup, NavItem } from "../../types";
import { SidebarGroup } from "./SidebarGroup";
import styles from "./sidebar.module.css";

function hasRoleAccess(item: NavItem, role?: UserRole): boolean {
  if (!item.allowedRoles?.length) {
    return true;
  }

  if (!role) {
    return false;
  }

  return item.allowedRoles.includes(role);
}

function filterNavigationByRole(groups: NavGroup[], role?: UserRole): NavGroup[] {
  const filteredGroups: NavGroup[] = [];

  groups.forEach((group) => {
    const items: NavItem[] = [];

    group.items.forEach((item) => {
      if (!hasRoleAccess(item, role)) {
        return;
      }

      const filteredChildren = item.children?.filter((child) => hasRoleAccess(child, role));
      if (item.children && !filteredChildren?.length) {
        return;
      }

      items.push({
        ...item,
        children: filteredChildren,
      });
    });

    if (items.length > 0) {
      filteredGroups.push({
        ...group,
        items,
      });
    }
  });

  return filteredGroups;
}

export function Sidebar() {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const t = useTranslations();
  const roleLabel = user?.role.replace("_", " ") ?? "";
  const profileHref = `/${locale}/account/profile`;
  const isProfileActive = pathname === profileHref;
  const filteredNavigation = useMemo(
    () => filterNavigationByRole(navigationConfig, user?.role),
    [user?.role],
  );

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          onClick={closeMobileSidebar}
          aria-label={t("header.closeNavigationAriaLabel")}
        />
      ) : null}
      <aside
        className={[
          styles.sidebar,
          isCollapsed ? styles.collapsed : "",
          isMobileOpen ? styles.mobileOpen : "",
        ].join(" ")}
      >
        <div className={styles.brand}>
          {isCollapsed ? (
            <IconButton
              className={styles.toggleButton}
              onClick={toggleSidebar}
              size="small"
              aria-label={t("header.toggleNavigationAriaLabel")}
            >
              <LastPageIcon />
            </IconButton>
          ) : (
            <>
              <div className={styles.brandIdentity}>
                <Image
                  className={styles.brandLogo}
                  src="/icons/brand-mark.png"
                  alt="ServiceOps logo"
                  width={28}
                  height={28}
                />
                <span className={styles.brandName}>ServiceOps</span>
              </div>
              <IconButton
                className={styles.toggleButton}
                onClick={toggleSidebar}
                size="small"
                aria-label={t("header.closeNavigationAriaLabel")}
              >
                <FirstPageIcon />
              </IconButton>
            </>
          )}
        </div>

        <nav className={styles.nav}>
          {filteredNavigation.map((group) => (
            <SidebarGroup
              key={group.groupLabel}
              group={group}
              locale={locale}
              pathname={pathname}
              isCollapsed={isCollapsed}
              groupLabel={t(group.groupLabel)}
            />
          ))}
        </nav>

        <Link
          href={profileHref}
          className={[
            styles.footer,
            isCollapsed ? styles.footerCollapsed : "",
            isProfileActive ? styles.footerActive : "",
          ].join(" ")}
          aria-label={t("header.profile")}
          title={t("header.profile")}
        >
          <Avatar
            dimension={36}
            name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || undefined}
            ring
            ringVariant="neutral"
            src={user?.avatarUrl ?? undefined}
          />
          <div className={styles.userInfo}>
            <p className={styles.userName}>{`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "-"}</p>
            <p className={styles.userRole}>{roleLabel}</p>
          </div>
        </Link>
      </aside>
    </>
  );
}
