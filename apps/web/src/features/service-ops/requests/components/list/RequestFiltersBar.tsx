import { Box, Button, Collapse, Fade, Stack } from "@mui/material";
import { ColumnVisibilityPopover } from "@/components/entity-table";
import type { FilterSlotProps } from "@/components/entity-table";
import { FilterSearchInput, FilterSelect, FilterToggleButton } from "@/components/filters";
import { useTranslations } from "next-intl";

import { REQUEST_STATUS_FILTER_OPTIONS, type RequestFilters } from "./request-list.types";

type RequestFiltersBarProps = {
  assigneeOptions: Array<{ value: string; label: string }>;
  entityTable: {
    _tableConfig: { columns: unknown[] };
    isColumnVisible: (columnId: string) => boolean;
    toggleColumn: (columnId: string) => void;
    showAllColumns: () => void;
    clearFilters: () => void;
    applyFilters: () => void;
    cancelDraftFilters: () => void;
  };
  hasPendingFilterChanges: boolean;
  isFilterPanelOpen: boolean;
  locationOptions: Array<{ value: string; label: string }>;
  onSearchChange: (value: string) => void;
  serviceTypeOptions: Array<{ value: string; label: string }>;
  setIsFilterPanelOpen: (updater: (value: boolean) => boolean) => void;
};

export function useRequestFiltersBar({
  assigneeOptions,
  entityTable,
  hasPendingFilterChanges,
  isFilterPanelOpen,
  locationOptions,
  onSearchChange,
  serviceTypeOptions,
  setIsFilterPanelOpen,
}: RequestFiltersBarProps) {
  const t = useTranslations("pages.requests.list");

  const renderFilterControls = (f: FilterSlotProps<RequestFilters>) => (
    <Stack alignItems="center" direction="row" spacing={1} useFlexGap>
      <Button
        onClick={() => setIsFilterPanelOpen((current) => !current)}
        size="small"
        variant="outlined"
        color="primary"
        sx={{ height: 32, borderColor: "divider", backgroundColor: "background.paper", color: "text.secondary", fontSize: 13, fontWeight: 500, px: 2, "&:hover": { borderColor: "divider", backgroundColor: "action.hover" } }}
      >
        {isFilterPanelOpen ? t("actions.hideFilters") : t("actions.showFilters")}
      </Button>
      <Collapse in={hasPendingFilterChanges || f.hasActiveFilters} orientation="horizontal" timeout={140}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.5 }}>
          <Fade in={hasPendingFilterChanges} timeout={120} unmountOnExit>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button color="inherit" onClick={entityTable.cancelDraftFilters} size="small" sx={{ height: 32, minHeight: 32, fontSize: 13, fontWeight: 500, px: 2, borderColor: "divider", backgroundColor: "background.paper", color: "text.secondary", "&:hover": { borderColor: "divider", backgroundColor: "action.hover" } }} variant="outlined">{t("actions.cancel")}</Button>
              <Button onClick={entityTable.applyFilters} size="small" sx={{ height: 32, minHeight: 32, fontSize: 13, fontWeight: 500, px: 2 }} variant="contained">{t("actions.apply")}</Button>
            </Stack>
          </Fade>
          <Fade in={!hasPendingFilterChanges && f.hasActiveFilters} timeout={120} unmountOnExit>
            <Button color="inherit" onClick={entityTable.clearFilters} size="small" sx={{ height: 32, minHeight: 32, fontSize: 13, fontWeight: 500, px: 2, borderColor: "divider", backgroundColor: "background.paper", color: "text.secondary", "&:hover": { borderColor: "divider", backgroundColor: "action.hover" } }} variant="outlined">{t("actions.clear")}</Button>
          </Fade>
        </Box>
      </Collapse>
    </Stack>
  );

  const renderSearch = (f: FilterSlotProps<RequestFilters>) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
      <FilterSearchInput
        onChange={(value) => {
          f.setDraftFilter("search", value);
          onSearchChange(value);
        }}
        placeholder={t("filters.searchPlaceholder")}
        sx={{ maxWidth: 400, "& .MuiOutlinedInput-root": { minHeight: 40, borderRadius: "6px", backgroundColor: "background.paper" }, "& .MuiOutlinedInput-input": { height: "auto", fontSize: 14, fontWeight: 400, lineHeight: "40px", padding: "0 16px 0 0" }, "& .MuiInputAdornment-positionStart": { marginLeft: 16, marginRight: 12, alignSelf: "center" }, "& .MuiSvgIcon-root": { fontSize: 22, display: "block", color: "text.secondary" } }}
        value={f.draftFilters.search}
      />
      <ColumnVisibilityPopover columns={entityTable._tableConfig.columns as never} isColumnVisible={entityTable.isColumnVisible} toggleColumn={entityTable.toggleColumn} showAllColumns={entityTable.showAllColumns} />
    </Box>
  );

  const renderFilterOptions = (f: FilterSlotProps<RequestFilters>) => (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ flexWrap: { md: "wrap" } }} useFlexGap>
      <FilterSelect allLabel={t("filters.all")} label={t("filters.status")} minWidth={170} onChange={(value) => f.setDraftFilter("status", value)} options={REQUEST_STATUS_FILTER_OPTIONS.map((status) => ({ value: status, label: t(`statusApi.${status}`) }))} sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }} value={f.draftFilters.status} />
      <FilterSelect allLabel={t("filters.all")} label={t("filters.serviceType")} minWidth={170} onChange={(value) => f.setDraftFilter("serviceType", value)} options={serviceTypeOptions} sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }} value={f.draftFilters.serviceType} />
      <FilterSelect allLabel={t("filters.all")} label={t("filters.assignee")} minWidth={170} onChange={(value) => f.setDraftFilter("assignee", value)} options={assigneeOptions} sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }} value={f.draftFilters.assignee} />
      <FilterSelect allLabel={t("filters.all")} label={t("filters.location")} minWidth={160} onChange={(value) => f.setDraftFilter("location", value)} options={locationOptions} sx={{ width: 160, minWidth: 160, maxWidth: 160, flex: "0 0 160px" }} value={f.draftFilters.location} />
      <FilterSelect allLabel={t("filters.all")} label={t("filters.slaHealth")} minWidth={160} onChange={(value) => f.setDraftFilter("slaHealth", value)} options={[{ value: "At Risk", label: t("slaHealth.At Risk") }, { value: "Overdue", label: t("slaHealth.Overdue") }, { value: "On Track", label: t("slaHealth.On Track") }]} sx={{ width: 160, minWidth: 160, maxWidth: 160, flex: "0 0 160px" }} value={f.draftFilters.slaHealth} />
      <FilterToggleButton checked={f.draftFilters.updatedToday} label={t("filters.updatedToday")} onChange={(checked) => f.setDraftFilter("updatedToday", checked)} />
    </Stack>
  );

  return { renderFilterControls, renderSearch, renderFilterOptions };
}
