import { Box, Divider, Stack, Typography } from "@mui/material";
import type { UserRole } from "@supportops/types";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";

import { SectionCard } from "@/components/section-card";

import type { CommentPayload, RequestDetail } from "../../types";
import { canViewComment } from "../../utils/requestAccess";
import { CommentComposer } from "./comments/CommentComposer";
import { CommentsList } from "./comments/CommentsList";
import { buildMentionOptions } from "./comments/mentionOptions";

export interface CommentsPanelRef {
  focusComposer: (options?: { preferInternal?: boolean }) => void;
}

export const CommentsPanel = forwardRef<CommentsPanelRef, {
  request: RequestDetail;
  viewerRole: UserRole;
  canCreateInternal: boolean;
  onSubmit: (payload: CommentPayload) => Promise<void>;
  isSubmitting: boolean;
}>(function CommentsPanel({
  request,
  viewerRole,
  canCreateInternal,
  onSubmit,
  isSubmitting,
}, ref) {
  const t = useTranslations("pages.requests.detail");
  const [comment, setComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const visibleComments = useMemo(
    () => request.comments.filter((item) => canViewComment(viewerRole, item.visibility)),
    [request.comments, viewerRole],
  );
  const mentionOptions = useMemo(() => buildMentionOptions(request), [request]);

  const internalToggleVisible = canCreateInternal;

  const focusComposer = useCallback((options?: { preferInternal?: boolean }) => {
    if (options?.preferInternal && internalToggleVisible) {
      setIsInternalNote(true);
    }

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      composerInputRef.current?.focus();
    }, 120);
  }, [internalToggleVisible]);

  useImperativeHandle(ref, () => ({ focusComposer }), [focusComposer]);

  const handleSubmit = async () => {
    const body = comment.trim();
    if (!body) return;

    await onSubmit({
      body,
      visibility: isInternalNote ? "INTERNAL" : "PUBLIC",
    });
    setComment("");
  };

  return (
    <SectionCard
      cardSx={{ mt: 2 }}
      headerRight={
        <Typography color="text.secondary" variant="caption">
          {internalToggleVisible ? t("comments.visibilityHint") : t("comments.publicOnlyHint")}
        </Typography>
      }
      title={t("comments.sectionTitle")}
    >
      <Box ref={panelRef}>
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          <CommentsList comments={visibleComments} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <CommentComposer
          canCreateInternal={internalToggleVisible}
          comment={comment}
          inputRef={composerInputRef}
          isInternalNote={isInternalNote}
          isSubmitting={isSubmitting}
          mentionOptions={mentionOptions}
          onCommentChange={setComment}
          onInternalChange={setIsInternalNote}
          onSubmit={handleSubmit}
        />
      </Box>
    </SectionCard>
  );
});
