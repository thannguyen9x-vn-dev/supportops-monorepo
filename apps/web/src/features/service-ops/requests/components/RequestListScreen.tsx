"use client";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EntityTable, useEntityTable, ColumnVisibilityPopover } from "@/components/entity-table";
import type { EntityColumnDef, FilterSlotProps } from "@/components/entity-table";
import { FilterSearchInput, FilterSelect, FilterToggleButton } from "@/components/filters";
import { EntityTabs, useEntityTabs } from "@/components/tabs";
import { EntityListLayout } from "@/features/layout/components/EntityListLayout/EntityListLayout";
import styles from "./request-list-screen.module.css";

type RequestStatus = "Open" | "In Progress" | "On Hold";
type RequestPriority = "Low" | "Medium" | "High" | "Critical";
type SlaHealth = "On Track" | "At Risk" | "Overdue";

type RequestListItem = {
  id: string;
  requestCode: string;
  title: string;
  serviceType: string;
  status: RequestStatus;
  priority: RequestPriority;
  assignee: string;
  location: string;
  updatedAt: string;
  slaHealth: SlaHealth;
  slaDue: string;
};

type RequestFilters = {
  search: string;
  status: string;
  serviceType: string;
  assignee: string;
  location: string;
  slaHealth: string;
  updatedToday: boolean;
};

const TAB_KEYS = [
  "allRequests",
  "submittedTriage",
  "unassigned",
  "slaRisk",
  "escalated",
  "closed",
] as const;

const MOCK_ROWS: RequestListItem[] = [
  {
    id: "sr-0001",
    requestCode: "SR-0001",
    title: "Office Maintenance Requests",
    serviceType: "Office Type",
    status: "Open",
    priority: "Critical",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Feb 7, 2023 2:30 PM",
    slaHealth: "At Risk",
    slaDue: "Apr 11, 2023 8:00 PM",
  },
  {
    id: "sr-0002",
    requestCode: "SR-0002",
    title: "Short Construction Services",
    serviceType: "Office Type",
    status: "In Progress",
    priority: "Critical",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Feb 7, 2023 2:30 PM",
    slaHealth: "At Risk",
    slaDue: "Apr 11, 2023 8:00 PM",
  },
  {
    id: "sr-0003",
    requestCode: "SR-0003",
    title: "Requestor Interim Services",
    serviceType: "Service Type",
    status: "In Progress",
    priority: "High",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Feb 7, 2023 2:30 PM",
    slaHealth: "At Risk",
    slaDue: "Apr 11, 2023 8:00 PM",
  },
  {
    id: "sr-0004",
    requestCode: "SR-0004",
    title: "Connected Metal Requests",
    serviceType: "Service Type",
    status: "Open",
    priority: "High",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "Overdue",
    slaDue: "Apr 11, 2023 3:00 PM",
  },
  {
    id: "sr-0005",
    requestCode: "SR-0005",
    title: "Traffic Consultation Requests",
    serviceType: "Service Type",
    status: "In Progress",
    priority: "High",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:30 PM",
    slaHealth: "Overdue",
    slaDue: "Apr 11, 2023 3:00 PM",
  },
  {
    id: "sr-0006",
    requestCode: "SR-0006",
    title: "Repair Proshnance Services",
    serviceType: "Service Type",
    status: "In Progress",
    priority: "Medium",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "On Track",
    slaDue: "Apr 11, 2023 8:00 PM",
  },
  {
    id: "sr-0007",
    requestCode: "SR-0007",
    title: "Request Management Services",
    serviceType: "Service Type",
    status: "On Hold",
    priority: "Medium",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "Overdue",
    slaDue: "Apr 11, 2023 7:00 PM",
  },
  {
    id: "sr-0008",
    requestCode: "SR-0008",
    title: "Wherspark Sight Requests",
    serviceType: "Service Type",
    status: "On Hold",
    priority: "Low",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "On Track",
    slaDue: "Apr 11, 2023 7:00 PM",
  },
  {
    id: "sr-0009",
    requestCode: "SR-0009",
    title: "Condictor Client Services",
    serviceType: "Service Type",
    status: "On Hold",
    priority: "Low",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "On Track",
    slaDue: "Apr 11, 2023 7:00 PM",
  },
  {
    id: "sr-0010",
    requestCode: "SR-0010",
    title: "Office Maintenance Event",
    serviceType: "Service Type",
    status: "On Hold",
    priority: "Low",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "On Track",
    slaDue: "Apr 11, 2023 7:00 PM",
  },
  {
    id: "sr-0011",
    requestCode: "SR-0011",
    title: "Recommanasement Problem",
    serviceType: "Service Type",
    status: "Open",
    priority: "Low",
    assignee: "Unassigned",
    location: "Office 1",
    updatedAt: "Mar 7, 2023 2:40 PM",
    slaHealth: "On Track",
    slaDue: "Apr 11, 2023 7:00 PM",
  },
];

const INITIAL_FILTERS: RequestFilters = {
  search: "",
  status: "",
  serviceType: "",
  assignee: "",
  location: "",
  slaHealth: "",
  updatedToday: false,
};

type RequestTabKey = (typeof TAB_KEYS)[number];

function applyRequestFilters(
  rows: RequestListItem[],
  activeTab: RequestTabKey,
  filters: RequestFilters,
): RequestListItem[] {
  const search = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    // Tab filter
    if (!matchTabFilter(row, activeTab)) return false;

    // Search
    if (search) {
      const matched =
        row.requestCode.toLowerCase().includes(search) ||
        row.title.toLowerCase().includes(search) ||
        row.serviceType.toLowerCase().includes(search);
      if (!matched) return false;
    }

    // Dropdown filters
    if (filters.status && row.status !== filters.status) return false;
    if (filters.serviceType && row.serviceType !== filters.serviceType) return false;
    if (filters.assignee && row.assignee !== filters.assignee) return false;
    if (filters.location && row.location !== filters.location) return false;
    if (filters.slaHealth && row.slaHealth !== filters.slaHealth) return false;

    return true;
  });
}

function matchTabFilter(row: RequestListItem, activeTab: RequestTabKey): boolean {
  if (activeTab === "unassigned") return row.assignee === "Unassigned";
  if (activeTab === "slaRisk") return row.slaHealth !== "On Track";
  if (activeTab === "closed") return row.status === "On Hold";

  return true;
}

function StatusBadge({ value }: { value: RequestStatus }) {
  const colorMap: Record<RequestStatus, "default" | "success" | "info"> = {
    Open: "info",
    "In Progress": "success",
    "On Hold": "default",
  };

  const t = useTranslations("pages.requests.list");

  return <Chip color={colorMap[value]} label={t(`status.${value}`)} size="small" variant="outlined" />;
}

function PriorityBadge({ value }: { value: RequestPriority }) {
  const bgMap: Record<RequestPriority, string> = {
    Critical: "#fddede",
    High: "#ffe7bf",
    Medium: "#fff5b8",
    Low: "#d7f2d9",
  };

  const t = useTranslations("pages.requests.list");

  return <Chip label={t(`priority.${value}`)} size="small" sx={{ backgroundColor: bgMap[value], borderColor: "transparent" }} variant="outlined" />;
}

function SlaBadge({ value }: { value: SlaHealth }) {
  const bgMap: Record<SlaHealth, string> = {
    "On Track": "#d7f2d9",
    "At Risk": "#ffe7bf",
    Overdue: "#fddede",
  };

  const t = useTranslations("pages.requests.list");

  return <Chip label={t(`slaHealth.${value}`)} size="small" sx={{ backgroundColor: bgMap[value], borderColor: "transparent" }} variant="outlined" />;
}

export function RequestListScreen() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const t = useTranslations("pages.requests.list");

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const isEnglishLocale = locale.toLowerCase().startsWith("en");
  const isVietnameseLocale = locale.toLowerCase().startsWith("vi");

  const tabCounts = useMemo(
    () =>
      TAB_KEYS.reduce<Record<RequestTabKey, number>>((acc, key) => {
        acc[key] = MOCK_ROWS.filter((row) => matchTabFilter(row, key)).length;
        return acc;
      }, {} as Record<RequestTabKey, number>),
    [],
  );

  const requestTabs = useEntityTabs<RequestTabKey>({
    items: TAB_KEYS.map((key) => ({
      key,
      label: t(`tabs.${key}`),
      badge: (
        <Box
          component="span"
          sx={{
            minWidth: 20,
            px: 0.75,
            py: 0.125,
            borderRadius: 999,
            backgroundColor: "action.selected",
            color: "text.secondary",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: "18px",
            textAlign: "center",
          }}
        >
          {tabCounts[key]}
        </Box>
      ),
    })),
    defaultActiveKey: "allRequests",
  });

  // Client-side filter state lives here — no circular dep with table data.
  // For server-side pagination, move this into useEntityTable's onApplyFilters.
  const [draftFilters, setDraftFilters] = useState<RequestFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RequestFilters>(INITIAL_FILTERS);

  const displayRows = useMemo(
    () => applyRequestFilters(MOCK_ROWS, requestTabs.activeKey, appliedFilters),
    [requestTabs.activeKey, appliedFilters],
  );

  const columns = useMemo<EntityColumnDef<RequestListItem>[]>(
    () => [
      {
        accessorKey: "requestCode",
        header: t("columns.requestCode"),
        size: 120,
        minSize: 120,
        maxSize: 120,
        sortable: true,
        hideable: false, // Always visible
      },
      {
        accessorKey: "title",
        header: t("columns.title"),
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "serviceType",
        header: t("columns.serviceType"),
        cell: ({ row }) => t(`serviceType.${row.original.serviceType}`),
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "priority",
        header: t("columns.priority"),
        cell: ({ row }) => <PriorityBadge value={row.original.priority} />,
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "assignee",
        header: t("columns.assignee"),
        cell: ({ row }) => t(`assignee.${row.original.assignee}`),
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "location",
        header: t("columns.location"),
        cell: ({ row }) => t(`location.${row.original.location}`),
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "updatedAt",
        header: t("columns.updatedAt"),
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "slaHealth",
        header: t("columns.slaHealth"),
        cell: ({ row }) => <SlaBadge value={row.original.slaHealth} />,
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "slaDue",
        header: t("columns.slaDue"),
        cell: ({ row }) => (
          <Box sx={{ color: row.original.slaHealth === "Overdue" ? "error.main" : "inherit" }}>
            {row.original.slaDue}
          </Box>
        ),
        sortable: true,
        hideable: true,
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 168,
        minSize: 168,
        maxSize: 168,
        sortable: false,
        hideable: false, // Actions always visible
        cell: () => (
          <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
            <Button color="inherit" onClick={(event) => event.stopPropagation()} size="small" variant="text">
              <VisibilityOutlinedIcon fontSize="small" />
            </Button>
            <Button color="inherit" onClick={(event) => event.stopPropagation()} size="small" variant="text">
              <EditOutlinedIcon fontSize="small" />
            </Button>
            <Button color="inherit" onClick={(event) => event.stopPropagation()} size="small" variant="text">
              <PersonAddAlt1OutlinedIcon fontSize="small" />
            </Button>
            <Button color="inherit" onClick={(event) => event.stopPropagation()} size="small" variant="text">
              <RemoveCircleOutlineIcon fontSize="small" />
            </Button>
          </Stack>
        ),
      },
    ],
    [t],
  );

  const entityTable = useEntityTable<RequestListItem, RequestFilters>({
    data: displayRows,
    columns,
    rowId: (row) => row.id,
    // Filter state is managed above — pass dummy initialFilters so the hook
    // doesn't own filter state. The filter slots receive our local state via
    // the overrides below.
    initialFilters: INITIAL_FILTERS,
    rowDensity: "comfortable",
    pinnedColumns: { left: ["requestCode"], right: ["actions"] },
    defaultColumn: { size: 180, minSize: 120, maxSize: 300 },
    columnVisibilityStorageKey: "table-columns-visibility-requests",
  });

  const hasActiveFilters = Boolean(
    appliedFilters.status ||
      appliedFilters.serviceType ||
      appliedFilters.assignee ||
      appliedFilters.location ||
      appliedFilters.slaHealth ||
      appliedFilters.updatedToday,
  );

  // Override the filter API on the instance so <EntityTable>'s slots receive
  // our local filter state (not the dummy one inside the hook).
  const entityTableWithFilters = {
    ...entityTable,
    draftFilters,
    appliedFilters,
    setDraftFilter: <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) =>
      setDraftFilters((prev) => ({ ...prev, [key]: value })),
    applyFilters: () => {
      setAppliedFilters(draftFilters);
    },
    clearFilters: () => {
      setDraftFilters(INITIAL_FILTERS);
      setAppliedFilters(INITIAL_FILTERS);
    },
    hasActiveFilters,
  };

  const renderFilterControls = (f: FilterSlotProps<RequestFilters>) => (
    <Stack alignItems="center" direction="row" spacing={1} useFlexGap>
      <Button
        onClick={() => setIsFilterPanelOpen((current) => !current)}
        size="small"
        variant="outlined"
        color="primary"
        sx={{
          height: 32,
          borderColor: "grey.300",
          backgroundColor: "grey.50",
          color: "grey.600",
          fontSize: 13,
          fontWeight: 500,
          px: 2,
          "&:hover": {
            borderColor: "grey.300",
            backgroundColor: "grey.100",
          },
        }}
      >
        {isFilterPanelOpen ? t("actions.hideFilters") : t("actions.showFilters")}
      </Button>
      {f.hasActiveFilters ? (
        <>
          <Button color="inherit" onClick={entityTableWithFilters.clearFilters} variant="text">
            {t("actions.clear")}
          </Button>
          <Button onClick={entityTableWithFilters.applyFilters} variant="contained">
            {t("actions.apply")}
          </Button>
        </>
      ) : null}
    </Stack>
  );

  const renderSearch = (f: FilterSlotProps<RequestFilters>) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
      <FilterSearchInput
        onChange={(value) => f.setDraftFilter("search", value)}
        placeholder={t("filters.searchPlaceholder")}
        sx={{
          maxWidth: 400,
          "& .MuiOutlinedInput-root": {
            minHeight: 40,
            borderRadius: 2,
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
          "& .MuiSvgIcon-root": {
            fontSize: 22,
            display: "block",
            color: "text.secondary",
          },
        }}
        value={f.draftFilters.search}
      />
      <ColumnVisibilityPopover
        columns={entityTableWithFilters._tableConfig.columns}
        isColumnVisible={entityTableWithFilters.isColumnVisible}
        toggleColumn={entityTableWithFilters.toggleColumn}
        showAllColumns={entityTableWithFilters.showAllColumns}
      />
    </Box>
  );

  const renderFilterOptions = (f: FilterSlotProps<RequestFilters>) => (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      sx={{ flexWrap: { md: "wrap" } }}
      useFlexGap
    >
      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.status")}
        minWidth={170}
        onChange={(value) => f.setDraftFilter("status", value)}
        options={[
          { value: "Open", label: t("status.Open") },
          { value: "In Progress", label: t("status.In Progress") },
          { value: "On Hold", label: t("status.On Hold") },
        ]}
        value={f.draftFilters.status}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.serviceType")}
        minWidth={170}
        onChange={(value) => f.setDraftFilter("serviceType", value)}
        options={[
          { value: "Office Type", label: t("serviceType.Office Type") },
          { value: "Service Type", label: t("serviceType.Service Type") },
        ]}
        value={f.draftFilters.serviceType}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.assignee")}
        minWidth={170}
        onChange={(value) => f.setDraftFilter("assignee", value)}
        options={[{ value: "Unassigned", label: t("assignee.Unassigned") }]}
        value={f.draftFilters.assignee}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.location")}
        minWidth={160}
        onChange={(value) => f.setDraftFilter("location", value)}
        options={[{ value: "Office 1", label: t("location.Office 1") }]}
        value={f.draftFilters.location}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.slaHealth")}
        minWidth={160}
        onChange={(value) => f.setDraftFilter("slaHealth", value)}
        options={[
          { value: "At Risk", label: t("slaHealth.At Risk") },
          { value: "Overdue", label: t("slaHealth.Overdue") },
          { value: "On Track", label: t("slaHealth.On Track") },
        ]}
        value={f.draftFilters.slaHealth}
      />

      <FilterToggleButton
        checked={f.draftFilters.updatedToday}
        label={t("filters.updatedToday")}
        onChange={(checked) => f.setDraftFilter("updatedToday", checked)}
      />
    </Stack>
  );

  return (
    <EntityListLayout
      headerActions={
        <Button onClick={() => router.push(`/${locale}/requests/create`)} startIcon={<AddIcon />} variant="contained">
          {t("actions.newRequest")}
        </Button>
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
      <div className={styles.tableViewport}>
        <EntityTable
          emptyState={t("emptyState")}
          entityTable={entityTableWithFilters}
          onRowClick={(row) => router.push(`/${locale}/requests/${row.id}`)}
          paginationLabels={{
            showing: (from, to, total) =>
              `${t("pagination.showing")} ${total === 0 ? 0 : to - from + 1} ${t("pagination.outOf")} ${total}`,
            rows: t("pagination.rows"),
            outOf: t("pagination.outOf"),
            previous: t("pagination.previous"),
            next: t("pagination.next"),
          }}
          renderFilterControls={renderFilterControls}
          renderFilterOptions={renderFilterOptions}
          renderSearch={renderSearch}
          showFilterOptions={isFilterPanelOpen}
          tabs={
            <Box sx={{ mt: 1.5 }}>
              <EntityTabs
                instance={requestTabs}
                slotProps={{
                  variant: "scrollable",
                  scrollButtons: false,
                  sx: {
                    minHeight: 32,
                    "& .MuiTab-root": {
                      minHeight: 32,
                      py: 0.5,
                      mr: 1,
                      textTransform: "none",
                      minWidth: "unset",
                    },
                    "& .MuiTab-root:last-of-type": {
                      mr: 0,
                    },
                    ...(isEnglishLocale && {
                      "& .MuiTab-root:nth-of-type(1)": { width: 132 },
                      "& .MuiTab-root:nth-of-type(2)": { width: 168 },
                      "& .MuiTab-root:nth-of-type(3)": { width: 130 },
                      "& .MuiTab-root:nth-of-type(4)": { width: 106 },
                      "& .MuiTab-root:nth-of-type(5)": { width: 116 },
                      "& .MuiTab-root:nth-of-type(6)": { width: 94 },
                    }),
                    ...(isVietnameseLocale && {
                      "& .MuiTab-root:nth-of-type(1)": { width: 146 },
                      "& .MuiTab-root:nth-of-type(2)": { width: 158 },
                      "& .MuiTab-root:nth-of-type(3)": { width: 160 },
                      "& .MuiTab-root:nth-of-type(4)": { width: 114 },
                      "& .MuiTab-root:nth-of-type(5)": { width: 134 },
                      "& .MuiTab-root:nth-of-type(6)": { width: 102 },
                    }),
                  },
                }}
              />
            </Box>
          }
        />
      </div>
    </EntityListLayout>
  );
}
