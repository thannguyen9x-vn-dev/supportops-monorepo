"use client";

import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { serviceOpsSettingsService } from "../services/service-ops-settings.service";
import type { SettingsLoadState, WorkflowTransitionSetting } from "../types";

const EMPTY_FORM = {
  id: "",
  serviceTypeCode: "",
  fromStatus: "",
  toStatus: "",
  allowedRoles: "",
};

export function WorkflowSettingsView() {
  const t = useTranslations("pages.serviceOps.settings.workflow");
  const [loadState, setLoadState] = useState<SettingsLoadState>("loading");
  const [items, setItems] = useState<WorkflowTransitionSetting[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const normalizedServiceTypeCode = form.serviceTypeCode.trim().toUpperCase();
  const normalizedFromStatus = form.fromStatus.trim().toUpperCase();
  const normalizedToStatus = form.toStatus.trim().toUpperCase();
  const normalizedRoles = form.allowedRoles
    .split(",")
    .map((role) => role.trim().toUpperCase())
    .filter(Boolean);
  const hasServiceTypeCodeError = normalizedServiceTypeCode.length === 0;
  const hasStatusError = normalizedFromStatus.length === 0 || normalizedToStatus.length === 0;
  const hasAllowedRolesError = normalizedRoles.length === 0;

  const loadItems = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await serviceOpsSettingsService.listWorkflowTransitions();
      setItems(data);
      setLoadState(data.length === 0 ? "empty" : "success");
    } catch {
      setLoadState("error");
      setErrorMessage(t("feedback.loadError"));
    }
  }, [t]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const canSubmit = useMemo(
    () => !hasServiceTypeCodeError && !hasStatusError && !hasAllowedRolesError,
    [hasAllowedRolesError, hasServiceTypeCodeError, hasStatusError],
  );

  const resetForm = () => setForm(EMPTY_FORM);

  const onSave = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const saved = await serviceOpsSettingsService.saveWorkflowTransition({
        id: form.id || undefined,
        serviceTypeCode: normalizedServiceTypeCode,
        fromStatus: normalizedFromStatus,
        toStatus: normalizedToStatus,
        allowedRoles: normalizedRoles,
      });
      setItems((current) => {
        const exists = current.some((item) => item.id === saved.id);
        if (exists) return current.map((item) => (item.id === saved.id ? saved : item));
        return [saved, ...current];
      });
      setLoadState("success");
      setSuccessMessage(t("feedback.saveSuccess"));
      resetForm();
    } catch {
      setErrorMessage(t("feedback.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm(t("actions.confirmDelete"))) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await serviceOpsSettingsService.deleteWorkflowTransition(id);
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      setLoadState(next.length === 0 ? "empty" : "success");
      setSuccessMessage(t("feedback.deleteSuccess"));
    } catch {
      setErrorMessage(t("feedback.deleteError"));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{t("title")}</Typography>
      <Typography color="text.secondary" variant="body2">{t("description")}</Typography>

      {loadState === "loading" ? <Alert severity="info">{t("states.loading")}</Alert> : null}
      {loadState === "empty" ? <Alert severity="info">{t("states.empty")}</Alert> : null}
      {loadState === "error" ? (
        <Alert action={<Button color="inherit" onClick={() => void loadItems()} size="small">{t("actions.retry")}</Button>} severity="error">
          {errorMessage ?? t("feedback.loadError")}
        </Alert>
      ) : null}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage && loadState !== "error" ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">{form.id ? t("form.editTitle") : t("form.createTitle")}</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  error={hasServiceTypeCodeError}
                  fullWidth
                  helperText={hasServiceTypeCodeError ? t("form.validation.serviceTypeCodeRequired") : " "}
                  label={t("form.fields.serviceTypeCode")}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, serviceTypeCode: event.target.value.toUpperCase() }))
                  }
                  value={form.serviceTypeCode}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  error={hasStatusError}
                  fullWidth
                  helperText={hasStatusError ? t("form.validation.statusRequired") : " "}
                  label={t("form.fields.fromStatus")}
                  onChange={(event) => setForm((current) => ({ ...current, fromStatus: event.target.value.toUpperCase() }))}
                  value={form.fromStatus}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  error={hasStatusError}
                  fullWidth
                  helperText={hasStatusError ? t("form.validation.statusRequired") : " "}
                  label={t("form.fields.toStatus")}
                  onChange={(event) => setForm((current) => ({ ...current, toStatus: event.target.value.toUpperCase() }))}
                  value={form.toStatus}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  error={hasAllowedRolesError}
                  fullWidth
                  helperText={hasAllowedRolesError ? t("form.validation.allowedRolesRequired") : " "}
                  label={t("form.fields.allowedRoles")}
                  onChange={(event) => setForm((current) => ({ ...current, allowedRoles: event.target.value }))}
                  placeholder={t("form.placeholders.allowedRoles")}
                  value={form.allowedRoles}
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1}>
              <Button disabled={!canSubmit || isSubmitting} onClick={() => void onSave()} variant="contained">
                {form.id ? t("actions.update") : t("actions.create")}
              </Button>
              <Button disabled={isSubmitting} onClick={resetForm} variant="outlined">
                {t("actions.clear")}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h6">{t("table.title")}</Typography>
          {items.length === 0 ? (
            <Typography color="text.secondary" variant="body2">{t("states.empty")}</Typography>
          ) : (
            <Stack spacing={1}>
              {items.map((item) => (
                <Box key={item.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                  <Stack alignItems="center" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography variant="body2">
                      {item.serviceTypeCode}: {item.fromStatus} → {item.toStatus} ({item.allowedRoles.join(", ")})
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        onClick={() =>
                          setForm({
                            id: item.id,
                            serviceTypeCode: item.serviceTypeCode,
                            fromStatus: item.fromStatus,
                            toStatus: item.toStatus,
                            allowedRoles: item.allowedRoles.join(", "),
                          })
                        }
                        size="small"
                        variant="text"
                      >
                        {t("actions.edit")}
                      </Button>
                      <Button color="error" onClick={() => void onDelete(item.id)} size="small" variant="text">
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
  );
}
