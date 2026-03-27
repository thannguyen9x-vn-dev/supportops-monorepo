"use client";

import { Stack, Typography } from "@mui/material";

type StatusRowProps = {
  label: string;
  count: number;
};

export function StatusRow({ label, count }: StatusRowProps) {
  return (
    <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2">{label}</Typography>
      <Typography fontWeight={700} variant="body2">
        {count}
      </Typography>
    </Stack>
  );
}
