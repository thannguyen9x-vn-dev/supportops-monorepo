import { Button, Stack } from "@mui/material";

import { HEADER_ACTION_LABELS } from "../../types";
import type { HeaderAction } from "../../types";

export function RequestHeaderActions({
  headerActions,
  onAction,
  isSubmitting,
}: {
  headerActions: HeaderAction[];
  onAction: (action: HeaderAction) => void;
  isSubmitting: boolean;
}) {
  return (
    <Stack
      alignItems={{ md: "center", xs: "flex-start" }}
      direction="row"
      flexWrap="wrap"
      justifyContent={{ md: "flex-end", xs: "flex-start" }}
      spacing={1}
      sx={{ pt: { md: 0.5, xs: 0 } }}
    >
      {headerActions.map((action, index) => (
        <Button
          key={action}
          disabled={isSubmitting}
          onClick={() => onAction(action)}
          size="small"
          sx={{ borderRadius: 1.5, px: 1.5 }}
          variant={index === 0 ? "contained" : "outlined"}
        >
          {HEADER_ACTION_LABELS[action]}
        </Button>
      ))}
    </Stack>
  );
}
