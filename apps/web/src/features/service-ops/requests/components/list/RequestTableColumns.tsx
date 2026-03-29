import { Box, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { UserIdentity } from "@/components/user";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { EntityColumnDef } from "@/components/entity-table";

import type { RequestListItem, RequestPriority, SlaHealth } from "./request-list.types";
import { RequestRowActions } from "./RequestRowActions";
import { SlaStateChip } from "../shared/SlaStateChip";

function StatusBadge({ value }: { value: RequestListItem["status"] }) {
  const t = useTranslations("pages.requests.list");
  const colorMap: Record<RequestListItem["status"], "default" | "success" | "info" | "warning" | "error"> = {
    DRAFT: "default",
    SUBMITTED: "info",
    TRIAGE: "warning",
    ASSIGNED: "info",
    IN_PROGRESS: "success",
    WAITING_FOR_CUSTOMER: "warning",
    WAITING_EXTERNAL_VENDOR: "warning",
    RESOLVED: "success",
    CLOSED: "default",
    REOPENED: "warning",
    CANCELLED: "error",
  };

  return <Chip color={colorMap[value]} label={t(`statusApi.${value}`)} size="small" variant="outlined" />;
}

function PriorityBadge({ value }: { value: RequestPriority }) {
  const t = useTranslations("pages.requests.list");
  return (
    <Chip
      label={t(`priority.${value}`)}
      size="small"
      sx={(theme) => {
        if (value === "Critical") {
          return { borderColor: "transparent", backgroundColor: alpha(theme.palette.error.main, 0.18), color: theme.palette.error.dark };
        }
        if (value === "High" || value === "Medium") {
          return { borderColor: "transparent", backgroundColor: alpha(theme.palette.warning.main, value === "High" ? 0.2 : 0.15), color: theme.palette.warning.dark };
        }
        return { borderColor: "transparent", backgroundColor: alpha(theme.palette.success.main, 0.16), color: theme.palette.success.dark };
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
        if (value === "Overdue") return { borderColor: "transparent", backgroundColor: alpha(theme.palette.error.main, 0.18), color: theme.palette.error.dark };
        if (value === "At Risk") return { borderColor: "transparent", backgroundColor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.dark };
        return { borderColor: "transparent", backgroundColor: alpha(theme.palette.success.main, 0.16), color: theme.palette.success.dark };
      }}
      variant="outlined"
    />
  );
}

export function useRequestTableColumns(locale: string) {
  const t = useTranslations("pages.requests.list");
  const mapSlaHealthToState = (health: SlaHealth) => {
    if (health === "Overdue") return "BREACHED" as const;
    if (health === "At Risk") return "NEAR_BREACH" as const;
    return "ON_TRACK" as const;
  };

  return useMemo<EntityColumnDef<RequestListItem>[]>(() => [
    { accessorKey: "requestCode", header: t("columns.requestCode"), size: 160, minSize: 120, maxSize: 280, sortable: true, hideable: false },
    { accessorKey: "title", header: t("columns.title"), sortable: true, hideable: true },
    { accessorKey: "serviceType", header: t("columns.serviceType"), cell: ({ row }) => row.original.serviceType, sortable: true, hideable: true },
    { accessorKey: "status", header: t("columns.status"), cell: ({ row }) => <StatusBadge value={row.original.status} />, sortable: true, hideable: true },
    { accessorKey: "priority", header: t("columns.priority"), cell: ({ row }) => <PriorityBadge value={row.original.priority} />, sortable: true, hideable: true },
    {
      id: "slaIndicator",
      header: t("columns.slaHealth"),
      cell: ({ row }) => <SlaStateChip state={mapSlaHealthToState(row.original.slaHealth)} />,
      sortable: false,
      hideable: true,
    },
    {
      accessorKey: "assignee",
      header: t("columns.assignee"),
      cell: ({ row }) =>
        row.original.assigneeProfile ? (
          <UserIdentity avatarSize={28} email={row.original.assigneeProfile.email} name={row.original.assigneeProfile.name} avatarUrl={row.original.assigneeProfile.avatarUrl} variant="full" />
        ) : (
          row.original.assignee
        ),
      sortable: true,
      hideable: true,
    },
    { accessorKey: "location", header: t("columns.location"), cell: ({ row }) => row.original.location, sortable: true, hideable: true },
    { accessorKey: "updatedAt", header: t("columns.updatedAt"), sortable: true, hideable: true },
    { accessorKey: "slaHealth", header: t("columns.slaHealth"), cell: ({ row }) => <SlaBadge value={row.original.slaHealth} />, sortable: false, hideable: true },
    { accessorKey: "slaDue", header: t("columns.slaDue"), cell: ({ row }) => <Box sx={{ color: row.original.slaHealth === "Overdue" ? "error.main" : "inherit" }}>{row.original.slaDue}</Box>, sortable: false, hideable: true },
    {
      id: "actions",
      header: t("columns.actions"),
      size: 52,
      minSize: 52,
      maxSize: 52,
      sortable: false,
      hideable: false,
      resizable: false,
      cell: ({ row }) => <RequestRowActions id={row.original.id} locale={locale} />,
    },
  ], [locale, t]);
}
