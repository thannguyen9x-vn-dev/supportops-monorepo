"use client";

import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import type { KnowledgeArticlePickerItem } from "@supportops/types";

import { useKnowledgeBasePicker } from "../hooks/useKnowledgeBasePicker";

export function KnowledgeBasePickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: KnowledgeArticlePickerItem) => void;
}) {
  const t = useTranslations("knowledgeBase");
  const picker = useKnowledgeBasePicker();
  const [input, setInput] = useState("");

  const debounceValue = useMemo(() => input.trim(), [input]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      picker.setQuery(debounceValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [debounceValue, open, picker]);

  const handleClose = () => {
    setInput("");
    picker.setQuery("");
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
      <DialogTitle>{t("picker.title")}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("picker.placeholder")}
          size="small"
          sx={{ mt: 1 }}
          value={input}
        />

        {picker.isLoading ? <CircularProgress size={20} sx={{ mt: 2 }} /> : null}

        <List disablePadding sx={{ mt: 1, maxHeight: 320, overflowY: "auto" }}>
          {picker.results.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => {
                onSelect(item);
                handleClose();
              }}
            >
              <ListItemText primary={item.title} />
            </ListItemButton>
          ))}
        </List>

        {picker.results.length === 0 && input.length >= 2 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
            {t("picker.empty")}
          </Typography>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
