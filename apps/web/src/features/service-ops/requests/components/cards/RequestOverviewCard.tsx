import { Box, Grid, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/section-card";
import { UserIdentity } from "@/components/user";

import { ROLE_LABELS } from "../../types";
import type { RequestDetail } from "../../types";
import styles from "../request-detail-screen.module.css";

export function RequestOverviewCard({ request }: { request: RequestDetail }) {
  const t = useTranslations("pages.requests.detail");

  return (
    <SectionCard title={t("overview.title")}>
      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("header.requestedByLabel")}</Typography>
          <Box sx={{ mt: 0.75 }}>
            <UserIdentity
              avatarSize={36}
              avatarUrl={request.requester.avatarUrl}
              email={request.requester.email}
              name={request.requester.name}
              variant="full"
            />
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              {ROLE_LABELS.EMPLOYEE}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("header.lastUpdatedLabel")}</Typography>
          <Typography variant="textBase">{request.updatedAtLabel}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("overview.serviceType")}</Typography>
          <Typography variant="textBase">{request.overview.serviceType}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("overview.category")}</Typography>
          <Typography variant="textBase">{request.overview.category}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("overview.location")}</Typography>
          <Typography variant="textBase">{request.overview.location}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("overview.asset")}</Typography>
          <Typography variant="textBase">{request.overview.asset ?? "-"}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="textSmRegular">{t("overview.createdAt")}</Typography>
          <Typography variant="textBase">{request.overview.createdAt}</Typography>
        </Grid>
      </Grid>

      <Typography sx={{ mt: 2 }} variant="textSmRegular">{t("overview.description")}</Typography>
      <Box className={styles.descriptionBox}>{request.overview.description}</Box>
    </SectionCard>
  );
}
