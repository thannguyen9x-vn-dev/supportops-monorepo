"use client";

import { Box, Button, Collapse, Fade, Stack } from "@mui/material";
import { ASSET_STATUSES } from "@supportops/types";

import { ColumnVisibilityPopover } from "@/components/entity-table";
import { FilterSearchInput, FilterSelect } from "@/components/filters";

import type { AssetListFilters } from "../hooks/useAssetFilters";

interface AssetListControlsProps {
  isFilterPanelOpen: boolean;
  hasPendingFilterChanges: boolean;
  hasActiveFilters: boolean;
  onToggleFilterPanel: () => void;
  onCancel: () => void;
  onApply: () => void;
  onClear: () => void;
  t: (key: string) => string;
}

interface AssetListFilterOptionsProps {
  draftFilters: AssetListFilters;
  setDraftFilter: <TKey extends keyof AssetListFilters>(key: TKey, value: AssetListFilters[TKey]) => void;
  serviceTypeOptions: Array<{ value: string; label: string }>;
  locationOptions: Array<{ value: string; label: string }>;
  t: (key: string) => string;
}

interface AssetListSearchProps {
  value: string;
  onChange: (value: string) => void;
  columns: unknown;
  isColumnVisible: (columnId: string) => boolean;
  toggleColumn: (columnId: string) => void;
  showAllColumns: () => void;
  t: (key: string) => string;
}

const BUTTON_OUTLINED_SX = {
  height: 32,
  minHeight: 32,
  fontSize: 13,
  fontWeight: 500,
  px: 2,
  borderColor: "divider",
  backgroundColor: "background.paper",
  color: "text.secondary",
  "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
} as const;

export function AssetListFilterControls({
  isFilterPanelOpen,
  hasPendingFilterChanges,
  hasActiveFilters,
  onToggleFilterPanel,
  onCancel,
  onApply,
  onClear,
  t,
}: AssetListControlsProps) {
  return (
    <Stack alignItems="center" direction="row" spacing={1} useFlexGap>
      <Button color="primary" onClick={onToggleFilterPanel} size="small" sx={{ ...BUTTON_OUTLINED_SX, minHeight: undefined }} variant="outlined">
        {isFilterPanelOpen ? t("actions.hideFilters") : t("actions.showFilters")}
      </Button>

      <Collapse in={hasPendingFilterChanges || hasActiveFilters} orientation="horizontal" timeout={140}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.5 }}>
          <Fade in={hasPendingFilterChanges} timeout={120} unmountOnExit>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button color="inherit" onClick={onCancel} size="small" sx={BUTTON_OUTLINED_SX} variant="outlined">
                {t("actions.cancel")}
              </Button>
              <Button onClick={onApply} size="small" sx={{ height: 32, minHeight: 32, fontSize: 13, fontWeight: 500, px: 2 }} variant="contained">
                {t("actions.apply")}
              </Button>
            </Stack>
          </Fade>

          <Fade in={!hasPendingFilterChanges && hasActiveFilters} timeout={120} unmountOnExit>
            <Button color="inherit" onClick={onClear} size="small" sx={BUTTON_OUTLINED_SX} variant="outlined">
              {t("actions.clear")}
            </Button>
          </Fade>
        </Box>
      </Collapse>
    </Stack>
  );
}

export function AssetListFilterOptions({
  draftFilters,
  setDraftFilter,
  serviceTypeOptions,
  locationOptions,
  t,
}: AssetListFilterOptionsProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ flexWrap: { md: "wrap" } }} useFlexGap>
      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.status")}
        minWidth={170}
        onChange={(value) => setDraftFilter("status", value)}
        options={ASSET_STATUSES.map((status) => ({ value: status, label: t(`statusLabels.${status}`) }))}
        sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
        value={draftFilters.status}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.assetType")}
        minWidth={170}
        onChange={(value) => setDraftFilter("assetTypeId", value)}
        options={serviceTypeOptions}
        sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
        value={draftFilters.assetTypeId}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.location")}
        minWidth={170}
        onChange={(value) => setDraftFilter("locationId", value)}
        options={locationOptions}
        sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
        value={draftFilters.locationId}
      />
    </Stack>
  );
}

export function AssetListSearchBar({
  value,
  onChange,
  columns,
  isColumnVisible,
  toggleColumn,
  showAllColumns,
  t,
}: AssetListSearchProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
      <FilterSearchInput
        onChange={onChange}
        placeholder={t("filters.searchPlaceholder")}
        sx={{
          maxWidth: 400,
          "& .MuiOutlinedInput-root": {
            minHeight: 40,
            borderRadius: "6px",
            backgroundColor: "background.paper",
          },
          "& .MuiOutlinedInput-input": {
            height: "auto",
            fontSize: 14,
            fontWeight: 400,
            lineHeight: "40px",
            padding: "0 16px 0 0",
          },
          "& .MuiInputAdornment-positionStart": {
            marginLeft: 16,
            marginRight: 12,
            alignSelf: "center",
          },
          "& .MuiSvgIcon-root": { fontSize: 22, display: "block", color: "text.secondary" },
        }}
        value={value}
      />
      <ColumnVisibilityPopover
        columns={columns as never}
        isColumnVisible={isColumnVisible}
        showAllColumns={showAllColumns}
        toggleColumn={toggleColumn}
      />
    </Box>
  );
}
