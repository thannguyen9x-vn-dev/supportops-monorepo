import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import styles from "./auth.module.css";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.layout" });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>D</span>
          <span>ServiceOps</span>
        </div>
        <nav className={styles.nav}>
          <Link className="active" href={`/${locale}`}>
            {t("dashboard")}
          </Link>
          <Link href={`/${locale}/team`}>{t("team")}</Link>
          <Link href={`/${locale}/requests/list`}>{t("requests")}</Link>
          <Link href={`/${locale}/settings`}>{t("settings")}</Link>
        </nav>
        <Link className={styles.ctaLink} href={`/${locale}/login`}>
          {t("loginRegister")}
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
