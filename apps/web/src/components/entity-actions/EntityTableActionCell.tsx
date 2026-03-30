"use client";

import { Box } from "@mui/material";

import { EntityTableActionMenu } from "./EntityTableActionMenu";
import type { EntityActionMenuProps } from "./EntityActionMenu";

export function EntityTableActionCell(props: EntityActionMenuProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <EntityTableActionMenu {...props} />
    </Box>
  );
}
