"use client";

import type { SxProps, Theme } from "@mui/material";
import { Button, Checkbox } from "@mui/material";

type FilterToggleButtonProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  sx?: SxProps<Theme>;
};

export function FilterToggleButton({ checked, onChange, label, sx }: FilterToggleButtonProps) {
  return (
    <Button
      color={checked ? "primary" : "inherit"}
      onClick={() => onChange(!checked)}
      startIcon={<Checkbox checked={checked} size="small" sx={{ p: 0, pointerEvents: "none" }} />}
      sx={{
        justifyContent: "flex-start",
        height: 32,
        minHeight: 32,
        fontSize: 13,
        fontWeight: 500,
        "&:hover": { backgroundColor: "transparent" },
        ...sx,
      }}
      variant="text"
    >
      {label}
    </Button>
  );
}
