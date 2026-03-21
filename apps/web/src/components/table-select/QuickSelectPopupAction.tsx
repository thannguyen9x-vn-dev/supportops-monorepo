"use client";

import { useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import { Button, Menu, MenuItem, type SxProps, type Theme } from "@mui/material";

export type TableSelectOption = {
  label: string;
  value: string;
};

type QuickSelectPopupActionProps = {
  value: string;
  options: TableSelectOption[];
  onSelect: (nextValue: string) => Promise<void> | void;
  disabled?: boolean;
  buttonSx?: SxProps<Theme>;
};

export function QuickSelectPopupAction({
  value,
  options,
  onSelect,
  disabled = false,
  buttonSx,
}: QuickSelectPopupActionProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [saving, setSaving] = useState(false);
  const open = Boolean(anchorEl);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? value,
    [options, value],
  );

  const closeMenu = () => setAnchorEl(null);

  const handleChoose = async (nextValue: string) => {
    if (nextValue === value) {
      closeMenu();
      return;
    }

    setSaving(true);
    closeMenu();
    try {
      await onSelect(nextValue);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        disabled={disabled || saving}
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        sx={buttonSx}
        variant="outlined"
      >
        {selectedLabel}
      </Button>

      <Menu anchorEl={anchorEl} onClose={closeMenu} open={open}>
        {options.map((option) => (
          <MenuItem
            disabled={disabled || saving}
            key={option.value}
            onClick={() => void handleChoose(option.value)}
            selected={option.value === value}
            sx={{ display: "flex", gap: 1.5, minWidth: 220 }}
          >
            {option.value === value ? <CheckIcon color="primary" fontSize="small" /> : <span style={{ width: 20 }} />}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
