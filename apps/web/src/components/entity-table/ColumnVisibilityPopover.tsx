"use client";

import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

import type { EntityColumnDef } from "./types";

type ColumnVisibilityPopoverProps<TData> = {
  columns: EntityColumnDef<TData>[];
  isColumnVisible: (columnId: string) => boolean;
  toggleColumn: (columnId: string) => void;
  showAllColumns: () => void;
};

export function ColumnVisibilityPopover<TData>({
  columns,
  isColumnVisible,
  toggleColumn,
  showAllColumns,
}: ColumnVisibilityPopoverProps<TData>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const hideableColumns = columns.filter((col) => col.hideable);

  // Get column ID from column definition
  const getColumnId = (col: EntityColumnDef<TData>): string => {
    if (col.id) return col.id;
    if ("accessorKey" in col && col.accessorKey) return String(col.accessorKey);
    return "";
  };

  // Get column header text
  const getColumnHeader = (col: EntityColumnDef<TData>): string => {
    if (typeof col.header === "string") return col.header;
    return getColumnId(col);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          width: 40,
          height: 40,
          borderRadius: "6px",
          border: "1px solid",
          borderColor: "grey.300",
          backgroundColor: "grey.50",
          color: "grey.600",
          "&:hover": {
            borderColor: "grey.300",
            backgroundColor: "grey.100",
          },
        }}
      >
        <ViewColumnIcon fontSize="small" />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 200,
              maxWidth: 300,
              boxShadow: 3,
            },
          },
        }}
      >
        <Stack spacing={1.5} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight={600}>
              Columns
            </Typography>
            <Button
              size="small"
              onClick={() => {
                showAllColumns();
              }}
              sx={{ fontSize: 12, minWidth: "auto" }}
            >
              Show All
            </Button>
          </Stack>

          <Stack spacing={0.5}>
            {hideableColumns.map((col) => {
              const columnId = getColumnId(col);
              const header = getColumnHeader(col);

              return (
                <FormControlLabel
                  key={columnId}
                  control={
                    <Checkbox
                      checked={isColumnVisible(columnId)}
                      onChange={() => toggleColumn(columnId)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" fontSize={13}>
                      {header}
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
