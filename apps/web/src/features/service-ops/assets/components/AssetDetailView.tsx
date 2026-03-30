"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useDialog } from "@supportops/ui";
import { ConfirmDialog } from "@supportops/ui-dialog";
import type { AssetDetail } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { EntityDetailLayout } from "@/components/entity-detail-layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/features/common/toast/useToast";
import { assetService } from "../services/asset.service";
import { AssetDetailActions } from "./detail/AssetDetailActions";
import { AssetDetailSummary } from "./detail/AssetDetailSummary";
import { AssetLinkedRequestsCard } from "./detail/AssetLinkedRequestsCard";
import { AssetOverviewCard } from "./detail/AssetOverviewCard";
import styles from "./asset-detail-screen.module.css";

export function AssetDetailView({ assetId }: { assetId: string }) {
  const t = useTranslations("pages.serviceOps.assets.detail");
  const tList = useTranslations("pages.serviceOps.assets.list");
  const tRequestList = useTranslations("pages.requests.list");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const deleteDialog = useDialog();

  const canManage = user?.role === "TENANT_ADMIN";

  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      deleteDialog.close();
    }
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  }

  if (error || !detail) {
    return <Alert severity="error">{error ?? t("feedback.loadError")}</Alert>;
  }

  const { asset } = detail;

  return (
    <Box className={styles.pageWrap}>
      <EntityDetailLayout
        backButtonAriaLabel={t("backToList")}
        backButtonMode="icon"
        breadcrumbs={[
          { label: tList("title"), href: `/${locale}/assets/list` },
          { label: asset.assetCode },
        ]}
        fallbackHref={`/${locale}/assets/list`}
        onBack={() => router.push(`/${locale}/assets/list`)}
        summaryLeft={(
          <AssetDetailSummary
            asset={asset}
            statusLabel={tList(`statusLabels.${asset.status}`)}
          />
        )}
        summaryRight={canManage ? (
          <AssetDetailActions
            canManage={canManage}
            isDeleting={deleting}
            onDelete={deleteDialog.open}
            onEdit={() => router.push(`/${locale}/assets/${assetId}/edit`)}
            t={t}
          />
        ) : null}
        topDividerBleed={1.5}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <AssetLinkedRequestsCard
              detail={detail}
              onRequestClick={(requestId) => router.push(`/${locale}/requests/${requestId}`)}
              t={t}
              tRequestList={tRequestList}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AssetOverviewCard
              asset={asset}
              statusLabel={tList(`statusLabels.${asset.status}`)}
              t={t}
            />
          </Grid>
        </Grid>

        <ConfirmDialog
          cancelLabel={t("actions.cancel")}
          confirmDisabled={deleting}
          confirmLabel={deleting ? t("feedback.deleting") : t("actions.delete")}
          description={t("actions.confirmDelete")}
          dialog={deleteDialog}
          onConfirm={() => void handleDelete()}
          title={t("actions.delete")}
          variant="error"
        />
      </EntityDetailLayout>
    </Box>
  );
}
