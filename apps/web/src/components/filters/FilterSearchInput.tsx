"use client";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import type { SxProps, Theme } from "@mui/material";
import { InputAdornment, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

function getBorderRadiusPx(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 8;
}

const textSmStyle = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "20px",
} as const;

const StyledTextField = styled(TextField)(({ theme }) => {
  const controlHeight = 40;
  const borderRadius = getBorderRadiusPx(theme.shape.borderRadius) * 3;
  const borderColor = theme.palette.grey[300];

  return {
    "& .MuiOutlinedInput-root": {
      minHeight: controlHeight,
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
        borderColor,
      },

      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },

      "&.Mui-focused": {
        boxShadow: "none",
      },

      "&.Mui-focused:not(.Mui-readOnly) input[aria-invalid='false'] ~ fieldset": {
        boxShadow: "none",
      },

      "& .MuiOutlinedInput-input": {
        ...textSmStyle,
        boxSizing: "border-box",
        height: controlHeight,
        padding: "10px 16px",
        paddingLeft: 0,
        color: theme.palette.grey[700],
        outline: "none",
        WebkitTextFillColor: theme.palette.grey[700],
        caretColor: theme.palette.grey[700],

        "&::placeholder": {
          color: theme.palette.grey[500],
          opacity: 1,
          fontWeight: 400,
        },

        "&:focus": { outline: "none" },
        "&:focus-visible": { outline: "none" },
      },

      "& .MuiOutlinedInput-notchedOutline legend": {
        display: "none",
      },

      "& .MuiOutlinedInput-notchedOutline": {
        top: 0,
      },

      "&.MuiInputBase-adornedStart": {
        paddingLeft: 16,
      },

      "& .MuiInputAdornment-root": {
        color: theme.palette.grey[500],
        marginLeft: 0,
        marginRight: 6,
      },
    },
  };
});

type FilterSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
};

export function FilterSearchInput({ value, onChange, placeholder, sx }: FilterSearchInputProps) {
  return (
    <StyledTextField
      fullWidth
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
      sx={sx}
      value={value}
    />
  );
}
