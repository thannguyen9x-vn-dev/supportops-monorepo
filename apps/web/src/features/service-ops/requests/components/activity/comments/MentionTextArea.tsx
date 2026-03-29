import { List, ListItemButton, ListItemText, Paper, TextField } from "@mui/material";
import { useMemo, useState, type KeyboardEvent, type RefObject } from "react";
import { useTranslations } from "next-intl";

export interface MentionOption {
  id: string;
  name: string;
}

interface MentionContext {
  start: number;
  end: number;
  query: string;
}

interface MentionTextAreaProps {
  value: string;
  placeholder: string;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  mentionOptions: MentionOption[];
  minRows?: number;
  maxRows?: number;
  onChange: (nextValue: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

function readMentionContext(value: string, cursorPosition: number): MentionContext | null {
  const leftText = value.slice(0, cursorPosition);
  const match = /(^|\s)@([^\s@]*)$/.exec(leftText);
  if (!match) return null;

  const prefix = match[1] ?? "";
  const query = match[2] ?? "";
  const start = match.index + prefix.length;
  return { start, end: cursorPosition, query };
}

function readCursorPosition(target: EventTarget | null, fallback: number): number {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.selectionStart ?? fallback;
  }
  return fallback;
}

export function MentionTextArea({
  value,
  placeholder,
  inputRef,
  mentionOptions,
  minRows = 3,
  maxRows = 10,
  onChange,
  onKeyDown,
}: MentionTextAreaProps) {
  const t = useTranslations("pages.requests.detail");
  const [mentionContext, setMentionContext] = useState<MentionContext | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    if (!mentionContext) return [];

    const keyword = mentionContext.query.trim().toLowerCase();
    const items = keyword.length === 0
      ? mentionOptions
      : mentionOptions.filter((option) => option.name.toLowerCase().includes(keyword));

    return items.slice(0, 6);
  }, [mentionContext, mentionOptions]);

  const isMentionListOpen = mentionContext !== null && filteredOptions.length > 0;

  const applyMention = (option: MentionOption) => {
    if (!mentionContext) return;

    const beforeMention = value.slice(0, mentionContext.start);
    const afterMention = value.slice(mentionContext.end);
    const mentionValue = `@${option.name} `;
    const nextValue = `${beforeMention}${mentionValue}${afterMention}`;

    onChange(nextValue);
    setMentionContext(null);
    setActiveIndex(0);

    window.requestAnimationFrame(() => {
      const nextCursor = beforeMention.length + mentionValue.length;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const refreshMentionContext = (cursorPosition: number, nextValue: string = value) => {
    const context = readMentionContext(nextValue, cursorPosition);
    setMentionContext(context);
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dispatchExternal = () => {
      if (!event.defaultPrevented) {
        onKeyDown?.(event);
      }
    };

    if (!isMentionListOpen) {
      dispatchExternal();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % filteredOptions.length);
      dispatchExternal();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + filteredOptions.length) % filteredOptions.length);
      dispatchExternal();
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const selectedOption = filteredOptions[activeIndex];
      if (selectedOption) applyMention(selectedOption);
      dispatchExternal();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setMentionContext(null);
      dispatchExternal();
      return;
    }

    dispatchExternal();
  };

  return (
    <>
      <TextField
        fullWidth
        inputRef={inputRef}
        maxRows={maxRows}
        minRows={minRows}
        multiline
        onBlur={() => setMentionContext(null)}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue);
          refreshMentionContext(event.target.selectionStart ?? nextValue.length, nextValue);
        }}
        onClick={(event) => refreshMentionContext(readCursorPosition(event.target, value.length))}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => refreshMentionContext(readCursorPosition(event.target, value.length))}
        placeholder={placeholder}
        value={value}
      />

      {mentionContext !== null && filteredOptions.length === 0 ? (
        <Paper sx={{ mt: 0.5, p: 1 }}>
          <List disablePadding>
            <ListItemButton disabled sx={{ borderRadius: 1 }}>
              <ListItemText primary={t("comments.mention.noResults")} />
            </ListItemButton>
          </List>
        </Paper>
      ) : null}

      {isMentionListOpen ? (
        <Paper sx={{ mt: 0.5, overflow: "hidden" }}>
          <List disablePadding>
            {filteredOptions.map((option, index) => (
              <ListItemButton
                key={option.id}
                onClick={() => applyMention(option)}
                selected={index === activeIndex}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary={option.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : null}
    </>
  );
}
