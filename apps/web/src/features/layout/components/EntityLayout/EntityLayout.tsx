import type { ReactNode } from "react";

import styles from "./entity-layout.module.css";

type EntityLayoutProps = {
  headerLeft: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function EntityLayout({ headerLeft, headerActions, children }: EntityLayoutProps) {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>{headerLeft}</div>
        {headerActions ? <div className={styles.headerActions}>{headerActions}</div> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
