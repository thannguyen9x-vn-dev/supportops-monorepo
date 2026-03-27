"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useWatch, type Control, type FieldValues, type Path } from "react-hook-form";

import styles from "./request-intake-screen.module.css";

type RequestSummaryFields = {
  serviceType: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: string;
};

type RequestSummaryCardProps<TValues extends FieldValues & RequestSummaryFields> = {
  control: Control<TValues>;
};

export function RequestSummaryCard<TValues extends FieldValues & RequestSummaryFields>({
  control,
}: RequestSummaryCardProps<TValues>) {
  const t = useTranslations("pages.serviceOps.requestCreateForm");
  const serviceType = useWatch<TValues, Path<TValues>>({ control, name: "serviceType" as Path<TValues> });
  const priority = useWatch<TValues, Path<TValues>>({ control, name: "priority" as Path<TValues> });
  const location = useWatch<TValues, Path<TValues>>({ control, name: "location" as Path<TValues> });

  return (
    <Card className={styles.summaryCard} variant="outlined">
      <CardContent>
        <Typography gutterBottom variant="h6">
          {t("summary.title")}
        </Typography>

        <Stack spacing={1.25}>
          <Box className={styles.summaryRow}>
            <Typography color="text.secondary" variant="body2">
              {t("summary.serviceType")}
            </Typography>
            <Typography variant="body2">{serviceType}</Typography>
          </Box>

          <Box className={styles.summaryRow}>
            <Typography color="text.secondary" variant="body2">
              {t("summary.priority")}
            </Typography>
            <Typography variant="body2">{priority}</Typography>
          </Box>

          <Box className={styles.summaryRow}>
            <Typography color="text.secondary" variant="body2">
              {t("summary.location")}
            </Typography>
            <Typography className={styles.summaryValue} variant="body2">
              {location}
            </Typography>
          </Box>

          <Box className={styles.slaBox}>
            <Typography fontWeight={700} variant="body2">
              {t("summary.expectedSla")}
            </Typography>
            <Typography variant="body1">4 {t("summary.hours")}</Typography>
          </Box>

          <Typography color="text.secondary" variant="body2">
            {t("summary.visibility")}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
