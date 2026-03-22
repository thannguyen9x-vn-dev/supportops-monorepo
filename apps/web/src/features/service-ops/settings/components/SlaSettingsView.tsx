"use client";

import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api";

import { serviceOpsSettingsService } from "../services/service-ops-settings.service";
import type { SettingsLoadState, SlaPolicySetting } from "../types";

const EMPTY_FORM = {
  id: "",
  serviceTypeCode: "",
  responseMinutes: "30",
  resolutionMinutes: "480",
  escalationAfterMinutes: "60",
};

export function SlaSettingsView() {
  const t = useTranslations("pages.serviceOps.settings.sla");
  const [loadState, setLoadState] = useState<SettingsLoadState>("loading");
  const [items, setItems] = useState<SlaPolicySetting[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const normalizedServiceTypeCode = form.serviceTypeCode.trim().toUpperCase();
  const responseMinutes = Number(form.responseMinutes);
  const resolutionMinutes = Number(form.resolutionMinutes);
  const escalationAfterMinutes = Number(form.escalationAfterMinutes);
  const hasServiceTypeCodeError = normalizedServiceTypeCode.length === 0;
  const hasResponseMinutesError = !Number.isFinite(responseMinutes) || responseMinutes <= 0;
  const hasResolutionMinutesError = !Number.isFinite(resolutionMinutes) || resolutionMinutes <= 0;
  const hasEscalationMinutesError = !Number.isFinite(escalationAfterMinutes) || escalationAfterMinutes <= 0;

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

  const canSubmit = useMemo(
    () =>
      !hasServiceTypeCodeError &&
      !hasResponseMinutesError &&
      !hasResolutionMinutesError &&
      !hasEscalationMinutesError,
    [hasEscalationMinutesError, hasResolutionMinutesError, hasResponseMinutesError, hasServiceTypeCodeError],
  );

  const resetForm = () => setForm(EMPTY_FORM);

  const onSave = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const saved = await serviceOpsSettingsService.saveSlaPolicy({
        id: form.id || undefined,
        serviceTypeCode: normalizedServiceTypeCode,
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
      await serviceOpsSettingsService.deleteSlaPolicy(id);
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

      {loadState === "permissionDenied" ? <Alert severity="warning">{t("states.permissionDenied")}</Alert> : null}
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
                  error={hasResponseMinutesError}
                  fullWidth
                  helperText={hasResponseMinutesError ? t("form.validation.minutesPositive") : " "}
                  inputProps={{ min: 1 }}
                  label={t("form.fields.responseMinutes")}
                  onChange={(event) => setForm((current) => ({ ...current, responseMinutes: event.target.value }))}
                  type="number"
                  value={form.responseMinutes}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  error={hasResolutionMinutesError}
                  fullWidth
                  helperText={hasResolutionMinutesError ? t("form.validation.minutesPositive") : " "}
                  inputProps={{ min: 1 }}
                  label={t("form.fields.resolutionMinutes")}
                  onChange={(event) => setForm((current) => ({ ...current, resolutionMinutes: event.target.value }))}
                  type="number"
                  value={form.resolutionMinutes}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  error={hasEscalationMinutesError}
                  fullWidth
                  helperText={hasEscalationMinutesError ? t("form.validation.minutesPositive") : " "}
                  inputProps={{ min: 1 }}
                  label={t("form.fields.escalationAfterMinutes")}
                  onChange={(event) => setForm((current) => ({ ...current, escalationAfterMinutes: event.target.value }))}
                  type="number"
                  value={form.escalationAfterMinutes}
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
                <Box
                  key={item.id}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}
                >
                  <Stack alignItems="center" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography variant="body2">
                      {item.serviceTypeCode} - {item.responseMinutes}/{item.resolutionMinutes}/{item.escalationAfterMinutes}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        onClick={() =>
                          setForm({
                            id: item.id,
                            serviceTypeCode: item.serviceTypeCode,
                            responseMinutes: String(item.responseMinutes),
                            resolutionMinutes: String(item.resolutionMinutes),
                            escalationAfterMinutes: String(item.escalationAfterMinutes),
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
