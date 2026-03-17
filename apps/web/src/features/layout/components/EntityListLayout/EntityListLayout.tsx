import type { ReactNode } from "react";

import styles from "./entity-list-layout.module.css";

type EntityListLayoutProps = {
  headerLeft: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function EntityListLayout({ headerLeft, headerActions, children }: EntityListLayoutProps) {
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
