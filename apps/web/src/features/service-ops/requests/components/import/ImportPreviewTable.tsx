"use client";

import { Checkbox, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { ImportRowError, ImportRowWarning } from "@supportops/types";
import { useTranslations } from "next-intl";

interface ImportPreviewTableProps {
  errorRows: ImportRowError[];
  warningRows: ImportRowWarning[];
  validRowCount: number;
  skippedRows: Set<number>;
  onToggleRow: (index: number) => void;
}

export function ImportPreviewTable({
  errorRows,
  warningRows,
  validRowCount,
  skippedRows,
  onToggleRow,
}: ImportPreviewTableProps): React.JSX.Element {
  const t = useTranslations("pages.requests.list");

  return (
    <Stack spacing={1.5}>
      <Typography color="text.secondary" variant="body2">
        {t("import.preview.validRows", { count: validRowCount })}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>{t("import.preview.type")}</TableCell>
            <TableCell>{t("import.preview.message")}</TableCell>
            <TableCell align="right">{t("import.preview.include")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {errorRows.map((row) => (
            <TableRow key={`error-${row.row}`} sx={{ backgroundColor: "error.light" }}>
              <TableCell>{row.row}</TableCell>
              <TableCell><Chip color="error" label={t("import.preview.error")} size="small" /></TableCell>
              <TableCell>{row.message}</TableCell>
              <TableCell align="right">
                <Checkbox aria-label={`error-row-${row.row}`} checked={false} disabled />
              </TableCell>
            </TableRow>
          ))}
          {warningRows.map((row) => (
            <TableRow key={`warning-${row.row}`} sx={{ backgroundColor: "warning.light" }}>
              <TableCell>{row.row}</TableCell>
              <TableCell><Chip color="warning" label={t("import.preview.warning")} size="small" /></TableCell>
              <TableCell>
                {row.message || (row.type === "duplicate_in_file" ? t("import.preview.duplicateInFile") : t("import.preview.duplicateRecent"))}
              </TableCell>
              <TableCell align="right">
                <Checkbox
                  aria-label={`warning-row-${row.row}`}
                  checked={!skippedRows.has(row.row)}
                  onChange={() => onToggleRow(row.row)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
