import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageMenu } from "@/features/layout/components/Header/LanguageMenu";
import { ThemeModeToggle } from "@/features/layout/components/Header/ThemeModeToggle";

import styles from "./auth.module.css";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brandLink} href={`/${locale}`}>
          <div className={styles.brand}>
          <Image
            className={styles.brandLogo}
            src="/icons/brand-mark.png"
            alt="ServiceOps logo"
            width={36}
            height={36}
            priority
          />
          <span>ServiceOps</span>
          </div>
        </Link>
        <div className={styles.headerActions}>
          <LanguageMenu />
          <ThemeModeToggle />
        </div>
      </header>
      <div aria-hidden className={styles.headerDivider} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
