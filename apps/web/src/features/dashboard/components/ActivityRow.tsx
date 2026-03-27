"use client";

import { Stack, Typography } from "@mui/material";
import { useFormatter } from "next-intl";
import type { DashboardRecentActivityItem } from "@supportops/types";

type ActivityRowProps = {
  item: DashboardRecentActivityItem;
};

export function ActivityRow({ item }: ActivityRowProps) {
  const format = useFormatter();

  return (
    <Stack spacing={0.5}>
      <Stack
        alignItems={{ xs: "flex-start", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography fontWeight={700} variant="body2">
          {item.requestCode ?? item.requestId}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {format.dateTime(new Date(item.createdAt), { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      </Stack>
      <Typography variant="body2">{item.title}</Typography>
      {item.description ? (
        <Typography color="text.secondary" variant="body2">
          {item.description}
        </Typography>
      ) : null}
      <Typography color="text.secondary" variant="caption">
        {[item.requestTitle, item.actorName].filter(Boolean).join(" · ")}
      </Typography>
    </Stack>
  );
}
