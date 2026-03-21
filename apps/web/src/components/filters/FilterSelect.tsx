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

const CONTROL_HEIGHT = 32;
const CONTROL_RADIUS = 8;

const textSmStyle = {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: "20px",
} as const;

// Theme-aware so borderRadius exactly matches the trigger's pill radius
const popupPaperSx = (theme: Theme) => {
  const varsPalette = theme.vars?.palette;
  const divider = varsPalette?.divider ?? theme.palette.divider;
  const textPrimary = varsPalette?.text.primary ?? theme.palette.text.primary;

  return {
    border: `1px solid ${divider}`,
    borderRadius: `${CONTROL_RADIUS}px`,
    backgroundColor: varsPalette?.background.paper ?? theme.palette.background.paper,
    boxShadow: "0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(144, 139, 164, 0.08)",
    overflow: "hidden",
    marginTop: "4px",
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
      color: textPrimary,
      "&:hover": {
        backgroundColor: varsPalette?.action.hover ?? theme.palette.action.hover,
      },
      "&.Mui-selected": {
        backgroundColor: varsPalette?.action.selected ?? theme.palette.action.selected,
      },
      "&.Mui-selected:hover": {
        backgroundColor: varsPalette?.action.selected ?? theme.palette.action.selected,
      },
    },
  };
};

const StyledSelect = styled(Select<string>)(({ theme }) => {
  const borderRadius = CONTROL_RADIUS;
  const innerRadius = Math.max(borderRadius - 2, 0);
  const varsPalette = theme.vars?.palette;
  const borderColor = varsPalette?.divider ?? theme.palette.divider;
  const backgroundPaper = varsPalette?.background.paper ?? theme.palette.background.paper;
  const textPrimary = varsPalette?.text.primary ?? theme.palette.text.primary;
  const textSecondary = varsPalette?.text.secondary ?? theme.palette.text.secondary;
  const textDisabled = varsPalette?.text.disabled ?? theme.palette.text.disabled;
  const disabledBackground =
    varsPalette?.action.disabledBackground ?? theme.palette.action.disabledBackground;
  const focusPrimary = varsPalette?.primary.main ?? theme.palette.primary.main;

  return {
    height: CONTROL_HEIGHT,
    borderRadius,
    overflow: "hidden",
    backgroundColor: backgroundPaper,
    color: textPrimary,
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
      borderColor: `${focusPrimary} !important`,
      borderWidth: "1px !important",
      boxShadow: "none !important",
    },

    "&.Mui-focused": {
      boxShadow: "none",
    },

    "& .MuiSelect-select": {
      ...textSmStyle,
      boxSizing: "border-box",
      minHeight: `${CONTROL_HEIGHT - 4}px !important`,
      height: `${CONTROL_HEIGHT - 4}px !important`,
      width: "calc(100% - 4px)",
      margin: "2px",
      padding: "0 38px 0 14px !important",
      display: "flex",
      alignItems: "center",
      lineHeight: `${CONTROL_HEIGHT - 4}px`,
      color: textPrimary,
      WebkitTextFillColor: textPrimary,
      backgroundColor: `${backgroundPaper} !important`,
      borderRadius: `${innerRadius}px`,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      minWidth: 0,
    },
    "& .MuiSelect-select:focus": {
      backgroundColor: `${backgroundPaper} !important`,
    },
    "& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input": {
      backgroundColor: `${backgroundPaper} !important`,
      borderRadius: `${innerRadius}px`,
      boxShadow: "none !important",
    },
    "& .MuiSelect-nativeInput": {
      inset: 0,
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      backgroundColor: "transparent !important",
      borderRadius: 0,
    },
    "& .MuiSelect-select > span": {
      display: "block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    "& .MuiOutlinedInput-notchedOutline legend": {
      display: "none",
    },

    "& .MuiOutlinedInput-notchedOutline": {
      top: 0,
      borderRadius: "inherit",
    },

    "& .MuiSelect-icon": {
      color: textSecondary,
      fontSize: 24,
      right: 6,
    },

    "&.Mui-disabled": {
      backgroundColor: disabledBackground,
      "& fieldset": {
        borderColor,
      },
      "& .MuiSelect-select": {
        color: textDisabled,
        WebkitTextFillColor: textDisabled,
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
            <span
              style={{
                color: "var(--mui-palette-text-secondary)",
                WebkitTextFillColor: "var(--mui-palette-text-secondary)",
                fontWeight: 400,
              }}
            >
              {label}
            </span>
          );
        }
        return (
          <span>{options.find((o) => o.value === selected)?.label ?? selected}</span>
        );
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
