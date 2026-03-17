"use client";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import type { SxProps, Theme } from "@mui/material";
import { Divider, ListSubheader, MenuItem, Select, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMemo, useState } from "react";

export type FilterSelectOption = {
  label: string;
  value: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  allLabel?: string;
  minWidth?: number;
  disabled?: boolean;
  /** Show a search input inside the dropdown. Default: false */
  searchable?: boolean;
  searchPlaceholder?: string;
  sx?: SxProps<Theme>;
};

function getBorderRadiusPx(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 8;
}

const CONTROL_HEIGHT = 32;

const textSmStyle = {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: "20px",
} as const;

// Theme-aware so borderRadius exactly matches the trigger's pill radius
const popupPaperSx = (theme: Theme) => {
  const borderRadius = getBorderRadiusPx(theme.shape.borderRadius) * 3;
  return {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: `${borderRadius}px`,
    boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
    overflow: "hidden",
    marginTop: "8px",
    "& .MuiList-root": {
      maxHeight: 320,
      overflowY: "auto",
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      fontSize: 13,
      fontWeight: 400,
      lineHeight: "16px",
      minHeight: 32,
      padding: "6px 16px",
      color: theme.palette.grey[700],
    },
  };
};

const StyledSelect = styled(Select<string>)(({ theme }) => {
  const borderRadius = getBorderRadiusPx(theme.shape.borderRadius) * 3;
  const borderColor = theme.palette.grey[300];

  return {
    height: CONTROL_HEIGHT,
    borderRadius,
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.grey[700],
    transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),

    "& fieldset": {
      borderColor,
      borderWidth: 1,
      inset: 0,
    },

    "&:hover fieldset": {
      borderColor: `${borderColor} !important`,
    },

    "&.Mui-focused fieldset": {
      borderColor: `${theme.palette.primary.main} !important`,
      borderWidth: "1px !important",
      boxShadow: "none !important",
    },

    "&.Mui-focused": {
      boxShadow: "none",
    },

    "& .MuiSelect-select": {
      ...textSmStyle,
      boxSizing: "border-box",
      height: "100% !important",
      minHeight: "unset !important",
      padding: "0 36px 0 16px !important",
      display: "flex",
      alignItems: "center",
      color: theme.palette.grey[700],
    },

    "& .MuiOutlinedInput-notchedOutline legend": {
      display: "none",
    },

    "& .MuiOutlinedInput-notchedOutline": {
      top: 0,
    },

    "& .MuiSelect-icon": {
      color: theme.palette.grey[500],
      fontSize: 24,
      right: 6,
    },

    "&.Mui-disabled": {
      backgroundColor: theme.palette.grey[50],
      "& fieldset": {
        borderColor: theme.palette.grey[200],
      },
    },
  };
});

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
  minWidth = 160,
  disabled,
  searchable = false,
  searchPlaceholder,
  sx,
}: FilterSelectProps) {
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchValue.trim()) return options;
    const needle = searchValue.trim().toLocaleLowerCase();
    return options.filter((o) => o.label.toLocaleLowerCase().includes(needle));
  }, [options, searchable, searchValue]);

  // Only reset search — value change only happens via MenuItem click (MUI default)
  const handleClose = () => {
    setSearchValue("");
  };

  return (
    <StyledSelect
      disabled={disabled}
      displayEmpty
      IconComponent={KeyboardArrowDownRoundedIcon}
      MenuProps={{
        disableAutoFocusItem: searchable,
        slotProps: {
          paper: { sx: popupPaperSx },
        },
      }}
      onClose={handleClose}
      onChange={(e) => onChange(e.target.value as string)}
      renderValue={(selected) => {
        if (!selected) {
          return (
            <span style={{ color: "var(--mui-palette-grey-500)", fontWeight: 400 }}>
              {label}
            </span>
          );
        }
        return options.find((o) => o.value === selected)?.label ?? selected;
      }}
      sx={{ minWidth, ...sx }}
      value={value}
    >
      {searchable ? (
        <ListSubheader
          sx={{
            paddingX: 1,
            paddingTop: 1,
            paddingBottom: 0,
            lineHeight: "normal",
            backgroundColor: "background.paper",
          }}
        >
          <TextField
            autoFocus
            fullWidth
            onChange={(e) => setSearchValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={searchPlaceholder}
            size="small"
            value={searchValue}
          />
        </ListSubheader>
      ) : null}

      {searchable ? <Divider sx={{ marginTop: 1 }} /> : null}

      <MenuItem value="">{allLabel}</MenuItem>

      {filteredOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </StyledSelect>
  );
}
