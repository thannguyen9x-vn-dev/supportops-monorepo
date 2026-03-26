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
import { ConfirmDialog, FormDialog } from "@supportops/ui-dialog";
import { SelectOptionField, TextInputField } from "@supportops/ui-form";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { TruncatedText } from "@supportops/ui";

import { ContentContainer } from "@/features/layout/components/ContentContainer/ContentContainer";
import { useToast } from "@/features/common/toast/useToast";

import { useSettingsCrud } from "../hooks/useSettingsCrud";
import { serviceOpsSettingsService } from "../services/service-ops-settings.service";
import type { ServiceTypeSetting, SlaPolicySetting } from "../types";

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
  const toast = useToast();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeSetting[]>([]);
  const { control, handleSubmit, reset } = useForm<SlaFormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

  const toFormValues = useCallback((item: SlaPolicySetting): SlaFormValues => ({
    serviceTypeCode: item.serviceTypeCode,
    responseMinutes: String(item.responseMinutes),
    resolutionMinutes: String(item.resolutionMinutes),
    escalationAfterMinutes: String(item.escalationAfterMinutes),
  }), []);

  const loadItems = useCallback(() => serviceOpsSettingsService.listSlaPolicies(), []);
  const resetFormCb = useCallback((values: SlaFormValues) => reset(values), [reset]);
  const saveItem = useCallback(async ({ editingId: currentEditingId, values }: { editingId: string; values: SlaFormValues }) => {
    const serviceTypeCode = values.serviceTypeCode.trim().toUpperCase();
    const responseMinutes = Number(values.responseMinutes);
    const resolutionMinutes = Number(values.resolutionMinutes);
    const escalationAfterMinutes = Number(values.escalationAfterMinutes);
    if (
      !serviceTypeCode ||
      !Number.isFinite(responseMinutes) || responseMinutes <= 0 ||
      !Number.isFinite(resolutionMinutes) || resolutionMinutes <= 0 ||
      !Number.isFinite(escalationAfterMinutes) || escalationAfterMinutes <= 0
    ) return null;
    return serviceOpsSettingsService.saveSlaPolicy({
      id: currentEditingId || undefined,
      serviceTypeCode,
      responseMinutes,
      resolutionMinutes,
      escalationAfterMinutes,
    });
  }, []);
  const deleteItem = useCallback((id: string) => serviceOpsSettingsService.deleteSlaPolicy(id), []);
  const getItemId = useCallback((item: SlaPolicySetting) => item.id, []);
  const onSaveSuccess = useCallback(() => toast.success(t("feedback.saveSuccess")), [t, toast]);
  const onSaveError = useCallback(() => toast.error(t("feedback.saveError")), [t, toast]);
  const onDeleteSuccess = useCallback(() => toast.success(t("feedback.deleteSuccess")), [t, toast]);
  const onDeleteError = useCallback(() => toast.error(t("feedback.deleteError")), [t, toast]);

  const {
    dialog,
    deleteDialog,
    loadState,
    items,
    errorMessage,
    editingId,
    isSubmitting,
    reloadItems,
    openAddDialog,
    openEditDialog,
    save,
    openDeleteDialog,
    confirmDelete,
  } = useSettingsCrud<SlaPolicySetting, SlaFormValues>({
    queryKey: ["sla-policies"] as const,
    emptyForm: EMPTY_FORM,
    toFormValues,
    loadItems,
    saveItem,
    deleteItem,
    getItemId,
    resetForm: resetFormCb,
    loadErrorMessage: t("feedback.loadError"),
    onSaveSuccess,
    onSaveError,
    onDeleteSuccess,
    onDeleteError,
  });

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

  const onSave = handleSubmit(async (values) => {
    await save(values);
  });

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
              <Button color="inherit" onClick={() => void reloadItems()} size="small">
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
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <TruncatedText
                        style={{ fontSize: "14px" }}
                        title={`${item.serviceTypeCode} — ${t("form.fields.responseMinutes")}: ${item.responseMinutes}m · ${t("form.fields.resolutionMinutes")}: ${item.resolutionMinutes}m · ${t("form.fields.escalationAfterMinutes")}: ${item.escalationAfterMinutes}m`}
                      >
                        <strong>{item.serviceTypeCode}</strong>
                        {" — "}
                        {t("form.fields.responseMinutes")}: {item.responseMinutes}m
                        {" · "}
                        {t("form.fields.resolutionMinutes")}: {item.resolutionMinutes}m
                        {" · "}
                        {t("form.fields.escalationAfterMinutes")}: {item.escalationAfterMinutes}m
                      </TruncatedText>
                      <Stack direction="row" flexShrink={0} spacing={1}>
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
        onConfirm={confirmDelete}
        title={t("actions.confirmDelete")}
      />
    </ContentContainer>
  );
}
