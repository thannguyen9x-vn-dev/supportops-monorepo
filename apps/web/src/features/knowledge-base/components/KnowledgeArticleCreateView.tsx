"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import { KnowledgeArticleForm } from "./KnowledgeArticleForm";

export function KnowledgeArticleCreateView() {
  const t = useTranslations("knowledgeBase");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();
  const kb = useKnowledgeBase();
  const canCreate = user?.role === "TECHNICIAN" || user?.role === "OPS_COORDINATOR" || user?.role === "TENANT_ADMIN";

  useEffect(() => {
    if (!canCreate) {
      router.replace(`/${locale}/access-denied`);
    }
  }, [canCreate, locale, router]);

  if (!canCreate) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("new")}</Typography>
      <Paper sx={{ p: 2 }}>
        <KnowledgeArticleForm
          isSaving={kb.isSaving}
          onSubmit={async (data) => {
            await kb.create(data);
            router.push(`/${locale}/knowledge-base`);
          }}
        />
      </Paper>
    </Stack>
  );
}
