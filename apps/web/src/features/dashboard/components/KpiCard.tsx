"use client";

import type { ReactNode } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

type KpiCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  accentColor?: string;
};

export function KpiCard({ label, value, helper, icon, accentColor }: KpiCardProps) {
  return (
    <Card variant="outlined" sx={accentColor ? { borderLeft: "3px solid", borderLeftColor: accentColor } : undefined}>
      <CardContent>
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            {icon}
          </Stack>
          <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }} variant="h4">
            {value}
          </Typography>
          {helper ? (
            <Typography color="text.secondary" variant="body2">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
