"use client";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Alert, Box, Button, Chip, Collapse, Fade, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { EntityTableActionMenu } from "@/components/entity-actions";
import { UserIdentity } from "@/components/user";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormDialog } from "@supportops/ui-dialog";
import { useDialog } from "@supportops/ui";
import type { RequestAssignee, ServiceRequest, UserRole } from "@supportops/types";

import { RequestIntakeScreen, REQUEST_INTAKE_FORM_ID } from "./RequestIntakeScreen";

import { EntityTable, useEntityTable, ColumnVisibilityPopover } from "@/components/entity-table";
import type { EntityColumnDef, FilterSlotProps } from "@/components/entity-table";
import { FilterSearchInput, FilterSelect, FilterToggleButton } from "@/components/filters";
import { EntityTabs, useEntityTabs } from "@/components/tabs";
import { EntityListLayout } from "@/features/layout/components/EntityListLayout/EntityListLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requestService } from "@/features/service-ops/requests/services/request.service";
import { ApiError } from "@/lib/api";
import { canViewAllTenantRequests, canViewAssignedOrRelatedRequests } from "@/lib/auth/rbac";
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
  assigneeId: string | null;
  assignee: string;
  assigneeProfile: {
    name: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
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

const INITIAL_ROWS: RequestListItem[] = [];

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

function resolveVisibleTabs(role?: UserRole): RequestTabKey[] {
  if (canViewAllTenantRequests(role)) {
    return [...TAB_KEYS];
  }

  if (canViewAssignedOrRelatedRequests(role)) {
    return ["allRequests", "slaRisk", "closed"];
  }

  return ["allRequests", "closed"];
}

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function mapRequestStatus(status: ServiceRequest["status"]): RequestStatus {
  if (status === "ASSIGNED" || status === "IN_PROGRESS" || status === "REOPENED") {
    return "In Progress";
  }

  if (status === "RESOLVED" || status === "CLOSED" || status === "CANCELLED") {
    return "On Hold";
  }

  return "Open";
}

function mapRequestPriority(priority: ServiceRequest["priority"]): RequestPriority {
  if (priority === "URGENT") return "Critical";
  if (priority === "HIGH") return "High";
  if (priority === "MEDIUM") return "Medium";
  return "Low";
}

function resolveAssigneeProfile(
  assigneeId: string | null | undefined,
  assigneeMap: Record<string, RequestAssignee>,
): Pick<RequestListItem, "assignee" | "assigneeProfile" | "assigneeId"> {
  if (!assigneeId) {
    return {
      assigneeId: null,
      assignee: "Unassigned",
      assigneeProfile: null,
    };
  }

  const assignee = assigneeMap[assigneeId];
  const name = assignee?.fullName?.trim() || assigneeId;

  return {
    assigneeId,
    assignee: name,
    assigneeProfile: {
      name,
      email: assignee?.email,
      avatarUrl: null,
    },
  };
}

function mapServiceRequestToRow(
  request: ServiceRequest,
  assigneeMap: Record<string, RequestAssignee>,
): RequestListItem {
  const updatedAt = formatDisplayDate(request.updatedAt);
  const assigneeData = resolveAssigneeProfile(request.assigneeId, assigneeMap);

  return {
    id: request.id,
    requestCode: request.requestCode ?? request.id,
    title: request.title,
    serviceType: request.serviceTypeName ?? request.serviceTypeCode ?? request.serviceTypeId,
    status: mapRequestStatus(request.status),
    priority: mapRequestPriority(request.priority),
    ...assigneeData,
    location: request.locationId,
    updatedAt,
    slaHealth: "On Track",
    slaDue: updatedAt,
  };
}

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
  const t = useTranslations("pages.requests.list");

  return (
    <Chip
      label={t(`priority.${value}`)}
      size="small"
      sx={(theme) => {
        if (value === "Critical") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.18),
            color: theme.palette.error.dark,
          };
        }

        if (value === "High" || value === "Medium") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, value === "High" ? 0.2 : 0.15),
            color: theme.palette.warning.dark,
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

function SlaBadge({ value }: { value: SlaHealth }) {
  const t = useTranslations("pages.requests.list");

  return (
    <Chip
      label={t(`slaHealth.${value}`)}
      size="small"
      sx={(theme) => {
        if (value === "Overdue") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.18),
            color: theme.palette.error.dark,
          };
        }

        if (value === "At Risk") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.2),
            color: theme.palette.warning.dark,
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

export function RequestListScreen() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const t = useTranslations("pages.requests.list");
  const { user } = useAuth();
  const createDialog = useDialog();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [rows, setRows] = useState<RequestListItem[]>(INITIAL_ROWS);
  const [assigneesById, setAssigneesById] = useState<Record<string, RequestAssignee>>({});
  const [isLoadingRows, setIsLoadingRows] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<RequestFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RequestFilters>(INITIAL_FILTERS);
  const isEnglishLocale = locale.toLowerCase().startsWith("en");
  const isVietnameseLocale = locale.toLowerCase().startsWith("vi");
  const visibleTabKeys = useMemo(() => resolveVisibleTabs(user?.role), [user?.role]);

  useEffect(() => {
    let isMounted = true;

    const loadAssignees = async () => {
      try {
        const { data } = await requestService.listAssignees();
        if (!isMounted) return;
        setAssigneesById(
          Object.fromEntries(data.map((assignee) => [assignee.id, assignee])) as Record<
            string,
            RequestAssignee
          >,
        );
      } catch {
        // Non-blocking for request list. The table still renders using assigneeId fallback.
      }
    };

    void loadAssignees();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadRequests = useCallback(async (search?: string) => {
    setIsLoadingRows(true);
    setLoadError(null);

    try {
      const { data } = await requestService.list({
        page: 1,
        size: 100,
        search: search?.trim() ? search.trim() : undefined,
      });
      setRows(data.map((request) => mapServiceRequestToRow(request, assigneesById)));
    } catch (error) {
      if (error instanceof ApiError) {
        setLoadError(error.error.message);
      } else {
        setLoadError("Unable to load requests. Please try again.");
      }
    } finally {
      setIsLoadingRows(false);
    }
  }, [assigneesById]);

  useEffect(() => {
    if (Object.keys(assigneesById).length === 0) return;

    setRows((currentRows) => {
      let changed = false;
      const nextRows = currentRows.map((row) => {
        const resolvedAssignee = resolveAssigneeProfile(row.assigneeId, assigneesById);

        if (
          row.assignee === resolvedAssignee.assignee &&
          row.assigneeProfile?.email === resolvedAssignee.assigneeProfile?.email
        ) {
          return row;
        }

        changed = true;
        return {
          ...row,
          ...resolvedAssignee,
        };
      });

      return changed ? nextRows : currentRows;
    });
  }, [assigneesById]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRequests(appliedFilters.search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [appliedFilters.search, loadRequests]);

  const tabCounts = useMemo(
    () =>
      visibleTabKeys.reduce<Record<RequestTabKey, number>>((acc, key) => {
        acc[key] = rows.filter((row) => matchTabFilter(row, key)).length;
        return acc;
      }, {} as Record<RequestTabKey, number>),
    [rows, visibleTabKeys],
  );

  const requestTabs = useEntityTabs<RequestTabKey>({
    items: visibleTabKeys.map((key) => ({
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

  const displayRows = useMemo(
    () => applyRequestFilters(rows, requestTabs.activeKey, appliedFilters),
    [rows, requestTabs.activeKey, appliedFilters],
  );
  const serviceTypeOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.serviceType)))
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    [rows],
  );
  const assigneeOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.assignee)))
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    [rows],
  );
  const locationOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.location)))
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    [rows],
  );

  const columns = useMemo<EntityColumnDef<RequestListItem>[]>(
    () => [
      {
        accessorKey: "requestCode",
        header: t("columns.requestCode"),
        size: 160,
        minSize: 120,
        maxSize: 280,
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
        cell: ({ row }) => row.original.serviceType,
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
        cell: ({ row }) =>
          row.original.assigneeProfile ? (
            <UserIdentity
              avatarSize={28}
              email={row.original.assigneeProfile.email}
              name={row.original.assigneeProfile.name}
              variant="full"
            />
          ) : (
            row.original.assignee
          ),
        sortable: true,
        hideable: true,
      },
      {
        accessorKey: "location",
        header: t("columns.location"),
        cell: ({ row }) => row.original.location,
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
        size: 52,
        minSize: 52,
        maxSize: 52,
        sortable: false,
        hideable: false, // Actions always visible
        resizable: false, // Fixed-width pinned column
        cell: ({ row }) => (
          <EntityTableActionMenu
            actions={[
              {
                key: "view",
                label: t("actions.rowActions.view"),
                icon: <VisibilityOutlinedIcon fontSize="small" />,
                onClick: () => router.push(`/${locale}/requests/${row.original.id}`),
              },
              {
                key: "edit",
                label: t("actions.rowActions.edit"),
                icon: <EditOutlinedIcon fontSize="small" />,
                onClick: () => {},
              },
              {
                key: "assign",
                label: t("actions.rowActions.assign"),
                icon: <PersonAddAlt1OutlinedIcon fontSize="small" />,
                onClick: () => {},
              },
              {
                key: "cancel",
                label: t("actions.rowActions.cancelRequest"),
                icon: <RemoveCircleOutlineIcon fontSize="small" />,
                color: "error",
                divider: true,
                onClick: () => {},
              },
            ]}
          />
        ),
      },
    ],
    [t, locale, router],
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
    columnOrderStorageKey: "table-columns-order-requests",
    columnSizingStorageKey: "table-columns-sizing-requests",
  });

  const hasActiveFilters = Boolean(
    appliedFilters.status ||
      appliedFilters.serviceType ||
      appliedFilters.assignee ||
      appliedFilters.location ||
      appliedFilters.slaHealth ||
      appliedFilters.updatedToday,
  );
  const hasPendingFilterChanges = useMemo(() => {
    const nonSearchKeys: (keyof RequestFilters)[] = [
      "status",
      "serviceType",
      "assignee",
      "location",
      "slaHealth",
      "updatedToday",
    ];

    return nonSearchKeys.some((key) => draftFilters[key] !== appliedFilters[key]);
  }, [draftFilters, appliedFilters]);

  // Override the filter API on the instance so <EntityTable>'s slots receive
  // our local filter state (not the dummy one inside the hook).
  const entityTableWithFilters = {
    ...entityTable,
    draftFilters,
    appliedFilters,
    setDraftFilter: <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) =>
      setDraftFilters((prev) => ({ ...prev, [key]: value })),
    applyFilters: () => {
      setAppliedFilters((prev) => ({ ...draftFilters, search: prev.search }));
    },
    cancelDraftFilters: () => {
      setDraftFilters((prev) => ({ ...appliedFilters, search: prev.search }));
      setIsFilterPanelOpen(false);
    },
    clearFilters: () => {
      setDraftFilters(INITIAL_FILTERS);
      setAppliedFilters(INITIAL_FILTERS);
    },
    hasActiveFilters,
  };

  const renderFilterControls = (f: FilterSlotProps<RequestFilters>) => (
    <Stack alignItems="center" direction="row" spacing={1} useFlexGap>
      {/*
        Keep all filter action buttons visually consistent.
        Shared token ensures equal height with "Show/Hide Filters".
      */}
      <Button
        onClick={() => setIsFilterPanelOpen((current) => !current)}
        size="small"
        variant="outlined"
        color="primary"
        sx={{
          height: 32,
          borderColor: "divider",
          backgroundColor: "background.paper",
          color: "text.secondary",
          fontSize: 13,
          fontWeight: 500,
          px: 2,
          "&:hover": {
            borderColor: "divider",
            backgroundColor: "action.hover",
          },
        }}
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
                  "&:hover": {
                    borderColor: "divider",
                    backgroundColor: "action.hover",
                  },
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
                "&:hover": {
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                },
              }}
              variant="outlined"
            >
              {t("actions.clear")}
            </Button>
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
          setAppliedFilters((prev) => ({ ...prev, search: value }));
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
        sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
        value={f.draftFilters.status}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.serviceType")}
        minWidth={170}
        onChange={(value) => f.setDraftFilter("serviceType", value)}
        options={serviceTypeOptions}
        sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
        value={f.draftFilters.serviceType}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.assignee")}
        minWidth={170}
        onChange={(value) => f.setDraftFilter("assignee", value)}
        options={assigneeOptions}
        sx={{ width: 170, minWidth: 170, maxWidth: 170, flex: "0 0 170px" }}
        value={f.draftFilters.assignee}
      />

      <FilterSelect
        allLabel={t("filters.all")}
        label={t("filters.location")}
        minWidth={160}
        onChange={(value) => f.setDraftFilter("location", value)}
        options={locationOptions}
        sx={{ width: 160, minWidth: 160, maxWidth: 160, flex: "0 0 160px" }}
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
        sx={{ width: 160, minWidth: 160, maxWidth: 160, flex: "0 0 160px" }}
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
    <>
    <FormDialog
      cancelLabel={t("actions.cancel")}
      dialog={createDialog}
      formId={REQUEST_INTAKE_FORM_ID}
      submitLabel={t("actions.submitRequest")}
      title={t("actions.newRequest")}
    >
      <RequestIntakeScreen
        modal
        onSuccess={(createdRequest) => {
          setRows((current) => [mapServiceRequestToRow(createdRequest, assigneesById), ...current]);
          createDialog.close();
          if (appliedFilters.search.trim()) {
            void loadRequests(appliedFilters.search);
          }
        }}
      />
    </FormDialog>

    <EntityListLayout
      headerActions={
        <Button onClick={createDialog.open} startIcon={<AddIcon />} variant="contained">
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
      {loadError ? (
        <Alert
          action={
            <Button color="inherit" onClick={() => void loadRequests(appliedFilters.search)} size="small">
              Retry
            </Button>
          }
          severity="error"
          sx={{ mb: 2 }}
        >
          {loadError}
        </Alert>
      ) : null}
      <div className={styles.tableViewport}>
        <EntityTable
          emptyState={isLoadingRows ? "Loading requests..." : t("emptyState")}
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
    </>
  );
}
