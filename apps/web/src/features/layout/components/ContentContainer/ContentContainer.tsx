import type { ReactNode } from "react";

import styles from "./content-container.module.css";

interface ContentContainerProps {
  children: ReactNode;
}

export function ContentContainer({ children }: ContentContainerProps) {
  return <div className={styles.container}>{children}</div>;
}
