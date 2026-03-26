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
  Typography,
} from "@mui/material";
import { useDialog } from "@supportops/ui";
import { ConfirmDialog, FormDialog } from "@supportops/ui-dialog";
import { SelectOptionField, TextInputField } from "@supportops/ui-form";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { ContentContainer } from "@/features/layout/components/ContentContainer/ContentContainer";
import { useToast } from "@/features/common/toast/useToast";
import { ApiError } from "@/lib/api";

import { serviceOpsSettingsService } from "../services/service-ops-settings.service";
import type { ServiceTypeSetting, SettingsLoadState, SlaPolicySetting } from "../types";

interface SlaFormValues {
  serviceTypeCode: string;
  responseMinutes: string;
  resolutionMinutes: string;
  escalationAfterMinutes: string;
}

const EMPTY_FORM: SlaFormValues = {
  serviceTypeCode: "",
  responseMinutes: "30",
  resolutionMinutes: "480",
  escalationAfterMinutes: "60",
};
const SLA_FORM_ID = "sla-settings-form";

export function SlaSettingsView() {
  const t = useTranslations("pages.serviceOps.settings.sla");
  const dialog = useDialog();
  const deleteDialog = useDialog();
  const toast = useToast();
  const [deletingId, setDeletingId] = useState("");
  const [loadState, setLoadState] = useState<SettingsLoadState>("loading");
  const [items, setItems] = useState<SlaPolicySetting[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeSetting[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const { control, handleSubmit, reset } = useForm<SlaFormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

  const loadItems = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await serviceOpsSettingsService.listSlaPolicies();
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

  useEffect(() => {
    void serviceOpsSettingsService.listServiceTypes().then(setServiceTypes).catch(() => undefined);
  }, []);

  const usedCodes = useMemo(() => new Set(items.map((item) => item.serviceTypeCode)), [items]);

  const serviceTypeOptions = useMemo(() => {
    const editingCode = editingId ? items.find((item) => item.id === editingId)?.serviceTypeCode : undefined;
    return serviceTypes
      .filter((st) => st.isActive && (!usedCodes.has(st.code) || st.code === editingCode))
      .map((st) => ({ value: st.code, label: `${st.code} — ${st.name}` }));
  }, [serviceTypes, usedCodes, editingId, items]);

  const openAddDialog = () => {
    setEditingId("");
    reset(EMPTY_FORM);
    dialog.open();
  };

  const openEditDialog = (item: SlaPolicySetting) => {
    setEditingId(item.id);
    reset({
      serviceTypeCode: item.serviceTypeCode,
      responseMinutes: String(item.responseMinutes),
      resolutionMinutes: String(item.resolutionMinutes),
      escalationAfterMinutes: String(item.escalationAfterMinutes),
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
      const serviceTypeCode = values.serviceTypeCode.trim().toUpperCase();
      const responseMinutes = Number(values.responseMinutes);
      const resolutionMinutes = Number(values.resolutionMinutes);
      const escalationAfterMinutes = Number(values.escalationAfterMinutes);
      if (
        !serviceTypeCode ||
        !Number.isFinite(responseMinutes) ||
        responseMinutes <= 0 ||
        !Number.isFinite(resolutionMinutes) ||
        resolutionMinutes <= 0 ||
        !Number.isFinite(escalationAfterMinutes) ||
        escalationAfterMinutes <= 0
      ) {
        return;
      }

      const saved = await serviceOpsSettingsService.saveSlaPolicy({
        id: editingId || undefined,
        serviceTypeCode,
        responseMinutes,
        resolutionMinutes,
        escalationAfterMinutes,
      });
      setItems((current) => {
        const exists = current.some((item) => item.id === saved.id);
        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }
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
      await serviceOpsSettingsService.deleteSlaPolicy(deletingId);
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
                        <strong>{item.serviceTypeCode}</strong>
                        {" — "}
                        {t("form.fields.responseMinutes")}: {item.responseMinutes}m
                        {" · "}
                        {t("form.fields.resolutionMinutes")}: {item.resolutionMinutes}m
                        {" · "}
                        {t("form.fields.escalationAfterMinutes")}: {item.escalationAfterMinutes}m
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
        formId={SLA_FORM_ID}
        submitDisabled={isSubmitting}
        submitLabel={editingId ? t("actions.update") : t("actions.create")}
        title={editingId ? t("form.editTitle") : t("form.createTitle")}
      >
        <Stack
          component="form"
          id={SLA_FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            void onSave();
          }}
          spacing={2}
          sx={{ pt: 1 }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <SelectOptionField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.serviceTypeCode")}
                name="serviceTypeCode"
                options={serviceTypeOptions}
                rules={{
                  validate: (value) =>
                    value.trim() ? true : t("form.validation.serviceTypeCodeRequired"),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInputField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.responseMinutes")}
                name="responseMinutes"
                rules={{
                  validate: (value) =>
                    Number.isFinite(Number(value)) && Number(value) > 0 ? true : t("form.validation.minutesPositive"),
                }}
                size="small"
                slotProps={{ htmlInput: { min: 1 } }}
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInputField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.resolutionMinutes")}
                name="resolutionMinutes"
                rules={{
                  validate: (value) =>
                    Number.isFinite(Number(value)) && Number(value) > 0 ? true : t("form.validation.minutesPositive"),
                }}
                size="small"
                slotProps={{ htmlInput: { min: 1 } }}
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInputField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.escalationAfterMinutes")}
                name="escalationAfterMinutes"
                rules={{
                  validate: (value) =>
                    Number.isFinite(Number(value)) && Number(value) > 0 ? true : t("form.validation.minutesPositive"),
                }}
                size="small"
                slotProps={{ htmlInput: { min: 1 } }}
                type="number"
              />
            </Grid>
          </Grid>
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
