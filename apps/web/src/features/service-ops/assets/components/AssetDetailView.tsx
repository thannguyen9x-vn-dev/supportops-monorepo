"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { AssetDetail, AssetStatus, RequestStatus } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/features/common/toast/useToast";
import { assetService } from "../services/asset.service";

type StatusColor = "success" | "warning" | "error" | "default";

const ASSET_STATUS_COLOR: Record<AssetStatus, StatusColor> = {
  ACTIVE: "success",
  UNDER_MAINTENANCE: "warning",
  OUT_OF_SERVICE: "error",
  RETIRED: "default",
};

const REQUEST_STATUS_COLOR: Partial<Record<string, StatusColor>> = {
  SUBMITTED: "warning",
  TRIAGE: "warning",
  ASSIGNED: "default",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "success",
  CANCELLED: "default",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography variant="body2">{value ?? "-"}</Typography>
    </Box>
  );
}

export function AssetDetailView({ assetId }: { assetId: string }) {
  const t = useTranslations("pages.serviceOps.assets.detail");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();
  const toast = useToast();

  const canManage = user?.role === "TENANT_ADMIN";

  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await assetService.detail(assetId);
      setDetail(data);
    } catch {
      setError(t("feedback.loadError"));
    } finally {
      setLoading(false);
    }
  }, [assetId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assetService.delete(assetId);
      toast.success(t("feedback.deleteSuccess"));
      router.push(`/${locale}/assets/list`);
    } catch {
      toast.error(t("feedback.deleteError"));
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !detail) {
    return <Alert severity="error">{error ?? t("feedback.loadError")}</Alert>;
  }

  const { asset, openRequestCount, requests } = detail;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" mb={3}>
        <Stack spacing={0.5}>
          <Button
            onClick={() => router.push(`/${locale}/assets/list`)}
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 0.5, alignSelf: "flex-start" }}
            variant="text"
          >
            {t("backToList")}
          </Button>
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <Typography fontFamily="monospace" fontWeight={700} variant="h5">
              {asset.assetCode}
            </Typography>
            <Chip
              color={ASSET_STATUS_COLOR[asset.status]}
              label={asset.status.replace(/_/g, " ")}
              size="small"
            />
          </Stack>
          <Typography color="text.secondary" variant="h6">
            {asset.name}
          </Typography>
        </Stack>

        {canManage && (
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => router.push(`/${locale}/assets/${assetId}/edit`)}>
              <EditOutlinedIcon />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteOpen(true)}>
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* Left: overview + requests */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Open requests summary */}
          {openRequestCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t("openRequestCount", { count: openRequestCount })}
            </Alert>
          )}

          {/* Linked requests */}
          <Card variant="outlined">
            <CardContent>
              <Typography gutterBottom variant="h6">
                {t("linkedRequests")}
              </Typography>
              {requests.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  {t("noRequests")}
                </Typography>
              ) : (
                <Stack divider={<Divider />} spacing={0}>
                  {requests.map((req) => (
                    <Box
                      key={req.id}
                      onClick={() => router.push(`/${locale}/requests/${req.id}`)}
                      sx={{
                        py: 1.5,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        px: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {req.requestCode ?? req.id.slice(0, 8)}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {req.title}
                          </Typography>
                        </Box>
                        <Chip
                          color={REQUEST_STATUS_COLOR[req.status as RequestStatus] ?? "default"}
                          label={req.status}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Typography color="text.secondary" variant="caption">
                        {formatDate(req.updatedAt)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: asset metadata */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography gutterBottom variant="h6">
                {t("overview")}
              </Typography>
              <Stack spacing={1.5}>
                <MetaRow label={t("fields.assetCode")} value={asset.assetCode} />
                <MetaRow label={t("fields.assetType")} value={asset.assetType?.name} />
                <MetaRow label={t("fields.location")} value={asset.locationId} />
                <MetaRow label={t("fields.status")} value={asset.status.replace(/_/g, " ")} />
                <Divider />
                <MetaRow label={t("fields.serialNumber")} value={asset.serialNumber} />
                <MetaRow label={t("fields.model")} value={asset.model} />
                <MetaRow label={t("fields.assignedDepartment")} value={asset.assignedDepartment} />
                <MetaRow label={t("fields.responsibleTeam")} value={asset.responsibleTeam} />
                <MetaRow
                  label={t("fields.installedAt")}
                  value={asset.installedAt ? new Date(asset.installedAt).toLocaleDateString() : null}
                />
                {asset.description && (
                  <>
                    <Divider />
                    <MetaRow label={t("fields.description")} value={asset.description} />
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete confirmation dialog */}
      <Dialog onClose={() => !deleting && setDeleteOpen(false)} open={deleteOpen}>
        <DialogTitle>{t("actions.delete")}</DialogTitle>
        <DialogContent>
          <Typography>{t("actions.confirmDelete")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setDeleteOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button color="error" disabled={deleting} onClick={() => void handleDelete()} variant="contained">
            {deleting ? "Deleting…" : t("actions.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
