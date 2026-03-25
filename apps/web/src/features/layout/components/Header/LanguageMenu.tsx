"use client";

import LanguageIcon from "@mui/icons-material/Language";
import { ButtonBase, Menu, MenuItem } from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type MouseEvent } from "react";

import type { AppLocale } from "@/i18n/config";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { settingsService } from "@/features/settings/services/settings.service";
import styles from "./header.module.css";

const LOCALE_OPTIONS: Array<{ value: AppLocale; label: string }> = [
  { value: "vi", label: "VI" },
  { value: "en", label: "EN" },
];

function replaceLocaleInPath(pathname: string, nextLocale: AppLocale): string {
  const normalizedPath = pathname || "/";
  if (normalizedPath === "/") {
    return `/${nextLocale}`;
  }

  if (/^\/(vi|en)(\/|$)/.test(normalizedPath)) {
    return normalizedPath.replace(/^\/(vi|en)(?=\/|$)/, `/${nextLocale}`);
  }

  return `/${nextLocale}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

export function LanguageMenu() {
  const t = useTranslations("header");
  const locale = useLocale() as AppLocale;
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLocale = (nextLocale: AppLocale) => {
    handleClose();
    if (nextLocale === locale) {
      return;
    }

    if (user) {
      void settingsService.updateProfile({ locale: nextLocale }).catch(() => {
        return;
      });
    }

    const nextPathname = replaceLocaleInPath(pathname, nextLocale);
    const query = searchParams.toString();
    router.replace(query ? `${nextPathname}?${query}` : nextPathname);
  };

  return (
    <>
      <ButtonBase
        className={styles.languageButton}
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="header-language-menu"
        aria-label={t("languageMenuAriaLabel")}
      >
        <LanguageIcon fontSize="small" />
        <span className={styles.languageCode}>{locale.toUpperCase()}</span>
      </ButtonBase>

      <Menu
        id="header-language-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        keepMounted
        slotProps={{
          paper: {
            sx: {
              border: "1px solid var(--mui-palette-divider)",
              borderRadius: "8px",
              boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
              overflow: "hidden",
              minWidth: 120,
              mt: 1,
            },
          },
          list: {
            sx: { p: 1, display: "flex", flexDirection: "column", gap: 0.5 },
          },
        }}
      >
        {LOCALE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === locale}
            onClick={() => handleChangeLocale(option.value)}
            sx={{ borderRadius: 1, minHeight: 40, fontSize: 14, fontWeight: 600, lineHeight: "20px" }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
