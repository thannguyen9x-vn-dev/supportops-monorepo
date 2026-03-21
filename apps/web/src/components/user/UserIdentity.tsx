"use client";

import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { Avatar } from "@supportops/ui-avatar";
import type { ReactElement } from "react";

export interface UserIdentityProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  variant?: "full" | "avatar";
  avatarSize?: number;
}

function UserTooltipContent({ name, email }: { name?: string | null; email?: string | null }): ReactElement {
  return (
    <Box sx={{ py: 0.25 }}>
      {name ? (
        <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: "18px" }}>{name}</Typography>
      ) : null}
      {email ? (
        <Typography sx={{ fontSize: 12, lineHeight: "16px", color: "text.secondary" }}>{email}</Typography>
      ) : null}
    </Box>
  );
}

export function UserIdentity({
  name,
  email,
  avatarUrl,
  variant = "full",
  avatarSize = 28,
}: UserIdentityProps): ReactElement {
  const hasMetadata = Boolean(name || email);

  const avatarNode = (
    <Avatar
      dimension={avatarSize}
      name={name ?? email ?? undefined}
      src={avatarUrl ?? undefined}
      sx={{ fontWeight: 600 }}
    />
  );

  if (variant === "avatar") {
    if (!hasMetadata) return avatarNode;

    return (
      <Tooltip
        arrow
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: "background.paper",
              color: "text.primary",
              border: "1px solid var(--mui-palette-divider)",
              borderRadius: "8px",
              boxShadow:
                "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
              px: 1.25,
              py: 0.75,
            },
          },
          arrow: {
            sx: {
              color: "background.paper",
              "&:before": {
                border: "1px solid var(--mui-palette-divider)",
                boxSizing: "border-box",
              },
            },
          },
        }}
        title={<UserTooltipContent email={email} name={name} />}
      >
        <Box sx={{ display: "inline-flex" }}>{avatarNode}</Box>
      </Tooltip>
    );
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
      {avatarNode}
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, lineHeight: "18px" }}>
          {name || "Unassigned"}
        </Typography>
        {email ? (
          <Typography noWrap sx={{ fontSize: 12, lineHeight: "16px", color: "text.secondary" }}>
            {email}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

export default UserIdentity;
