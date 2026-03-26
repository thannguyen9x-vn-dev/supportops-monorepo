"use client";

import AddIcon from "@mui/icons-material/Add";
import { Alert, Box, Button, Typography } from "@mui/material";
import { useDialog } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";
import type { Asset, AssetStatus, AssetType } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { EntityTable, useEntityTable } from "@/components/entity-table";
import { EntityListLayout } from "@/features/layout/components/EntityListLayout/EntityListLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { ASSET_FORM_ID, AssetFormView } from "./AssetFormView";
import { useAssetColumns } from "./assetColumns";
import { AssetListFilterControls, AssetListFilterOptions, AssetListSearchBar } from "./AssetListFilters";
import { useAssetFilters } from "../hooks/useAssetFilters";
import { assetService } from "../services/asset.service";
import styles from "../../requests/components/request-list-screen.module.css";

export function AssetListView() {
  const t = useTranslations("pages.serviceOps.assets.list");
  const tForm = useTranslations("pages.serviceOps.assets.form");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();
  const createDialog = useDialog();

  const canManage = user?.role === "TENANT_ADMIN";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const filters = useAssetFilters();

  const entityTable = useEntityTable<Asset, ReturnType<typeof useAssetFilters>["draftFilters"]>({
    data: assets,
    columns: useAssetColumns({ canManage, locale }),
    rowId: (row) => row.id,
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
    totalRows,
    serverSide: true,
    onTableStateChange: (state) => {
      filters.setPageIndex(state.pageIndex);
      filters.setPageSize(state.pageSize);
    },
    initialFilters: { search: "", status: "", assetTypeId: "", locationId: "" },
    rowDensity: "comfortable",
    pinnedColumns: { left: ["assetCode"], right: ["actions"] },
    defaultColumn: { size: 180, minSize: 120, maxSize: 300 },
    columnVisibilityStorageKey: "table-columns-visibility-assets",
    columnOrderStorageKey: "table-columns-order-assets",
    columnSizingStorageKey: "table-columns-sizing-assets",
  });

  const sortedAssets = useMemo(
    () => filters.sortAssets(assets, entityTable.sorting),
    [assets, entityTable.sorting, filters],
  );

  const loadAssets = useCallback(async () => {
    setIsLoadingRows(true);
    setLoadError(null);

    try {
      const { data, meta } = await assetService.list({
        page: filters.pageIndex + 1,
        size: filters.pageSize,
        search: filters.debouncedSearch || undefined,
        status: filters.appliedFilters.status ? (filters.appliedFilters.status as AssetStatus) : undefined,
        assetTypeId: filters.appliedFilters.assetTypeId || undefined,
        locationId: filters.appliedFilters.locationId || undefined,
      });
      setAssets(data);
      setTotalRows(meta?.total ?? data.length);
    } catch {
      setLoadError(t("loadError"));
    } finally {
      setIsLoadingRows(false);
    }
  }, [filters.appliedFilters.assetTypeId, filters.appliedFilters.locationId, filters.appliedFilters.status, filters.debouncedSearch, filters.pageIndex, filters.pageSize, t]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    let isMounted = true;
    void assetService.listAssetTypes().then(({ data }) => {
      if (isMounted) setAssetTypes(data);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const serviceTypeOptions = useMemo(() => assetTypes.map((assetType) => ({ value: assetType.id, label: assetType.name })), [assetTypes]);
  const locationOptions = useMemo(() => Array.from(new Set(assets.map((asset) => asset.locationId))).filter(Boolean).map((value) => ({ value, label: value })), [assets]);

  const entityTableWithFilters = {
    ...entityTable,
    _tableConfig: {
      ...entityTable._tableConfig,
      data: sortedAssets,
    },
    draftFilters: filters.draftFilters,
    appliedFilters: filters.appliedFilters,
    setDraftFilter: filters.setDraftFilter,
    applyFilters: filters.applyFilters,
    cancelDraftFilters: filters.cancelDraftFilters,
    clearFilters: filters.clearFilters,
    hasActiveFilters: filters.hasActiveFilters,
  };

  return (
    <>
      <FormDialog cancelLabel={tForm("actions.cancel")} dialog={createDialog} formId={ASSET_FORM_ID} submitLabel={tForm("actions.create")} title={tForm("createTitle")}>
        <AssetFormView modal mode="create" onSuccess={() => { filters.setPageIndex(0); createDialog.close(); void loadAssets(); }} />
      </FormDialog>

      <EntityListLayout
        headerActions={canManage ? <Button onClick={createDialog.open} startIcon={<AddIcon />} variant="contained">{t("newAsset")}</Button> : undefined}
        headerLeft={
          <Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }} variant="h4">{t("title")}</Typography>
            <Typography color="text.secondary" variant="subtitle1">{t("subtitle")}</Typography>
          </Box>
        }
      >
        {loadError ? (
          <Alert action={<Button color="inherit" onClick={() => void loadAssets()} size="small">{t("actions.retry")}</Button>} severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        ) : null}

        <div className={styles.tableViewport}>
          <EntityTable
            emptyState={isLoadingRows ? t("loading") : t("emptyState")}
            entityTable={entityTableWithFilters}
            onRowClick={(row) => router.push(`/${locale}/assets/${row.id}`)}
            paginationLabels={{
              showing: (from, to, total) => `${t("pagination.showing")} ${total === 0 ? 0 : to - from + 1} ${t("pagination.outOf")} ${total}`,
              rows: t("pagination.rows"),
              outOf: t("pagination.outOf"),
              previous: t("pagination.previous"),
              next: t("pagination.next"),
            }}
            renderFilterControls={() => (
              <AssetListFilterControls
                hasActiveFilters={filters.hasActiveFilters}
                hasPendingFilterChanges={filters.hasPendingFilterChanges}
                isFilterPanelOpen={filters.isFilterPanelOpen}
                onApply={filters.applyFilters}
                onCancel={filters.cancelDraftFilters}
                onClear={filters.clearFilters}
                onToggleFilterPanel={() => filters.setIsFilterPanelOpen((current) => !current)}
                t={t}
              />
            )}
            renderFilterOptions={() => (
              <AssetListFilterOptions
                draftFilters={filters.draftFilters}
                locationOptions={locationOptions}
                serviceTypeOptions={serviceTypeOptions}
                setDraftFilter={filters.setDraftFilter}
                t={t}
              />
            )}
            renderSearch={(f) => (
              <AssetListSearchBar
                columns={entityTable._tableConfig.columns as never}
                isColumnVisible={entityTable.isColumnVisible}
                onChange={(value) => {
                  filters.setSearch(value);
                  f.setDraftFilter("search", value);
                }}
                showAllColumns={entityTable.showAllColumns}
                t={t}
                toggleColumn={entityTable.toggleColumn}
                value={filters.draftFilters.search}
              />
            )}
            showFilterOptions={filters.isFilterPanelOpen}
          />
        </div>
      </EntityListLayout>
    </>
  );
}
