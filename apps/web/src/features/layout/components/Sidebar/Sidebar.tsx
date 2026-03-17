"use client";

import { Avatar } from "@mui/material";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { UserRole } from "@supportops/contracts";

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
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const t = useTranslations();
  const roleLabel = user?.role.replace("_", " ") ?? "";
  const filteredNavigation = filterNavigationByRole(navigationConfig, user?.role);

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
          <span className={styles.brandMark}>D</span>
          {!isCollapsed ? <span className={styles.brandName}>ServiceOps</span> : null}
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

        {!isCollapsed ? (
          <div className={styles.footer}>
            <Avatar src={user?.avatarUrl ?? undefined} sx={{ width: 36, height: 36 }}>
              {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.trim() || "U"}
            </Avatar>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "-"}</p>
              <p className={styles.userRole}>{roleLabel}</p>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
