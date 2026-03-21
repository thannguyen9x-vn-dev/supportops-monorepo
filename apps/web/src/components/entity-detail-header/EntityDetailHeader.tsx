"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Breadcrumbs, Button, Link as MuiLink, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

export interface EntityBreadcrumbItem {
  label: string;
  href?: string;
}

export interface EntityDetailHeaderProps {
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  breadcrumbs?: EntityBreadcrumbItem[];
  backLabel?: string;
  fallbackHref: string;
  actions?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

function canNavigateBackInApp() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.history.length <= 1 || !document.referrer) {
    return false;
  }

  try {
    const referrerUrl = new URL(document.referrer);
    return referrerUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function EntityDetailHeader({
  title,
  subtitle,
  meta,
  breadcrumbs = [],
  backLabel = "Back",
  fallbackHref,
  actions,
  showBackButton = true,
  onBack,
}: EntityDetailHeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (canNavigateBackInApp()) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, onBack, router]);

  return (
    <Stack spacing={1.25}>
      {showBackButton ? (
        <Button
          color="inherit"
          onClick={handleBack}
          size="small"
          startIcon={<ArrowBackRoundedIcon fontSize="small" />}
          sx={{ alignSelf: "flex-start", px: 0.25, textTransform: "none" }}
          variant="text"
        >
          {backLabel}
        </Button>
      ) : null}

      {breadcrumbs.length > 0 ? (
        <Box aria-label="Breadcrumb" component="nav">
          <Breadcrumbs separator="/">
            {breadcrumbs.map((item, index) => {
              const isLastItem = index === breadcrumbs.length - 1;

              if (isLastItem || !item.href) {
                return (
                  <Typography color="text.primary" key={`${item.label}-${index}`} variant="body2">
                    {item.label}
                  </Typography>
                );
              }

              return (
                <MuiLink
                  color="text.secondary"
                  component={Link}
                  href={item.href}
                  key={`${item.label}-${index}`}
                  underline="hover"
                  variant="body2"
                >
                  {item.label}
                </MuiLink>
              );
            })}
          </Breadcrumbs>
        </Box>
      ) : null}

      <Stack alignItems={{ sm: "center", xs: "flex-start" }} direction={{ sm: "row", xs: "column" }} flexWrap="wrap" spacing={1}>
        <Typography variant="h4">{title}</Typography>
        {meta ? (
          <Typography color="text.secondary" variant="h6">
            {meta}
          </Typography>
        ) : null}
      </Stack>

      {subtitle ? (
        <Typography color="text.secondary" variant="body2">
          {subtitle}
        </Typography>
      ) : null}

      {actions ? <Box>{actions}</Box> : null}
    </Stack>
  );
}
