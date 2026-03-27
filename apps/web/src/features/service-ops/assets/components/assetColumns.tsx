"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Asset, AssetStatus } from "@supportops/types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { EntityColumnDef } from "@/components/entity-table";
import { EntityTableActionMenu } from "@/components/entity-actions";

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

export function useAssetColumns({ canManage, locale }: { canManage: boolean; locale: string }) {
  const t = useTranslations("pages.serviceOps.assets.list");

  return useMemo<EntityColumnDef<Asset>[]>(
    () => [
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
    ],
    [canManage, locale, t],
  );
}
