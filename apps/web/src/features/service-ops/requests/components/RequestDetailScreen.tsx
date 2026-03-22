"use client";

import { Alert, Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { EntityDetailLayout } from "@/components/entity-detail-layout";

import { useRequestDetail } from "../hooks/useRequestDetail";
import { getHeaderActions } from "../utils/requestActions";
import { getSectionVisibility } from "../utils/requestAccess";
import type { DetailProps } from "../types";
import { ActivityTimeline } from "./activity/ActivityTimeline";
import { CommentsPanel } from "./activity/CommentsPanel";
import { WorkLogPanel } from "./activity/WorkLogPanel";
import { AssignDialog } from "./assign/AssignDialog";
import { AssignmentCard } from "./cards/AssignmentCard";
import { AttachmentsCard } from "./cards/AttachmentsCard";
import { AuditSummaryCard } from "./cards/AuditSummaryCard";
import { MetadataCard } from "./cards/MetadataCard";
import { RequestOverviewCard } from "./cards/RequestOverviewCard";
import { SlaCard } from "./cards/SlaCard";
import { RequestHeaderActions } from "./header/RequestHeaderActions";
import { RequestSummary } from "./header/RequestSummary";
import styles from "./request-detail-screen.module.css";

export function RequestDetailScreen({ requestId }: DetailProps) {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("pages.requests.detail");
  const detail = useRequestDetail(requestId);

  const sectionVisibility = getSectionVisibility(detail.role);
  const headerActions = getHeaderActions({
    role: detail.role,
    status: detail.request.status,
    isRequester: detail.request.relationship.isRequester,
    isAssignee: detail.request.relationship.isAssignee,
    hasAssignee: Boolean(detail.request.assignee),
  });

  return (
    <Box className={styles.pageWrap}>
      <EntityDetailLayout
        backLabel={t("header.backToList")}
        backButtonAriaLabel={t("header.backToList")}
        backButtonMode="icon"
        breadcrumbs={[
          { label: t("header.breadcrumbs.requests"), href: `/${locale}/requests/list` },
          { label: detail.request.requestCode },
        ]}
        fallbackHref={`/${locale}/requests/list`}
        summaryLeft={<RequestSummary request={detail.request} />}
        summaryRight={
          <RequestHeaderActions
            headerActions={headerActions}
            isSubmitting={detail.isSubmitting}
            onAction={detail.handleHeaderAction}
          />
        }
        topDividerBleed={1.5}
      >
        {detail.isLoading ? (
          <Stack alignItems="center" direction="row" spacing={1}>
            <CircularProgress size={18} />
            <Typography color="text.secondary" variant="body2">{t("feedback.loadingDetail")}</Typography>
          </Stack>
        ) : null}
        {detail.loadError ? (
          <Alert
            action={<Button color="inherit" onClick={() => void detail.refreshDetail()} size="small">{t("feedback.retry")}</Button>}
            severity="error"
            sx={{ mt: 1 }}
          >
            {detail.loadError}
          </Alert>
        ) : null}
        {detail.mutationError ? <Alert severity="error" sx={{ mt: 1 }}>{detail.mutationError}</Alert> : null}
        {detail.mutationSuccess ? <Alert severity="success" sx={{ mt: 1 }}>{detail.mutationSuccess}</Alert> : null}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RequestOverviewCard request={detail.request} />
            <AttachmentsCard request={detail.request} />
            <ActivityTimeline request={detail.request} viewerRole={detail.role} />
            <CommentsPanel
              canCreateInternal={sectionVisibility.showInternalNotes}
              isSubmitting={detail.isSubmitting}
              onSubmit={detail.handleCommentSubmit}
              request={detail.request}
              viewerRole={detail.role}
            />
            <WorkLogPanel
              isSubmitting={detail.isSubmitting}
              logs={detail.workLogs}
              onSubmit={detail.handleWorkLogSubmit}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2}>
              <AssignmentCard
                headerActions={headerActions}
                isSubmitting={detail.isSubmitting}
                onAssign={(reassign) => void detail.handleAssign(reassign)}
                onAssignToMe={() => void detail.handleAssignToMe()}
                request={detail.request}
                role={detail.role}
              />
              <SlaCard request={detail.request} visibility={sectionVisibility} />
              <MetadataCard request={detail.request} visibility={sectionVisibility} />
              {sectionVisibility.showAuditSummary ? <AuditSummaryCard request={detail.request} /> : null}
            </Stack>
          </Grid>
        </Grid>
      </EntityDetailLayout>

      <AssignDialog
        assignableUsers={detail.assignableUsers}
        dialog={detail.assignDialog}
        isLoadingUsers={detail.isLoadingUsers}
        isSubmitting={detail.isSubmitting}
        onSubmit={detail.handleAssignConfirm}
        reassignMode={detail.reassignMode}
        selectedAssigneeId={detail.selectedAssigneeId}
      />
    </Box>
  );
}
