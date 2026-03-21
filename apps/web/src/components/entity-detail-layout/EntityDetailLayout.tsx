"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Box, Breadcrumbs, Button, Divider, IconButton, Link as MuiLink, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

export interface EntityDetailLayoutBreadcrumb {
  label: string;
  href?: string;
}

export interface EntityDetailLayoutProps {
  breadcrumbs?: EntityDetailLayoutBreadcrumb[];
  backLabel?: string;
  backButtonMode?: "text" | "icon";
  backButtonAriaLabel?: string;
  showTopDivider?: boolean;
  topDividerBleed?: number;
  fallbackHref: string;
  onBack?: () => void;
  summaryLeft: ReactNode;
  summaryRight?: ReactNode;
  children: ReactNode;
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

export function EntityDetailLayout({
  breadcrumbs = [],
  backLabel = "Back",
  backButtonMode = "text",
  backButtonAriaLabel,
  fallbackHref,
  onBack,
  summaryLeft,
  summaryRight,
  children,
}: EntityDetailLayoutProps) {
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
    <Stack spacing={2.25}>
      <Box>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1.5}
        >
          {backButtonMode === "icon" ? (
            <IconButton
              aria-label={backButtonAriaLabel ?? backLabel}
              onClick={handleBack}
              size="medium"
              sx={(theme) => ({
                width: 32,
                height: 32,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "50%",
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              })}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          ) : (
            <Button
              color="inherit"
              onClick={handleBack}
              size="small"
              startIcon={<ArrowBackRoundedIcon fontSize="small" />}
              sx={{ px: 0.5, textTransform: "none", whiteSpace: "nowrap" }}
              variant="text"
            >
              {backLabel}
            </Button>
          )}

          {breadcrumbs.length > 0 ? (
            <>
              <Divider
                flexItem
                orientation="vertical"
              sx={{
                alignSelf: "stretch",
                mb: 0,
                minHeight: "auto",
              }}
            />
              <Box aria-label="Breadcrumb" component="nav" sx={{ minWidth: 0 }}>
                <Breadcrumbs
                  separator={<ChevronRightRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />}
                  sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
                >
                  {breadcrumbs.map((item, index) => {
                    const isLastItem = index === breadcrumbs.length - 1;

                    if (isLastItem || !item.href) {
                      return (
                        <Typography color="text.primary" fontSize={14} fontWeight={600} key={`${item.label}-${index}`} noWrap variant="body2">
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
                        noWrap
                        underline="hover"
                        variant="body2"
                        sx={{ fontSize: 14, fontWeight: 500 }}
                      >
                        {item.label}
                      </MuiLink>
                    );
                  })}
                </Breadcrumbs>
              </Box>
            </>
          ) : null}
        </Stack>
      </Box>

      <Stack
        alignItems={{ md: "flex-start", xs: "stretch" }}
        direction={{ md: "row", xs: "column" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>{summaryLeft}</Box>
        {summaryRight ? (
          <Box sx={{ flexShrink: 0, width: { md: "auto", xs: "100%" } }}>{summaryRight}</Box>
        ) : null}
      </Stack>

      <Box>{children}</Box>
    </Stack>
  );
}
