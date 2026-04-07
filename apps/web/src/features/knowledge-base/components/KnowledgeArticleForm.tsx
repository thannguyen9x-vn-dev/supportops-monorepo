"use client";

import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import type {
  CreateKnowledgeArticleInput,
  KnowledgeArticle,
  KnowledgeBaseStatus,
  UpdateKnowledgeArticleInput,
} from "@supportops/types";

function tagsToInput(tags: string[]) {
  return tags.join(", ");
}

function inputToTags(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 10);
}

export function KnowledgeArticleForm({
  initial,
  onSubmit,
  isSaving,
}: {
  initial?: KnowledgeArticle;
  onSubmit: (data: CreateKnowledgeArticleInput | UpdateKnowledgeArticleInput) => Promise<void>;
  isSaving: boolean;
}) {
  const t = useTranslations("knowledgeBase");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tagsInput, setTagsInput] = useState(tagsToInput(initial?.tags ?? []));
  const [status, setStatus] = useState<KnowledgeBaseStatus>(initial?.status ?? "DRAFT");

  const payload = useMemo(
    () => ({
      title,
      body,
      category: category || null,
      tags: inputToTags(tagsInput),
      status,
    }),
    [body, category, status, tagsInput, title],
  );

  return (
    <Stack spacing={2}>
      <TextField
        label={t("form.title")}
        onChange={(event) => setTitle(event.target.value)}
        required
        value={title}
      />
      <TextField
        label={t("form.category")}
        onChange={(event) => setCategory(event.target.value)}
        value={category}
      />
      <TextField
        helperText="comma-separated"
        label={t("form.tags")}
        onChange={(event) => setTagsInput(event.target.value)}
        value={tagsInput}
      />
      <TextField
        label={t("form.body")}
        minRows={8}
        multiline
        onChange={(event) => setBody(event.target.value)}
        required
        value={body}
      />
      <TextField
        label={t("statusLabel")}
        onChange={(event) => setStatus(event.target.value as KnowledgeBaseStatus)}
        select
        value={status}
      >
        <MenuItem value="DRAFT">{t("status.DRAFT")}</MenuItem>
        <MenuItem value="PUBLISHED">{t("status.PUBLISHED")}</MenuItem>
      </TextField>

      <Stack direction="row" spacing={1}>
        <Button
          disabled={isSaving || title.trim().length === 0 || body.trim().length === 0}
          onClick={() => void onSubmit({ ...payload, status: "DRAFT" })}
          variant="outlined"
        >
          {t("form.saveDraft")}
        </Button>
        <Button
          disabled={isSaving || title.trim().length === 0 || body.trim().length === 0}
          onClick={() => void onSubmit({ ...payload, status: "PUBLISHED" })}
          variant="contained"
        >
          {t("form.publish")}
        </Button>
      </Stack>
    </Stack>
  );
}
