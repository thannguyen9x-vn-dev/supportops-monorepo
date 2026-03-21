"use client";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { ButtonBase } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";

import styles from "./header.module.css";

export function ThemeModeToggle() {
  const t = useTranslations("header");
  const { mode, systemMode, setMode } = useColorScheme();

  if (!mode) {
    return null;
  }

  const resolvedMode = mode === "system" ? (systemMode ?? "light") : mode;
  const nextMode = resolvedMode === "dark" ? "light" : "dark";
  const ariaLabel =
    resolvedMode === "dark" ? t("switchToLightModeAriaLabel") : t("switchToDarkModeAriaLabel");

  return (
    <ButtonBase className={styles.themeButton} onClick={() => setMode(nextMode)} aria-label={ariaLabel}>
      {resolvedMode === "dark" ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
    </ButtonBase>
  );
}
