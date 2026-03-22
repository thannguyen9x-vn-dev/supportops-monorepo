import { Box } from "@mui/material";
import { EntityTabs, useEntityTabs } from "@/components/tabs";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import type { RequestTabKey } from "./request-list.types";

type RequestTabBarProps = {
  instance: ReturnType<typeof useEntityTabs<RequestTabKey>>;
  isEnglishLocale: boolean;
  isVietnameseLocale: boolean;
};

export function useRequestTabs(tabKeys: RequestTabKey[], counts: Record<RequestTabKey, number>) {
  const t = useTranslations("pages.requests.list");
  return useEntityTabs<RequestTabKey>({
    items: tabKeys.map((key) => ({
      key,
      label: t(`tabs.${key}`),
      badge: (
        <Box component="span" sx={{ minWidth: 20, px: 0.75, py: 0.125, borderRadius: 999, backgroundColor: "action.selected", color: "text.secondary", fontSize: 12, fontWeight: 600, lineHeight: "18px", textAlign: "center" }}>
          {counts[key]}
        </Box>
      ),
    })),
    defaultActiveKey: "allRequests",
  });
}

export function RequestTabBar({ instance, isEnglishLocale, isVietnameseLocale }: RequestTabBarProps) {
  const sx = useMemo(
    () => ({
      minHeight: 32,
      "& .MuiTab-root": { minHeight: 32, py: 0.5, mr: 1, textTransform: "none", minWidth: "unset" },
      "& .MuiTab-root:last-of-type": { mr: 0 },
      ...(isEnglishLocale && {
        "& .MuiTab-root:nth-of-type(1)": { width: 142 },
        "& .MuiTab-root:nth-of-type(2)": { width: 168 },
        "& .MuiTab-root:nth-of-type(3)": { width: 130 },
        "& .MuiTab-root:nth-of-type(4)": { width: 106 },
        "& .MuiTab-root:nth-of-type(5)": { width: 116 },
        "& .MuiTab-root:nth-of-type(6)": { width: 94 },
      }),
      ...(isVietnameseLocale && {
        "& .MuiTab-root:nth-of-type(1)": { width: 146 },
        "& .MuiTab-root:nth-of-type(2)": { width: 158 },
        "& .MuiTab-root:nth-of-type(3)": { width: 160 },
        "& .MuiTab-root:nth-of-type(4)": { width: 114 },
        "& .MuiTab-root:nth-of-type(5)": { width: 134 },
        "& .MuiTab-root:nth-of-type(6)": { width: 102 },
      }),
    }),
    [isEnglishLocale, isVietnameseLocale],
  );

  return (
    <Box sx={{ mt: 1.5 }}>
      <EntityTabs instance={instance} slotProps={{ variant: "scrollable", scrollButtons: false, sx }} />
    </Box>
  );
}
