import { Button, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";

import { MentionTextArea, type MentionOption } from "./MentionTextArea";

interface CommentComposerProps {
  comment: string;
  isInternalNote: boolean;
  isSubmitting: boolean;
  canCreateInternal: boolean;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  mentionOptions: MentionOption[];
  onCommentChange: (nextValue: string) => void;
  onInternalChange: (nextValue: boolean) => void;
  onSubmit: () => Promise<void>;
}

export function CommentComposer({
  comment,
  isInternalNote,
  isSubmitting,
  canCreateInternal,
  inputRef,
  mentionOptions,
  onCommentChange,
  onInternalChange,
  onSubmit,
}: CommentComposerProps) {
  const t = useTranslations("pages.requests.detail");

  return (
    <>
      <Typography gutterBottom variant="body2">
        {t("comments.addTitle")}
      </Typography>
      <MentionTextArea
        inputRef={inputRef}
        maxRows={10}
        mentionOptions={mentionOptions}
        minRows={3}
        onChange={onCommentChange}
        placeholder={t("comments.placeholder")}
        value={comment}
      />
      <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Button disabled={comment.trim().length === 0 || isSubmitting} onClick={() => void onSubmit()} variant="contained">
          {t("comments.submit")}
        </Button>
        {canCreateInternal ? (
          <FormControlLabel
            control={<Checkbox checked={isInternalNote} onChange={(event) => onInternalChange(event.target.checked)} />}
            label={t("comments.internalToggle")}
            sx={{ m: 0 }}
          />
        ) : (
          <Typography color="text.secondary" variant="body2">
            {t("comments.publicOnlyHint")}
          </Typography>
        )}
      </Stack>
    </>
  );
}
