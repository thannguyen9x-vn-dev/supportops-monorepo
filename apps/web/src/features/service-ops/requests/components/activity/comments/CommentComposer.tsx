import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useMemo, useState, type KeyboardEvent, type RefObject } from "react";

import { CannedResponsePicker } from "@/features/canned-response/components/CannedResponsePicker";
import { useCannedResponsePicker } from "@/features/canned-response/hooks/useCannedResponsePicker";
import { resolveVariables } from "@/features/canned-response/hooks/resolveVariables";
import { KnowledgeBasePickerModal } from "@/features/knowledge-base/components/KnowledgeBasePickerModal";

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
  requesterName: string;
  requestCode: string;
  assigneeName: string;
}

function insertTextAtCursor({
  current,
  insert,
  inputRef,
  onCommentChange,
}: {
  current: string;
  insert: string;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onCommentChange: (nextValue: string) => void;
}) {
  const input = inputRef.current;
  if (!input) {
    onCommentChange(`${current}${insert}`);
    return;
  }

  const start = input.selectionStart ?? current.length;
  const end = input.selectionEnd ?? start;
  const nextValue = `${current.slice(0, start)}${insert}${current.slice(end)}`;
  onCommentChange(nextValue);

  const nextCursor = start + insert.length;
  window.requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(nextCursor, nextCursor);
  });
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
  requesterName,
  requestCode,
  assigneeName,
}: CommentComposerProps) {
  const t = useTranslations("pages.requests.detail");
  const cannedPicker = useCannedResponsePicker();
  const [kbOpen, setKbOpen] = useState(false);
  const [activeCannedIndex, setActiveCannedIndex] = useState(0);

  const cannedItems = useMemo(() => cannedPicker.results, [cannedPicker.results]);

  const applyCannedResponse = (item: (typeof cannedItems)[number] | undefined) => {
    if (!item) {
      return;
    }
    const resolved = resolveVariables(item.body, {
      requesterName,
      requestCode,
      assigneeName,
    });
    onCommentChange(resolved);
    cannedPicker.setIsOpen(false);
    setActiveCannedIndex(0);
  };

  const handleChange = (value: string) => {
    onCommentChange(value);

    const lines = value.split("\n");
    const lastLine = lines[lines.length - 1] ?? "";

    if (lastLine.startsWith("/")) {
      cannedPicker.setQuery(lastLine.slice(1));
      cannedPicker.setIsOpen(true);
      setActiveCannedIndex(0);
      return;
    }

    cannedPicker.setIsOpen(false);
    setActiveCannedIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!cannedPicker.isOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cannedPicker.setIsOpen(false);
      setActiveCannedIndex(0);
      return;
    }

    if (cannedItems.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveCannedIndex((current) => (current + 1) % cannedItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveCannedIndex((current) => (current - 1 + cannedItems.length) % cannedItems.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      applyCannedResponse(cannedItems[activeCannedIndex]);
    }
  };

  return (
    <>
      <Typography gutterBottom variant="body2">
        {t("comments.addTitle")}
      </Typography>

      <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
        <Tooltip title="Knowledge base">
          <IconButton onClick={() => setKbOpen(true)} size="small">
            <MenuBookOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Canned response (/shortcut)">
          <IconButton onClick={() => cannedPicker.setIsOpen((current) => !current)} size="small">
            <TextSnippetOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <MentionTextArea
        inputRef={inputRef}
        maxRows={10}
        mentionOptions={mentionOptions}
        minRows={3}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t("comments.placeholder")}
        value={comment}
      />

      <CannedResponsePicker
        activeIndex={activeCannedIndex}
        items={cannedPicker.results}
        onSelect={(item) => applyCannedResponse(item)}
        open={cannedPicker.isOpen}
      />

      <KnowledgeBasePickerModal
        onClose={() => setKbOpen(false)}
        onSelect={(item) => {
          const link = `[${item.title}](${window.location.origin}/knowledge-base/${item.id})`;
          insertTextAtCursor({
            current: comment,
            insert: link,
            inputRef,
            onCommentChange,
          });
        }}
        open={kbOpen}
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
