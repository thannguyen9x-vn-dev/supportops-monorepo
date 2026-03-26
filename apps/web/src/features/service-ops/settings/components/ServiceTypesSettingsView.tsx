"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useDialog } from "@supportops/ui";
import { ConfirmDialog, FormDialog } from "@supportops/ui-dialog";
import { TextInputField } from "@supportops/ui-form";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/features/common/toast/useToast";
import { ContentContainer } from "@/features/layout/components/ContentContainer/ContentContainer";
import { ApiError } from "@/lib/api";

import { serviceOpsSettingsService } from "../services/service-ops-settings.service";
import type { ServiceTypeSetting, SettingsLoadState } from "../types";

interface ServiceTypeFormValues {
  code: string;
  name: string;
  isActive: boolean;
}

const EMPTY_FORM: ServiceTypeFormValues = {
  code: "",
  name: "",
  isActive: true,
};
const SERVICE_TYPE_FORM_ID = "service-type-settings-form";

export function ServiceTypesSettingsView() {
  const t = useTranslations("pages.serviceOps.settings.serviceTypes");
  const dialog = useDialog();
  const deleteDialog = useDialog();
  const toast = useToast();
  const [deletingId, setDeletingId] = useState("");
  const [loadState, setLoadState] = useState<SettingsLoadState>("loading");
  const [items, setItems] = useState<ServiceTypeSetting[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, reset, watch, setValue } = useForm<ServiceTypeFormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

  const formValues = watch();

  const loadItems = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await serviceOpsSettingsService.listServiceTypes();
      setItems(data);
      setLoadState(data.length === 0 ? "empty" : "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setLoadState("permissionDenied");
        return;
      }
      setLoadState("error");
      setErrorMessage(t("feedback.loadError"));
    }
  }, [t]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const openAddDialog = () => {
    setEditingId("");
    reset(EMPTY_FORM);
    dialog.open();
  };

  const openEditDialog = (item: ServiceTypeSetting) => {
    setEditingId(item.id);
    reset({
      code: item.code,
      name: item.name,
      isActive: item.isActive,
    });
    dialog.open();
  };

  const closeDialog = () => {
    dialog.close();
    setEditingId("");
    reset(EMPTY_FORM);
  };

  const onSave = handleSubmit(async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const code = values.code.trim().toUpperCase();
      const name = values.name.trim();
      const duplicate = items.some((item) => item.code.toUpperCase() === code && item.id !== editingId);
      if (!code || !name || duplicate) return;

      const saved = await serviceOpsSettingsService.saveServiceType({
        id: editingId || undefined,
        code,
        name,
        isActive: values.isActive,
      });
      setItems((current) => {
        const exists = current.some((item) => item.id === saved.id);
        if (exists) return current.map((item) => (item.id === saved.id ? saved : item));
        return [saved, ...current];
      });
      setLoadState("success");
      toast.success(t("feedback.saveSuccess"));
      closeDialog();
    } catch {
      toast.error(t("feedback.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  });

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    deleteDialog.open();
  };

  const onDelete = async () => {
    try {
      await serviceOpsSettingsService.deleteServiceType(deletingId);
      const next = items.filter((item) => item.id !== deletingId);
      setItems(next);
      setLoadState(next.length === 0 ? "empty" : "success");
      toast.success(t("feedback.deleteSuccess"));
      deleteDialog.close();
    } catch {
      toast.error(t("feedback.deleteError"));
    }
  };

  return (
    <ContentContainer>
      <Stack spacing={2}>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4">{t("title")}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t("description")}
            </Typography>
          </Box>
          <Button onClick={openAddDialog} sx={{ flexShrink: 0 }} variant="contained">
            {t("form.createTitle")}
          </Button>
        </Stack>

        {loadState === "permissionDenied" ? <Alert severity="warning">{t("states.permissionDenied")}</Alert> : null}
        {loadState === "error" ? (
          <Alert
            action={
              <Button color="inherit" onClick={() => void loadItems()} size="small">
                {t("actions.retry")}
              </Button>
            }
            severity="error"
          >
            {errorMessage ?? t("feedback.loadError")}
          </Alert>
        ) : null}

        <Card variant="outlined">
          <CardContent>
            <Typography gutterBottom variant="h6">
              {t("table.title")}
            </Typography>
            {loadState === "loading" ? (
              <Stack spacing={1}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} variant="rectangular" />
                ))}
              </Stack>
            ) : items.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                {t("states.empty")}
              </Typography>
            ) : (
              <Stack spacing={1}>
                {items.map((item) => (
                  <Box key={item.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                    <Stack
                      alignItems="center"
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="body2">
                        <strong>{item.code}</strong> — {item.name}{" "}
                        <Typography
                          color={item.isActive ? "success.main" : "text.disabled"}
                          component="span"
                          variant="body2"
                        >
                          ({item.isActive ? t("table.active") : t("table.inactive")})
                        </Typography>
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button onClick={() => openEditDialog(item)} size="small" variant="text">
                          {t("actions.edit")}
                        </Button>
                        <Button color="error" onClick={() => openDeleteDialog(item.id)} size="small" variant="text">
                          {t("actions.delete")}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      <FormDialog
        cancelLabel={t("actions.cancel")}
        dialog={dialog}
        formId={SERVICE_TYPE_FORM_ID}
        submitDisabled={isSubmitting}
        submitLabel={editingId ? t("actions.update") : t("actions.create")}
        title={editingId ? t("form.editTitle") : t("form.createTitle")}
      >
        <Stack
          component="form"
          id={SERVICE_TYPE_FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            void onSave();
          }}
          spacing={2}
          sx={{ pt: 1 }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInputField
                autoFocus
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.code")}
                name="code"
                rules={{
                  validate: (value) => {
                    const normalized = value.trim().toUpperCase();
                    if (!normalized) return t("form.validation.codeRequired");
                    const duplicate = items.some(
                      (item) => item.code.toUpperCase() === normalized && item.id !== editingId,
                    );
                    return duplicate ? t("form.validation.duplicateCode") : true;
                  },
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInputField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.name")}
                name="name"
                rules={{
                  validate: (value) => (value.trim() ? true : t("form.validation.nameRequired")),
                }}
                size="small"
              />
            </Grid>
          </Grid>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Switch
              checked={formValues.isActive}
              onChange={(event) => setValue("isActive", event.target.checked)}
            />
            <Typography variant="body2">{t("form.fields.isActive")}</Typography>
          </Stack>
        </Stack>
      </FormDialog>

      <ConfirmDialog
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("actions.delete")}
        description={t("actions.confirmDeleteDescription")}
        dialog={deleteDialog}
        onConfirm={onDelete}
        title={t("actions.confirmDelete")}
      />
    </ContentContainer>
  );
}
