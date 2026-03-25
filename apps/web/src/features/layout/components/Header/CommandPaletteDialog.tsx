"use client";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { alpha, Box, Chip, CircularProgress, Dialog, DialogContent, InputBase, List, ListItemButton, ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { Asset, AssetStatus, ServiceRequest } from "@supportops/types";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { StatusChip } from "@/features/service-ops/requests/components/shared/StatusChip";
import type { RequestStatus } from "@/features/service-ops/requests/types";

import type { CommandPaletteTab } from "./useCommandPalette";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: CommandPaletteTab;
  onTabChange: (tab: CommandPaletteTab) => void;
  query: string;
  onQueryChange: (value: string) => void;
  requestResults: ServiceRequest[];
  assetResults: Asset[];
  isLoading: boolean;
};

function AssetStatusChip({ status }: { status: AssetStatus }) {
  const t = useTranslations("pages.assets.list");

  const sx = (theme: Parameters<typeof alpha>[0] extends never ? never : Parameters<typeof alpha>[0]) => {
    if (status === "ACTIVE") {
      return { borderColor: "transparent", backgroundColor: alpha(theme.palette.success.main, 0.14), color: theme.palette.success.dark };
    }
    if (status === "UNDER_MAINTENANCE") {
      return { borderColor: "transparent", backgroundColor: alpha(theme.palette.warning.main, 0.16), color: theme.palette.warning.dark };
    }
    if (status === "OUT_OF_SERVICE") {
      return { borderColor: "transparent", backgroundColor: alpha(theme.palette.error.main, 0.14), color: theme.palette.error.dark };
    }
    return { borderColor: "transparent", backgroundColor: alpha(theme.palette.grey[500], 0.12), color: theme.palette.text.primary };
  };

  return <Chip label={t(`statusLabels.${status}`)} size="small" sx={sx} variant="outlined" />;
}

export function CommandPaletteDialog({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  query,
  onQueryChange,
  requestResults,
  assetResults,
  isLoading,
}: Props) {
  const t = useTranslations("header.commandPalette");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const handleSelectRequest = (request: ServiceRequest) => {
    onClose();
    router.push(`/${locale}/requests/${request.id}`);
  };

  const handleSelectAsset = (asset: Asset) => {
    onClose();
    router.push(`/${locale}/assets/${asset.id}`);
  };

  const results = activeTab === "assets" ? assetResults : requestResults;
  const hasResults = results.length > 0;

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          mt: "12vh",
          verticalAlign: "top",
          minHeight: 460,
          display: "flex",
          flexDirection: "column",
        },
      }}
      slotProps={{ backdrop: { sx: { backdropFilter: "blur(2px)" } } }}
    >
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Search input */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <SearchOutlinedIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0 }} />
          <InputBase
            autoFocus
            fullWidth
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t(`tabs.${activeTab}Placeholder`)}
            sx={{ fontSize: 15 }}
            value={query}
          />
          {isLoading && <CircularProgress size={16} sx={{ flexShrink: 0 }} />}
        </Box>

        {/* Tab toggle */}
        <Box sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <ToggleButtonGroup
            exclusive
            onChange={(_, val: CommandPaletteTab | null) => {
              if (val) onTabChange(val);
            }}
            size="small"
            value={activeTab}
            sx={{
              gap: 0.5,
              "& .MuiToggleButtonGroup-grouped": {
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "6px !important",
                mx: 0,
              },
              "& .MuiToggleButton-root": {
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                fontSize: 13,
                fontWeight: 500,
                textTransform: "none",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "action.hover",
                  borderColor: "divider",
                },
              },
              "& .MuiToggleButton-root.Mui-selected": {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                color: "primary.main",
                "&:hover": {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.14),
                },
              },
            }}
          >
            <ToggleButton value="requests">
              <AssignmentOutlinedIcon sx={{ fontSize: 15 }} />
              {t("tabs.requests")}
            </ToggleButton>
            <ToggleButton value="assets">
              <HandymanOutlinedIcon sx={{ fontSize: 15 }} />
              {t("tabs.assets")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Results */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {hasResults && (
            <List disablePadding sx={{ overflowY: "auto" }}>
              {activeTab === "requests" &&
                requestResults.map((request) => (
                  <ListItemButton key={request.id} onClick={() => handleSelectRequest(request)} sx={{ px: 2, py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <AssignmentOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={request.title}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500, noWrap: true }}
                      secondary={request.requestCode ?? undefined}
                      secondaryTypographyProps={{ fontSize: 12, color: "text.disabled" }}
                      sx={{ mr: 1.5 }}
                    />
                    <StatusChip status={request.status as RequestStatus} />
                  </ListItemButton>
                ))}

              {activeTab === "assets" &&
                assetResults.map((asset) => (
                  <ListItemButton key={asset.id} onClick={() => handleSelectAsset(asset)} sx={{ px: 2, py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <HandymanOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={asset.name}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500, noWrap: true }}
                      secondary={[asset.assetCode, asset.assetType?.name].filter(Boolean).join(" · ")}
                      secondaryTypographyProps={{ fontSize: 12, color: "text.disabled" }}
                      sx={{ mr: 1.5 }}
                    />
                    <AssetStatusChip status={asset.status} />
                  </ListItemButton>
                ))}
            </List>
          )}

          {!isLoading && query.trim() && !hasResults && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography color="text.secondary" variant="body2">
                {t("noResults", { query })}
              </Typography>
            </Box>
          )}

          {!query.trim() && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography color="text.secondary" variant="body2">
                {t(`tabs.${activeTab}Hint`)}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
