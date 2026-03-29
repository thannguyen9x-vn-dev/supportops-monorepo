"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { CannedResponse } from "@supportops/types";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { useCannedResponses } from "../hooks/useCannedResponses";
import { CannedResponseForm } from "./CannedResponseForm";

export function CannedResponseView() {
  const t = useTranslations("cannedResponses");
  const { user } = useAuth();
  const canManage = user?.role === "OPS_COORDINATOR" || user?.role === "TENANT_ADMIN";
  const canned = useCannedResponses();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CannedResponse | null>(null);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Typography sx={{ flex: 1 }} variant="h5">{t("title")}</Typography>
        <TextField
          onChange={(event) => canned.setSearch(event.target.value)}
          placeholder={t("picker.placeholder")}
          size="small"
          sx={{ minWidth: 280 }}
          value={canned.search}
        />
        {canManage ? (
          <Button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            startIcon={<AddOutlinedIcon />}
            variant="contained"
          >
            {t("new")}
          </Button>
        ) : null}
      </Stack>

      <Paper sx={{ p: 2 }}>
        {canned.isLoading ? <CircularProgress size={24} /> : null}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("titleField")}</TableCell>
              <TableCell>{t("shortcut")}</TableCell>
              <TableCell>{t("category")}</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {canned.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.shortcut ? `/${item.shortcut}` : "-"}</TableCell>
                <TableCell>{item.category ?? "-"}</TableCell>
                <TableCell align="right">
                  {canManage ? (
                    <>
                      <IconButton
                        onClick={() => {
                          setEditing(item);
                          setOpenForm(true);
                        }}
                        size="small"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => void canned.remove(item.id)} size="small">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <CannedResponseForm
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSubmit={async (data) => {
          if (editing) {
            await canned.update({ id: editing.id, data });
          } else {
            await canned.create(data);
          }
          setOpenForm(false);
        }}
        open={openForm}
      />
    </Stack>
  );
}
