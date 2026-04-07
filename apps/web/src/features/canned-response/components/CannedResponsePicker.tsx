"use client";

import { List, ListItemButton, ListItemText, Paper } from "@mui/material";
import type { CannedResponsePickerItem } from "@supportops/types";

export function CannedResponsePicker({
  open,
  items,
  activeIndex,
  onSelect,
}: {
  open: boolean;
  items: CannedResponsePickerItem[];
  activeIndex: number;
  onSelect: (item: CannedResponsePickerItem) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <Paper sx={{ mt: 0.5, maxHeight: 200, overflowY: "auto" }}>
      <List dense disablePadding>
        {items.map((item, index) => (
          <ListItemButton key={item.id} onClick={() => onSelect(item)} selected={index === activeIndex}>
            <ListItemText primary={item.shortcut ? `/${item.shortcut} · ${item.title}` : item.title} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
