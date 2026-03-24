"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Asset, AssetStatus, AssetType } from "@supportops/types";
import { ASSET_STATUSES } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { EntityTable, useEntityTable, type EntityColumnDef } from "@/components/entity-table";
import { EntityListLayout } from "@/features/layout/components/EntityListLayout/EntityListLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assetService } from "../services/asset.service";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

const STATUS_COLOR: Record<AssetStatus, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  UNDER_MAINTENANCE: "warning",
  OUT_OF_SERVICE: "error",
  RETIRED: "default",
};

interface AssetListFilters {
  search: string;
  status: AssetStatus | "";
  assetTypeId: string;
}

export function AssetListView() {
  const t = useTranslations("pages.serviceOps.assets.list");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const { user } = useAuth();
  const canManage = user?.role === "TENANT_ADMIN";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "">("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState(20);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await assetService.list({
        page,
        size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        assetTypeId: assetTypeFilter || undefined,
      });
      setAssets(data);
      setTotal(meta?.total ?? data.length);
    } catch {
      setError(t("emptyState"));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, assetTypeFilter, t]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    void assetService.listAssetTypes().then(({ data }) => setAssetTypes(data)).catch(() => {});
  }, []);

  const columns: EntityColumnDef<Asset>[] = [
    {
      id: "assetCode",
      header: t("columns.assetCode"),
      accessorKey: "assetCode",
      size: 120,
      cell: ({ row }) => (
        <Typography fontFamily="monospace" fontSize="0.875rem" fontWeight={600}>
          {row.original.assetCode}
        </Typography>
      ),
    },
    {
      id: "name",
      header: t("columns.name"),
      accessorKey: "name",
      size: 220,
    },
    {
      id: "assetType",
      header: t("columns.assetType"),
      size: 150,
      cell: ({ row }) => row.original.assetType?.name ?? "-",
    },
    {
      id: "locationId",
      header: t("columns.location"),
      accessorKey: "locationId",
      size: 150,
    },
    {
      id: "status",
      header: t("columns.status"),
      size: 140,
      cell: ({ row }) => (
        <Chip
          color={STATUS_COLOR[row.original.status]}
          label={t(`statusLabels.${row.original.status}`)}
          size="small"
        />
      ),
    },
    {
      id: "updatedAt",
      header: t("columns.updatedAt"),
      size: 120,
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
  ];

  const table = useEntityTable<Asset, AssetListFilters>({
    data: assets,
    columns,
    rowId: (row) => row.id,
    pageIndex: page - 1,
    pageSize,
    totalRows: total,
    serverSide: true,
    onTableStateChange: (state) => {
      setPage(state.pageIndex + 1);
      setPageSize(state.pageSize);
    },
    initialFilters: {
      search: "",
      status: "",
      assetTypeId: "",
    },
  });

  return (
    <EntityListLayout
      headerLeft={
        <Box>
          <Typography variant="h5">{t("title")}</Typography>
          <Typography color="text.secondary" variant="body2">
            {t("subtitle")}
          </Typography>
        </Box>
      }
      headerActions={
        canManage ? (
          <Button
            onClick={() => router.push(`/${locale}/assets/create`)}
            startIcon={<AddIcon />}
            variant="contained"
          >
            {t("newAsset")}
          </Button>
        ) : undefined
      }
    >
      <Stack spacing={2}>
        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("filters.searchPlaceholder")}
            size="small"
            sx={{ minWidth: 240 }}
            value={search}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t("filters.status")}</InputLabel>
            <Select
              label={t("filters.status")}
              onChange={(e) => { setStatusFilter(e.target.value as AssetStatus | ""); setPage(1); }}
              value={statusFilter}
            >
              <MenuItem value="">{t("filters.all")}</MenuItem>
              {ASSET_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(`statusLabels.${s}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t("filters.assetType")}</InputLabel>
            <Select
              label={t("filters.assetType")}
              onChange={(e) => { setAssetTypeFilter(e.target.value); setPage(1); }}
              value={assetTypeFilter}
            >
              <MenuItem value="">{t("filters.all")}</MenuItem>
              {assetTypes.map((at) => (
                <MenuItem key={at.id} value={at.id}>
                  {at.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : assets.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            {t("emptyState")}
          </Typography>
        ) : (
          <EntityTable
            entityTable={table}
            onRowClick={(row) => router.push(`/${locale}/assets/${row.id}`)}
          />
        )}
      </Stack>
    </EntityListLayout>
  );
}
