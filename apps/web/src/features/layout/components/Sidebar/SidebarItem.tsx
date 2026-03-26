"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import type { NavItem } from "../../types";
import styles from "./sidebar.module.css";

const popupPaperSx = {
  border: "1px solid var(--mui-palette-divider)",
  borderRadius: "8px",
  boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
  overflow: "hidden",
  minWidth: 200,
  ml: 1,
} as const;

type SidebarItemProps = {
  item: NavItem;
  locale: string;
  pathname: string;
  isCollapsed: boolean;
};

export function SidebarItem({ item, locale, pathname, isCollapsed }: SidebarItemProps) {
  const t = useTranslations();
  const fullHref = `/${locale}${item.href}`;
  const hasChildren = Boolean(item.children?.length);
  const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);
  const [isOpen, setIsOpen] = useState(isActive);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  if (hasChildren) {
    if (isCollapsed) {
      return (
        <>
          <Tooltip title={t(item.label)} placement="right" arrow>
            <button
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              onClick={(e) => setPopoverAnchor(e.currentTarget)}
              aria-label={t(item.label)}
            >
              <span className={styles.icon}>{item.icon}</span>
            </button>
          </Tooltip>

          <Menu
            open={Boolean(popoverAnchor)}
            anchorEl={popoverAnchor}
            onClose={() => setPopoverAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{
              paper: { sx: popupPaperSx },
              list: { sx: { p: 1 } },
            }}
          >
            {item.children?.map((child) => {
              const childHref = `/${locale}${child.href}`;
              const isChildActive = pathname === childHref;
              return (
                <MenuItem
                  key={child.href}
                  component={Link}
                  href={childHref}
                  selected={isChildActive}
                  onClick={() => setPopoverAnchor(null)}
                  sx={{ borderRadius: 1, minHeight: 40 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{child.icon}</ListItemIcon>
                  <ListItemText
                    primary={t(child.label)}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600, lineHeight: "20px" }}
                  />
                </MenuItem>
              );
            })}
          </Menu>
        </>
      );
    }

    return (
      <div className={styles.itemGroup}>
        <button
          type="button"
          className={`${styles.item} ${isActive ? styles.active : ""}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label={t(item.label)}
          title={t(item.label)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <>
            <span className={styles.label}>{t(item.label)}</span>
            <ExpandMoreIcon
              className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}
              fontSize="small"
            />
          </>
        </button>

        {isOpen ? (
          <div className={styles.submenu}>
            {item.children?.map((child) => {
              const childHref = `/${locale}${child.href}`;
              const isChildActive = pathname === childHref;

              return (
                <Link
                  key={child.href}
                  href={childHref}
                  className={`${styles.subitem} ${isChildActive ? styles.active : ""}`}
                >
                  <span className={styles.label}>{t(child.label)}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <Tooltip title={t(item.label)} placement="right" arrow>
        <Link
          href={fullHref}
          className={`${styles.item} ${isActive ? styles.active : ""}`}
          aria-label={t(item.label)}
        >
          <span className={styles.icon}>{item.icon}</span>
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link
      href={fullHref}
      className={`${styles.item} ${isActive ? styles.active : ""}`}
      aria-label={t(item.label)}
      title={t(item.label)}
    >
      <span className={styles.icon}>{item.icon}</span>
      <>
        <span className={styles.label}>{t(item.label)}</span>
        {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
      </>
    </Link>
  );
}
