"use client";

import { useTranslations } from "next-intl";

import styles from "../settings.module.css";

type OrganizationAccessCardProps = {
  organizationName: string;
  role: string;
  department: string;
  teamQueue: string;
  joinedDate: string;
  permissionSummary: string;
};

export function OrganizationAccessCard({
  organizationName,
  role,
  department,
  teamQueue,
  joinedDate,
  permissionSummary,
}: OrganizationAccessCardProps) {
  const t = useTranslations("pages.settings");

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t("organizationAccess.title")}</h3>
      </div>
      <p className={styles.sectionDescription}>{t("organizationAccess.description")}</p>

      <div className={styles.accessGrid}>
        <div className={styles.accessItem}>
          <p className={styles.accessLabel}>{t("organizationAccess.fields.organization")}</p>
          <p className={styles.accessValue}>{organizationName}</p>
        </div>
        <div className={styles.accessItem}>
          <p className={styles.accessLabel}>{t("organizationAccess.fields.role")}</p>
          <p className={styles.accessValue}>{role}</p>
        </div>
        <div className={styles.accessItem}>
          <p className={styles.accessLabel}>{t("organizationAccess.fields.department")}</p>
          <p className={styles.accessValue}>{department}</p>
        </div>
        <div className={styles.accessItem}>
          <p className={styles.accessLabel}>{t("organizationAccess.fields.teamQueue")}</p>
          <p className={styles.accessValue}>{teamQueue}</p>
        </div>
        <div className={styles.accessItem}>
          <p className={styles.accessLabel}>{t("organizationAccess.fields.joinedDate")}</p>
          <p className={styles.accessValue}>{joinedDate}</p>
        </div>
        <div className={styles.accessItem}>
          <p className={styles.accessLabel}>{t("organizationAccess.fields.permissionSummary")}</p>
          <p className={styles.accessValue}>{permissionSummary}</p>
        </div>
      </div>
    </section>
  );
}
