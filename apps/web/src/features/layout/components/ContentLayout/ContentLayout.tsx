import type { ReactNode } from "react";

import styles from "./content-layout.module.css";

type ContentLayoutProps = {
  children: ReactNode;
};

export function ContentLayout({ children }: ContentLayoutProps) {
  return <main className={styles.content}>{children}</main>;
}
