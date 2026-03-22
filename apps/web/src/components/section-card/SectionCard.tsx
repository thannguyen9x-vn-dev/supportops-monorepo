"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

export interface SectionCardProps {
  title: ReactNode;
  children: ReactNode;
  headerRight?: ReactNode;
  cardSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
}

export function SectionCard({
  title,
  children,
  headerRight,
  cardSx,
  contentSx,
  titleSx,
}: SectionCardProps) {
  return (
    <Card sx={cardSx} variant="outlined">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, ...contentSx }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography sx={titleSx} variant="textXlSemiBold">
            {title}
          </Typography>
          {headerRight ?? null}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
