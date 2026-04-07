"use client";

import { Button, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { knowledgeBaseService } from "../services/knowledge-base.service";

export function KnowledgeArticleDetailView({ id }: { id: string }) {
  const t = useTranslations("knowledgeBase");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const article = useQuery({
    queryKey: ["knowledge-base-detail", id],
    queryFn: () => knowledgeBaseService.detail(id),
  });

  if (article.isLoading) {
    return <CircularProgress size={24} />;
  }

  if (!article.data) {
    return <Typography color="text.secondary">Not found</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography variant="h5">{article.data.title}</Typography>
        <Button onClick={() => router.push(`/${locale}/knowledge-base/${id}/edit`)} variant="outlined">
          Edit
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={t(`status.${article.data.status}`)} size="small" />
          {article.data.category ? <Chip label={article.data.category} size="small" variant="outlined" /> : null}
        </Stack>
        <Typography sx={{ whiteSpace: "pre-wrap" }} variant="body2">
          {article.data.body}
        </Typography>
      </Paper>
    </Stack>
  );
}
