"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useTranslations } from "next-intl";

import type { CannedResponse, CreateCannedResponseInput, UpdateCannedResponseInput } from "@supportops/types";

function toTags(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function CannedResponseForm({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: CannedResponse | null;
  onClose: () => void;
  onSubmit: (data: CreateCannedResponseInput | UpdateCannedResponseInput) => Promise<void>;
}) {
  const t = useTranslations("cannedResponses");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [shortcut, setShortcut] = useState(initial?.shortcut ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [body, setBody] = useState(initial?.body ?? "");

  const normalizedShortcut = shortcut.trim().replace(/^\//, "");
  const shortcutValid = normalizedShortcut.length === 0 || /^[a-z0-9_-]+$/.test(normalizedShortcut);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{initial ? t("edit") : t("new")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <TextField label={t("titleField")} onChange={(event) => setTitle(event.target.value)} value={title} />
          <TextField
            error={!shortcutValid}
            helperText={shortcutValid ? t("shortcutHint") : t("shortcutInvalid")}
            label={t("shortcut")}
            onChange={(event) => setShortcut(event.target.value)}
            placeholder="/greet"
            value={shortcut}
          />
          <TextField label={t("category")} onChange={(event) => setCategory(event.target.value)} value={category} />
          <TextField label={t("tags")} onChange={(event) => setTags(event.target.value)} value={tags} />
          <TextField
            helperText={t("variables.hint")}
            label={t("body")}
            minRows={6}
            multiline
            onChange={(event) => setBody(event.target.value)}
            value={body}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button
          disabled={title.trim().length === 0 || body.trim().length === 0 || !shortcutValid}
          onClick={() =>
            void onSubmit({
              title: title.trim(),
              body,
              shortcut: normalizedShortcut || null,
              category: category.trim() || null,
              tags: toTags(tags),
            })
          }
          variant="contained"
        >
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
