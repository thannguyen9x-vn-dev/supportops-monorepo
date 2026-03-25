"use client";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Alert, Box, Button, Chip, Collapse, Fade, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useDialog } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";
import type { Asset, AssetStatus, AssetType } from "@supportops/types";
import { ASSET_STATUSES } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { EntityTable, ColumnVisibilityPopover, useEntityTable, type EntityColumnDef } from "@/components/entity-table";
import { EntityTableActionMenu } from "@/components/entity-actions";
import { FilterSearchInput, FilterSelect } from "@/components/filters";
import { EntityListLayout } from "@/features/layout/components/EntityListLayout/EntityListLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ASSET_FORM_ID, AssetFormView } from "./AssetFormView";
import { assetService } from "../services/asset.service";
import styles from "../../requests/components/request-list-screen.module.css";

const INITIAL_FILTERS = {
  search: "",
  status: "",
  assetTypeId: "",
  locationId: "",
};

type AssetListFilters = typeof INITIAL_FILTERS;

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function AssetStatusBadge({ value }: { value: AssetStatus }) {
  const t = useTranslations("pages.serviceOps.assets.list");

  return (
    <Chip
      label={t(`statusLabels.${value}`)}
      size="small"
      sx={(theme) => {
        if (value === "UNDER_MAINTENANCE") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.18),
            color: theme.palette.warning.dark,
          };
        }

        if (value === "OUT_OF_SERVICE") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.18),
            color: theme.palette.error.dark,
          };
        }

        if (value === "RETIRED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.grey[500], 0.18),
            color: theme.palette.text.secondary,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.success.main, 0.16),
          color: theme.palette.success.dark,
        };
      }}
      variant="outlined"
    />
  );
}

function AssetRowActions({ id, locale, canManage }: { id: string; locale: string; canManage: boolean }) {
  const router = useRouter();
  const t = useTranslations("pages.serviceOps.assets.list");

  return (
    <EntityTableActionMenu
      actions={[
        {
          key: "view",
          label: t("actions.rowActions.view"),
          icon: <VisibilityOutlinedIcon fontSize="small" />,
          onClick: () => router.push(`/${locale}/assets/${id}`),
        },
        ...(canManage
          ? [
              {
                key: "edit",
                label: t("actions.rowActions.edit"),
                icon: <EditOutlinedIcon fontSize="small" />,
                onClick: () => router.push(`/${locale}/assets/${id}/edit`),
              },
            ]
          : []),
      ]}
    />
  );
}

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<AssetListFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AssetListFilters>(INITIAL_FILTERS);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(appliedFilters.search);
      setPageIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [appliedFilters.search]);

  const loadAssets = useCallback(async () => {
    setIsLoadingRows(true);
    setLoadError(null);

    try {
      const { data, meta } = await assetService.list({
        page: pageIndex + 1,
        size: pageSize,
        search: debouncedSearch || undefined,
        status: appliedFilters.status ? (appliedFilters.status as AssetStatus) : undefined,
        assetTypeId: appliedFilters.assetTypeId || undefined,
        locationId: appliedFilters.locationId || undefined,
      });

      setAssets(data);
      setTotalRows(meta?.total ?? data.length);
    } catch {
      setLoadError(t("loadError"));
    } finally {
      setIsLoadingRows(false);
    }
  }, [appliedFilters.assetTypeId, appliedFilters.locationId, appliedFilters.status, debouncedSearch, pageIndex, pageSize, t]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    let isMounted = true;

    void assetService
      .listAssetTypes()
      .then(({ data }) => {
        if (!isMounted) return;
        setAssetTypes(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const hasPendingFilterChanges = useMemo(
    () =>
      draftFilters.status !== appliedFilters.status
      || draftFilters.assetTypeId !== appliedFilters.assetTypeId
      || draftFilters.locationId !== appliedFilters.locationId,
    [appliedFilters, draftFilters],
  );

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        appliedFilters.search
        || appliedFilters.status
        || appliedFilters.assetTypeId
        || appliedFilters.locationId,
      ),
    [appliedFilters],
  );

  const columns = useMemo<EntityColumnDef<Asset>[]>(() => [
    {
      id: "assetCode",
      accessorKey: "assetCode",
      header: t("columns.assetCode"),
      size: 150,
      minSize: 120,
      maxSize: 260,
      sortable: true,
      hideable: false,
      cell: ({ row }) => (
        <Typography fontFamily="monospace" fontSize="0.875rem" fontWeight={600}>
          {row.original.assetCode}
        </Typography>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: t("columns.name"),
      sortable: true,
      hideable: true,
    },
    {
      id: "assetType",
      header: t("columns.assetType"),
      sortable: false,
      hideable: true,
      cell: ({ row }) => row.original.assetType?.name ?? "-",
    },
    {
      id: "locationId",
      accessorKey: "locationId",
      header: t("columns.location"),
      sortable: true,
      hideable: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: t("columns.status"),
      sortable: true,
      hideable: true,
      cell: ({ row }) => <AssetStatusBadge value={row.original.status} />,
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: t("columns.updatedAt"),
      sortable: true,
      hideable: true,
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      header: t("columns.actions"),
      size: 52,
      minSize: 52,
      maxSize: 52,
      sortable: false,
      hideable: false,
      resizable: false,
      cell: ({ row }) => <AssetRowActions canManage={canManage} id={row.original.id} locale={locale} />,
    },
  ], [canManage, locale, t]);

  const entityTable = useEntityTable<Asset, AssetListFilters>({
    data: assets,
    columns,
    rowId: (row) => row.id,
    pageIndex,
    pageSize,
    totalRows,
    serverSide: true,
    onTableStateChange: (state) => {
      setPageIndex(state.pageIndex);
      setPageSize(state.pageSize);
    },
    initialFilters: INITIAL_FILTERS,
    rowDensity: "comfortable",
    pinnedColumns: { left: ["assetCode"], right: ["actions"] },
    defaultColumn: { size: 180, minSize: 120, maxSize: 300 },
    columnVisibilityStorageKey: "table-columns-visibility-assets",
    columnOrderStorageKey: "table-columns-order-assets",
    columnSizingStorageKey: "table-columns-sizing-assets",
  });

  const sortedAssets = useMemo(() => {
    const sortingState = entityTable.sorting[0];
    if (!sortingState) return assets;

    const getSortableValue = (asset: Asset, columnId: string): string | number => {
      switch (columnId) {
        case "assetCode":
          return asset.assetCode;
        case "name":
          return asset.name;
        case "assetType":
          return asset.assetType?.name ?? "";
        case "locationId":
          return asset.locationId;
        case "status":
          return asset.status;
        case "updatedAt":
          return new Date(asset.updatedAt).getTime();
        default:
          return "";
      }
    };

    return [...assets].sort((left, right) => {
      const leftValue = getSortableValue(left, sortingState.id);
      const rightValue = getSortableValue(right, sortingState.id);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortingState.desc ? rightValue - leftValue : leftValue - rightValue;
      }

      const compare = String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: "base" });
      return sortingState.desc ? -compare : compare;
    });
  }, [assets, entityTable.sorting]);

  const entityTableWithFilters = {
    ...entityTable,
    _tableConfig: {
      ...entityTable._tableConfig,
      data: sortedAssets,
    },
    draftFilters,
    appliedFilters,
    setDraftFilter: (key: keyof AssetListFilters, value: AssetListFilters[keyof AssetListFilters]) => {
      setDraftFilters((prev) => ({ ...prev, [key]: value }));
    },
    applyFilters: () => {
      setPageIndex(0);
      setAppliedFilters((prev) => ({ ...draftFilters, search: prev.search }));
    },
    cancelDraftFilters: () => {
      setDraftFilters((prev) => ({ ...appliedFilters, search: prev.search }));
      setIsFilterPanelOpen(false);
    },
    clearFilters: () => {
      setPageIndex(0);
      setDraftFilters(INITIAL_FILTERS);
      setAppliedFilters(INITIAL_FILTERS);
    },
    hasActiveFilters,
  };

  const serviceTypeOptions = useMemo(
    () => assetTypes.map((assetType) => ({ value: assetType.id, label: assetType.name })),
    [assetTypes],
  );

  const locationOptions = useMemo(
    () => Array.from(new Set(assets.map((asset) => asset.locationId))).filter(Boolean).map((value) => ({ value, label: value })),
    [assets],
  );

  return (
    <>
      <FormDialog
        cancelLabel={tForm("actions.cancel")}
        dialog={createDialog}
        formId={ASSET_FORM_ID}
        submitLabel={tForm("actions.create")}
        title={tForm("createTitle")}
      >
        <AssetFormView
          modal
          mode="create"
          onSuccess={() => {
            setPageIndex(0);
            createDialog.close();
            void loadAssets();
          }}
        />
      </FormDialog>
      <EntityListLayout
      headerActions={
        canManage ? (
          <Button onClick={createDialog.open} startIcon={<AddIcon />} variant="contained">
            {t("newAsset")}
          </Button>
        ) : undefined
      }
      headerLeft={
        <Box>
          <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }} variant="h4">
            {t("title")}
          </Typography>
          <Typography color="text.secondary" variant="subtitle1">
            {t("subtitle")}
          </Typography>
        </Box>
      }
    >
      {loadError ? (
        <Alert
          action={(
            <Button color="inherit" onClick={() => void loadAssets()} size="small">
              {t("actions.retry")}
            </Button>
          )}
          severity="error"
          sx={{ mb: 2 }}
        >
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
          renderFilterControls={(f) => (
            <Stack alignItems="center" direction="row" spacing={1} useFlexGap>
              <Button
                color="primary"
                onClick={() => setIsFilterPanelOpen((current) => !current)}
                size="small"
                sx={{
                  height: 32,
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                  color: "text.secondary",
                  fontSize: 13,
                  fontWeight: 500,
                  px: 2,
                  "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
                }}
                variant="outlined"
              >
                {isFilterPanelOpen ? t("actions.hideFilters") : t("actions.showFilters")}
              </Button>

              <Collapse in={hasPendingFilterChanges || f.hasActiveFilters} orientation="horizontal" timeout={140}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.5 }}>
                  <Fade in={hasPendingFilterChanges} timeout={120} unmountOnExit>
                    <Stack alignItems="center" direction="row" spacing={1}>
                      <Button
                        color="inherit"
                        onClick={entityTableWithFilters.cancelDraftFilters}
                        size="small"
                        sx={{
                          height: 32,
                          minHeight: 32,
                          fontSize: 13,
                          fontWeight: 500,
                          px: 2,
                          borderColor: "divider",
                          backgroundColor: "background.paper",
                          color: "text.secondary",
                          "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
                        }}
                        variant="outlined"
                      >
                        {t("actions.cancel")}
                      </Button>
                      <Button
                        onClick={entityTableWithFilters.applyFilters}
                        size="small"
                        sx={{ height: 32, minHeight: 32, fontSize: 13, fontWeight: 500, px: 2 }}
                        variant="contained"
                      >
                        {t("actions.apply")}
                      </Button>
                    </Stack>
                  </Fade>

                  <Fade in={!hasPendingFilterChanges && f.hasActiveFilters} timeout={120} unmountOnExit>
                    <Button
                      color="inherit"
                      onClick={entityTableWithFilters.clearFilters}
                      size="small"
                      sx={{
                        height: 32,
                        minHeight: 32,
                        fontSize: 13,
                        fontWeight: 500,
                        px: 2,
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                        color: "text.secondary",
                        "&:hover": { borderColor: "divider", backgroundColor: "action.hover" },
                      }}
                      variant="outlined"
                    >
                      {t("actions.clear")}
                    </Button>
                  </Fade>
                </Box>
              </Collapse>
            </Stack>
          )}
          renderFilterOptions={(f) => (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ flexWrap: { md: "wrap" } }} useFlexGap>
              <FilterSelect
                allLabel={t("filters.all")}
                label={t("filters.status")}
                minWidth={170}
                onChange={(value) => f.setDraftFilter("status", value)}
                options={ASSET_STATUSES.map((status) => ({ value: status, label: t(`statusLabels.${status}`) }))}
                sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
                value={f.draftFilters.status}
              />

              <FilterSelect
                allLabel={t("filters.all")}
                label={t("filters.assetType")}
                minWidth={170}
                onChange={(value) => f.setDraftFilter("assetTypeId", value)}
                options={serviceTypeOptions}
                sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
                value={f.draftFilters.assetTypeId}
              />

              <FilterSelect
                allLabel={t("filters.all")}
                label={t("filters.location")}
                minWidth={170}
                onChange={(value) => f.setDraftFilter("locationId", value)}
                options={locationOptions}
                sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
                value={f.draftFilters.locationId}
              />
            </Stack>
          )}
          renderSearch={(f) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
              <FilterSearchInput
                onChange={(value) => {
                  setPageIndex(0);
                  setDraftFilters((prev) => ({ ...prev, search: value }));
                  setAppliedFilters((prev) => ({ ...prev, search: value }));
                  f.setDraftFilter("search", value);
                }}
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
                value={f.draftFilters.search}
              />
              <ColumnVisibilityPopover
                columns={entityTable._tableConfig.columns as never}
                isColumnVisible={entityTable.isColumnVisible}
                showAllColumns={entityTable.showAllColumns}
                toggleColumn={entityTable.toggleColumn}
              />
            </Box>
          )}
          showFilterOptions={isFilterPanelOpen}
        />
      </div>
      </EntityListLayout>
    </>
  );
}
