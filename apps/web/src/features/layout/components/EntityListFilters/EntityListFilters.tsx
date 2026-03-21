import type { ReactNode } from "react";
import { Collapse } from "@mui/material";

import styles from "./entity-list-filters.module.css";

type EntityListFiltersProps = {
  controls: ReactNode;
  search: ReactNode;
  filterOptions?: ReactNode;
  showFilterOptions?: boolean;
};

export function EntityListFilters({
  controls,
  search,
  filterOptions,
  showFilterOptions = false,
}: EntityListFiltersProps) {
  return (
    <section className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.controls}>{controls}</div>
        <div className={styles.search}>{search}</div>
      </div>

      <Collapse in={showFilterOptions && Boolean(filterOptions)} timeout={140} unmountOnExit>
        <div className={styles.filterArea}>{filterOptions}</div>
      </Collapse>
    </section>
  );
}
