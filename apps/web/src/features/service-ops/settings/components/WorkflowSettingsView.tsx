"use client";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormHelperText,
  FormLabel,
  Grid,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { REQUEST_STATUSES, USER_ROLES } from "@supportops/types";
import { ConfirmDialog, FormDialog } from "@supportops/ui-dialog";
import { SelectOptionField } from "@supportops/ui-form";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useToast } from "@/features/common/toast/useToast";
import { ContentContainer } from "@/features/layout/components/ContentContainer/ContentContainer";

import { useSettingsCrud } from "../hooks/useSettingsCrud";
import { serviceOpsSettingsService } from "../services/service-ops-settings.service";
import type { ServiceTypeSetting, WorkflowTransitionSetting } from "../types";

const STATUS_OPTIONS = REQUEST_STATUSES.map((s) => ({ value: s, label: s }));
const ROLE_OPTIONS = USER_ROLES.map((r) => ({ value: r, label: r }));

interface WorkflowFormValues {
  serviceTypeCode: string;
  fromStatus: string;
  toStatus: string;
  allowedRoles: string[];
}

const EMPTY_FORM: WorkflowFormValues = {
  serviceTypeCode: "",
  fromStatus: "",
  toStatus: "",
  allowedRoles: [],
};
const WORKFLOW_FORM_ID = "workflow-settings-form";

export function WorkflowSettingsView() {
  const t = useTranslations("pages.serviceOps.settings.workflow");
  const toast = useToast();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeSetting[]>([]);
  const { control, handleSubmit, reset } = useForm<WorkflowFormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
  });

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
  } = useSettingsCrud<WorkflowTransitionSetting, WorkflowFormValues>({
    emptyForm: EMPTY_FORM,
    toFormValues: (item) => ({
      serviceTypeCode: item.serviceTypeCode,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      allowedRoles: item.allowedRoles,
    }),
    loadItems: () => serviceOpsSettingsService.listWorkflowTransitions(),
    saveItem: ({ editingId: currentEditingId, values }) =>
      serviceOpsSettingsService.saveWorkflowTransition({
        id: currentEditingId || undefined,
        serviceTypeCode: values.serviceTypeCode,
        fromStatus: values.fromStatus,
        toStatus: values.toStatus,
        allowedRoles: values.allowedRoles,
      }),
    deleteItem: (id) => serviceOpsSettingsService.deleteWorkflowTransition(id),
    getItemId: (item) => item.id,
    resetForm: (values) => reset(values),
    loadErrorMessage: t("feedback.loadError"),
    onSaveSuccess: () => toast.success(t("feedback.saveSuccess")),
    onSaveError: () => toast.error(t("feedback.saveError")),
    onDeleteSuccess: () => toast.success(t("feedback.deleteSuccess")),
    onDeleteError: () => toast.error(t("feedback.deleteError")),
  });

  useEffect(() => {
    void serviceOpsSettingsService.listServiceTypes().then(setServiceTypes).catch(() => undefined);
  }, []);

  const serviceTypeOptions = useMemo(
    () =>
      serviceTypes
        .filter((st) => st.isActive)
        .map((st) => ({ value: st.code, label: `${st.code} — ${st.name}` })),
    [serviceTypes],
  );

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
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="body2">
                        <strong>{item.serviceTypeCode}</strong>: {item.fromStatus} → {item.toStatus}{" "}
                        <Typography color="text.secondary" component="span" variant="body2">
                          ({item.allowedRoles.join(", ")})
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
        formId={WORKFLOW_FORM_ID}
        submitDisabled={isSubmitting}
        submitLabel={editingId ? t("actions.update") : t("actions.create")}
        title={editingId ? t("form.editTitle") : t("form.createTitle")}
      >
        <Stack
          component="form"
          id={WORKFLOW_FORM_ID}
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
                  validate: (value) => (value.trim() ? true : t("form.validation.serviceTypeCodeRequired")),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectOptionField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.fromStatus")}
                name="fromStatus"
                options={STATUS_OPTIONS}
                rules={{
                  validate: (value) => (value.trim() ? true : t("form.validation.statusRequired")),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectOptionField
                control={control}
                fullWidth
                hideEmptyHelperText
                label={t("form.fields.toStatus")}
                name="toStatus"
                options={STATUS_OPTIONS}
                rules={{
                  validate: (value) => (value.trim() ? true : t("form.validation.statusRequired")),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                control={control}
                name="allowedRoles"
                rules={{
                  validate: (value) => (value.length > 0 ? true : t("form.validation.allowedRolesRequired")),
                }}
                render={({ field, fieldState }) => (
                  <Box>
                    <FormLabel
                      sx={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: "20px",
                        color: "text.secondary",
                        mb: 0.75,
                      }}
                    >
                      {t("form.fields.allowedRoles")}
                    </FormLabel>
                    <Select
                      {...field}
                      displayEmpty
                      error={Boolean(fieldState.error)}
                      fullWidth
                      input={<OutlinedInput size="small" />}
                      multiple
                      renderValue={(selected) => {
                        if ((selected as string[]).length === 0) {
                          return (
                            <Typography color="text.secondary" sx={{ fontSize: 14, fontWeight: 600 }}>
                              — Select roles —
                            </Typography>
                          );
                        }
                        return (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {(selected as string[]).map((v) => (
                              <Chip key={v} label={v} size="small" />
                            ))}
                          </Box>
                        );
                      }}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline legend": { display: "none" },
                        "& .MuiOutlinedInput-notchedOutline": { top: 0 },
                      }}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Checkbox
                            checked={field.value.includes(role.value)}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            size="small"
                          />
                          <ListItemText
                            primary={role.label}
                            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error ? (
                      <FormHelperText error sx={{ ml: 0, mt: 1, fontSize: 14, fontWeight: 600 }}>
                        {fieldState.error.message}
                      </FormHelperText>
                    ) : null}
                  </Box>
                )}
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
