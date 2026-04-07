"use client";

import { CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import { knowledgeBaseService } from "../services/knowledge-base.service";
import { KnowledgeArticleForm } from "./KnowledgeArticleForm";

export function KnowledgeArticleEditView({ id }: { id: string }) {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const { user } = useAuth();
  const kb = useKnowledgeBase();
  const canEdit = user?.role === "TECHNICIAN" || user?.role === "OPS_COORDINATOR" || user?.role === "TENANT_ADMIN";

  useEffect(() => {
    if (!canEdit) {
      router.replace(`/${locale}/access-denied`);
    }
  }, [canEdit, locale, router]);

  const detail = useQuery({
    queryKey: ["knowledge-base-edit", id],
    queryFn: () => knowledgeBaseService.detail(id),
  });

  useEffect(() => {
    if (!detail.data) {
      return;
    }

    if (user?.role === "TECHNICIAN" && user.id !== detail.data.authorId) {
      router.replace(`/${locale}/access-denied`);
    }
  }, [detail.data, locale, router, user?.id, user?.role]);

  if (!canEdit || detail.isLoading || !detail.data) {
    return <CircularProgress size={24} />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{detail.data.title}</Typography>
      <Paper sx={{ p: 2 }}>
        <KnowledgeArticleForm
          initial={detail.data}
          isSaving={kb.isSaving}
          onSubmit={async (data) => {
            await kb.update({ id, data });
            router.push(`/${locale}/knowledge-base/${id}`);
          }}
        />
      </Paper>
    </Stack>
  );
}
