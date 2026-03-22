"use client";

import { useFormatter, useTranslations } from "next-intl";

import { Alert, Button, Chip, CircularProgress } from "@mui/material";

import { useReportData, type ReportPeriod } from "@/features/reports/hooks/useReportData";

import styles from "./report-view.module.css";

type ReportViewProps = {
  period: ReportPeriod;
  titleKey: "title" | "overviewTitle" | "performanceTitle";
};

function getStatusColor(status: "COMPLETED" | "IN_PROGRESS" | "CANCELLED") {
  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "IN_PROGRESS") {
    return "warning";
  }

  return "default";
}

export function ReportView({ period, titleKey }: ReportViewProps) {
  const t = useTranslations("pages.reportsPage");
  const format = useFormatter();
  const { data, loadState, reload } = useReportData(period);

  if (loadState === "loading") {
    return (
      <div className={styles.centeredState}>
        <CircularProgress size={28} />
        <p>{t("state.loading")}</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className={styles.centeredState}>
        <Alert severity="error">{t("state.error")}</Alert>
        <Button onClick={() => void reload()} variant="contained">
          {t("action.retry")}
        </Button>
      </div>
    );
  }

  const points = data.salesSummary?.dataPoints ?? [];
  const totalTemplates = points.reduce((acc, item) => acc + item.templates, 0);
  const totalInvoicing = points.reduce((acc, item) => acc + item.invoicing, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t(titleKey)}</h1>
        <Button onClick={() => void reload()} size="small" variant="outlined">
          {t("action.refresh")}
        </Button>
      </div>

      <section className={styles.card}>
        <div className={styles.statRow}>
          <div className={styles.statItem}>
            <p className={styles.label}>{t("summary.points")}</p>
            <p className={styles.value}>{format.number(points.length)}</p>
          </div>
          <div className={styles.statItem}>
            <p className={styles.label}>{t("summary.templates")}</p>
            <p className={styles.value}>{format.number(totalTemplates)}</p>
          </div>
          <div className={styles.statItem}>
            <p className={styles.label}>{t("summary.invoicing")}</p>
            <p className={styles.value}>{format.number(totalInvoicing)}</p>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.title}>{t("activity.title")}</h2>
        <div className={styles.rowList}>
          {data.transactions.map((transaction) => (
            <div className={styles.row} key={transaction.id}>
              <div>
                <p className={styles.value}>{transaction.description}</p>
                <p className={styles.label}>
                  {format.dateTime(new Date(transaction.dateTime), { dateStyle: "medium" })}
                </p>
              </div>
              <div>
                <p className={styles.value}>{format.number(transaction.amount)}</p>
                <Chip
                  color={getStatusColor(transaction.status)}
                  label={t(`activity.status.${transaction.status}`)}
                  size="small"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
