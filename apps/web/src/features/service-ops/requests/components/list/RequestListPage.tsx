"use client";

import AddIcon from "@mui/icons-material/Add";
import { Alert, Box, Button, Typography } from "@mui/material";
import { FormDialog } from "@supportops/ui-dialog";
import { useDialog } from "@supportops/ui";
import type { RequestAssignee } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { EntityTable, useEntityTable } from "@/components/entity-table";
import { EntityListLayout } from "@/features/layout/components/EntityListLayout/EntityListLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requestService } from "@/features/service-ops/requests/services/request.service";

import { RequestIntakeView, REQUEST_INTAKE_FORM_ID } from "../RequestIntakeView";
import styles from "../request-list-screen.module.css";
import { useRequestFiltersBar } from "./RequestFiltersBar";
import { RequestTabBar, useRequestTabs } from "./RequestTabBar";
import { INITIAL_FILTERS, INITIAL_TAB_COUNTS } from "./request-list.types";
import { resolveVisibleTabs, mapServiceRequestToRow } from "./requestList.mapper";
import { useRequestTableColumns } from "./RequestTableColumns";
import { useRequestListFilters } from "../../hooks/useRequestListFilters";
import { useRequestListQuery } from "../../hooks/useRequestListQuery";

export function RequestListPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const t = useTranslations("pages.requests.list");
  const { user } = useAuth();
  const createDialog = useDialog();

  const visibleTabKeys = useMemo(() => resolveVisibleTabs(user?.role), [user?.role]);
  const isEnglishLocale = locale.toLowerCase().startsWith("en");
  const isVietnameseLocale = locale.toLowerCase().startsWith("vi");

  const filters = useRequestListFilters("allRequests");
  const { setActiveTabForQuery, setPageIndex } = filters;
  const [assigneesById, setAssigneesById] = useState<Record<string, RequestAssignee>>({});

  useEffect(() => {
    let isMounted = true;
    void requestService.listAssignees().then(({ data }) => {
      if (!isMounted) return;
      setAssigneesById(Object.fromEntries(data.map((assignee) => [assignee.id, assignee])) as Record<string, RequestAssignee>);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const query = useRequestListQuery({
    activeTabForQuery: filters.activeTabForQuery,
    appliedFilters: filters.appliedFilters,
    assigneesById,
    debouncedSearch: filters.debouncedSearch,
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
    t,
  });

  const tabs = useRequestTabs(visibleTabKeys, query.tabCounts || INITIAL_TAB_COUNTS);
  useEffect(() => {
    setActiveTabForQuery(tabs.activeKey);
    setPageIndex(0);
  }, [setActiveTabForQuery, setPageIndex, tabs.activeKey]);

  const columns = useRequestTableColumns(locale);

  const entityTable = useEntityTable({
    data: query.rows,
    columns,
    rowId: (row) => row.id,
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
    totalRows: query.totalRows,
    serverSide: true,
    onTableStateChange: (state) => {
      filters.setPageIndex(state.pageIndex);
      filters.setPageSize(state.pageSize);
    },
    initialFilters: INITIAL_FILTERS,
    rowDensity: "comfortable",
    pinnedColumns: { left: ["requestCode"], right: ["actions"] },
    defaultColumn: { size: 180, minSize: 120, maxSize: 300 },
    columnVisibilityStorageKey: "table-columns-visibility-requests",
    columnOrderStorageKey: "table-columns-order-requests",
    columnSizingStorageKey: "table-columns-sizing-requests",
  });

  const entityTableWithFilters = {
    ...entityTable,
    draftFilters: filters.draftFilters,
    appliedFilters: filters.appliedFilters,
    setDraftFilter: (key: keyof typeof filters.draftFilters, value: string | boolean) =>
      filters.setDraftFilters((prev) => ({ ...prev, [key]: value })),
    applyFilters: () => {
      filters.setPageIndex(0);
      filters.setAppliedFilters((prev) => ({ ...filters.draftFilters, search: prev.search }));
    },
    cancelDraftFilters: () => {
      filters.setDraftFilters((prev) => ({ ...filters.appliedFilters, search: prev.search }));
      filters.setIsFilterPanelOpen(() => false);
    },
    clearFilters: () => {
      filters.setPageIndex(0);
      filters.setDraftFilters(INITIAL_FILTERS);
      filters.setAppliedFilters(INITIAL_FILTERS);
    },
    hasActiveFilters: filters.hasActiveFilters,
  };

  const serviceTypeOptions = Array.from(new Map(query.rows.map((row) => [row.serviceTypeCode, row.serviceType])).entries()).filter(([value]) => Boolean(value)).map(([value, label]) => ({ value, label }));
  const assigneeOptions = Array.from(new Set(query.rows.map((row) => row.assignee))).filter(Boolean).map((value) => ({ value, label: value }));
  const locationOptions = Array.from(new Set(query.rows.map((row) => row.location))).filter(Boolean).map((value) => ({ value, label: value }));

  const filterBar = useRequestFiltersBar({
    assigneeOptions,
    entityTable: entityTableWithFilters,
    hasPendingFilterChanges: filters.hasPendingFilterChanges,
    isFilterPanelOpen: filters.isFilterPanelOpen,
    locationOptions,
    onSearchChange: (value) => {
      filters.setPageIndex(0);
      filters.setAppliedFilters((prev) => ({ ...prev, search: value }));
    },
    serviceTypeOptions,
    setIsFilterPanelOpen: filters.setIsFilterPanelOpen,
  });

  return (
    <>
      <FormDialog cancelLabel={t("actions.cancel")} dialog={createDialog} formId={REQUEST_INTAKE_FORM_ID} submitLabel={t("actions.submitRequest")} title={t("actions.newRequest")}>
        <RequestIntakeView modal onSuccess={(createdRequest) => { filters.setPageIndex(0); query.setRows((current) => [mapServiceRequestToRow(createdRequest, assigneesById), ...current]); createDialog.close(); void query.loadRequests(); }} />
      </FormDialog>
      <EntityListLayout headerActions={<Button onClick={createDialog.open} startIcon={<AddIcon />} variant="contained">{t("actions.newRequest")}</Button>} headerLeft={<Box><Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }} variant="h4">{t("title")}</Typography><Typography color="text.secondary" variant="subtitle1">{t("subtitle")}</Typography></Box>}>
        {query.loadError ? <Alert action={<Button color="inherit" onClick={() => void query.loadRequests()} size="small">{t("actions.retry")}</Button>} severity="error" sx={{ mb: 2 }}>{query.loadError}</Alert> : null}
        <div className={styles.tableViewport}>
          <EntityTable
            emptyState={query.isLoadingRows ? "Loading requests..." : t("emptyState")}
            entityTable={entityTableWithFilters}
            onRowClick={(row) => router.push(`/${locale}/requests/${row.id}`)}
            paginationLabels={{ showing: (from, to, total) => `${t("pagination.showing")} ${total === 0 ? 0 : to - from + 1} ${t("pagination.outOf")} ${total}`, rows: t("pagination.rows"), outOf: t("pagination.outOf"), previous: t("pagination.previous"), next: t("pagination.next") }}
            renderFilterControls={filterBar.renderFilterControls}
            renderFilterOptions={filterBar.renderFilterOptions}
            renderSearch={filterBar.renderSearch}
            showFilterOptions={filters.isFilterPanelOpen}
            tabs={<RequestTabBar instance={tabs} isEnglishLocale={isEnglishLocale} isVietnameseLocale={isVietnameseLocale} />}
          />
        </div>
      </EntityListLayout>
    </>
  );
}
