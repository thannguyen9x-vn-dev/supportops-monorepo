"use client";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { CommandPaletteDialog } from "./CommandPaletteDialog";
import styles from "./header.module.css";
import { useCommandPalette } from "./useCommandPalette";

export function SearchBar() {
  const t = useTranslations("header");
  const palette = useCommandPalette();
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

  return (
    <>
      <label className={styles.search} onClick={palette.open} role="button" style={{ cursor: "pointer" }}>
        <SearchOutlinedIcon fontSize="small" />
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t("searchPlaceholder")}</Typography>
          <Typography
            sx={{
              fontSize: 11,
              color: "text.disabled",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "4px",
              px: "5px",
              py: "1px",
              ml: 1,
              lineHeight: 1.6,
            }}
          >
            {shortcutLabel}
          </Typography>
        </Box>
      </label>

      <CommandPaletteDialog
        activeTab={palette.activeTab}
        assetResults={palette.assetResults}
        isLoading={palette.isLoading}
        isOpen={palette.isOpen}
        onClose={palette.close}
        onQueryChange={palette.setQuery}
        onTabChange={palette.setActiveTab}
        query={palette.query}
        requestResults={palette.requestResults}
      />
    </>
  );
}
