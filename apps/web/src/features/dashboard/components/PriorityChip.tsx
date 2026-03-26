"use client";

import { Chip } from "@mui/material";
import { useTranslations } from "next-intl";

type PriorityChipProps = {
  priority: string;
  count: number;
};

export function PriorityChip({ priority, count }: PriorityChipProps) {
  const t = useTranslations("pages.dashboard");
  const color =
    priority === "URGENT"
      ? "error"
      : priority === "HIGH"
        ? "warning"
        : priority === "MEDIUM"
          ? "info"
          : "success";

  return <Chip color={color} label={`${t(`priority.${priority}`)}: ${count}`} variant="outlined" />;
}
