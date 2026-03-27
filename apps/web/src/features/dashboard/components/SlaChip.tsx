"use client";

import { Chip } from "@mui/material";

type SlaChipProps = {
  label: string;
  count: number;
  color: "success" | "warning" | "error";
};

export function SlaChip({ label, count, color }: SlaChipProps) {
  return <Chip color={color} label={`${label}: ${count}`} variant="outlined" />;
}
