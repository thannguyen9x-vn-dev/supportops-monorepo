"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";

import { EntityActionMenu } from "./EntityActionMenu";
import type { EntityActionMenuProps } from "./EntityActionMenu";

/**
 * Wraps EntityActionMenu for use inside table cells.
 * Stops click propagation so the row's onRowClick is not triggered.
 */
export function EntityTableActionMenu(props: EntityActionMenuProps) {
  const handleWrapperClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  return (
    <div onClick={handleWrapperClick} style={{ display: "inline-flex" }}>
      <EntityActionMenu size="small" {...props} />
    </div>
  );
}
