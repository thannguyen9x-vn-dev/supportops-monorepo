"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { AssetStatus, AssetType } from "@supportops/types";
import { ASSET_STATUSES } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { useToast } from "@/features/common/toast/useToast";
import { assetService } from "../services/asset.service";

type AssetFormValues = {
  assetCode: string;
  name: string;
  assetTypeId: string;
  locationId: string;
  status: AssetStatus;
  serialNumber: string;
  model: string;
  assignedDepartment: string;
  responsibleTeam: string;
  installedAt: string;
  description: string;
};

const DEFAULT_VALUES: AssetFormValues = {
  assetCode: "",
  name: "",
  assetTypeId: "",
  locationId: "",
  status: "ACTIVE",
  serialNumber: "",
  model: "",
  assignedDepartment: "",
  responsibleTeam: "",
  installedAt: "",
  description: "",
};

type AssetFormViewProps =
  | { mode: "create" }
  | { mode: "edit"; assetId: string };

export function AssetFormView(props: AssetFormViewProps) {
  const t = useTranslations("pages.serviceOps.assets.form");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const toast = useToast();

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loadingAsset, setLoadingAsset] = useState(props.mode === "edit");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssetFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  useEffect(() => {
    void assetService.listAssetTypes().then(({ data }) => setAssetTypes(data)).catch(() => {
      toast.error(t("feedback.loadTypesError"));
    });
  }, [t, toast]);

  const loadExistingAsset = useCallback(async (id: string) => {
    setLoadingAsset(true);
    try {
      const { data } = await assetService.getById(id);
      reset({
        assetCode: data.asset.assetCode,
        name: data.asset.name,
        assetTypeId: data.asset.assetTypeId,
        locationId: data.asset.locationId,
        status: data.asset.status,
        serialNumber: data.asset.serialNumber ?? "",
        model: data.asset.model ?? "",
        assignedDepartment: data.asset.assignedDepartment ?? "",
        responsibleTeam: data.asset.responsibleTeam ?? "",
        installedAt: data.asset.installedAt ? data.asset.installedAt.slice(0, 10) : "",
        description: data.asset.description ?? "",
      });
    } catch {
      toast.error(t("feedback.updateError"));
    } finally {
      setLoadingAsset(false);
    }
  }, [reset, t, toast]);

  useEffect(() => {
    if (props.mode === "edit") {
      void loadExistingAsset(props.assetId);
    }
  }, [props, loadExistingAsset]);

  const onSubmit = async (values: AssetFormValues) => {
    setSubmitError(null);
    const payload = {
      assetCode: values.assetCode.trim().toUpperCase(),
      name: values.name.trim(),
      assetTypeId: values.assetTypeId,
      locationId: values.locationId.trim(),
      status: values.status,
      serialNumber: values.serialNumber.trim() || undefined,
      model: values.model.trim() || undefined,
      assignedDepartment: values.assignedDepartment.trim() || undefined,
      responsibleTeam: values.responsibleTeam.trim() || undefined,
      installedAt: values.installedAt || undefined,
      description: values.description.trim() || undefined,
    };

    try {
      if (props.mode === "create") {
        const { data } = await assetService.create(payload);
        toast.success(t("feedback.createSuccess"));
        router.push(`/${locale}/assets/${data.id}`);
      } else {
        await assetService.update(props.assetId, payload);
        toast.success(t("feedback.updateSuccess"));
        router.push(`/${locale}/assets/${props.assetId}`);
      }
    } catch {
      const msg = props.mode === "create" ? t("feedback.createError") : t("feedback.updateError");
      setSubmitError(msg);
    }
  };

  const title = props.mode === "create" ? t("createTitle") : t("editTitle");
  const backHref =
    props.mode === "create"
      ? `/${locale}/assets/list`
      : `/${locale}/assets/${props.assetId}`;

  if (loadingAsset) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Typography gutterBottom variant="h5">
        {title}
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack
            component="form"
            noValidate
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            spacing={3}
          >
            {/* Basic Info */}
            <Typography fontWeight={600} variant="body1">
              {t("sections.basic")}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="assetCode"
                  rules={{ required: t("validation.assetCodeRequired") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      error={!!errors.assetCode}
                      fullWidth
                      helperText={errors.assetCode?.message}
                      label={t("fields.assetCode")}
                      placeholder={t("placeholders.assetCode")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: t("validation.nameRequired") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      error={!!errors.name}
                      fullWidth
                      helperText={errors.name?.message}
                      label={t("fields.name")}
                      placeholder={t("placeholders.name")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="assetTypeId"
                  rules={{ required: t("validation.assetTypeRequired") }}
                  render={({ field }) => (
                    <FormControl error={!!errors.assetTypeId} fullWidth size="small">
                      <InputLabel>{t("fields.assetType")}</InputLabel>
                      <Select {...field} label={t("fields.assetType")}>
                        {assetTypes.map((at) => (
                          <MenuItem key={at.id} value={at.id}>
                            {at.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.assetTypeId && (
                        <Typography color="error" variant="caption">
                          {errors.assetTypeId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="locationId"
                  rules={{ required: t("validation.locationRequired") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      error={!!errors.locationId}
                      fullWidth
                      helperText={errors.locationId?.message}
                      label={t("fields.location")}
                      placeholder={t("placeholders.location")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("fields.status")}</InputLabel>
                      <Select {...field} label={t("fields.status")}>
                        {ASSET_STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Operational Details */}
            <Typography fontWeight={600} variant="body1">
              {t("sections.operational")}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="serialNumber"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.serialNumber")}
                      placeholder={t("placeholders.serialNumber")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="model"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.model")}
                      placeholder={t("placeholders.model")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="assignedDepartment"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.assignedDepartment")}
                      placeholder={t("placeholders.assignedDepartment")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="responsibleTeam"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.responsibleTeam")}
                      placeholder={t("placeholders.responsibleTeam")}
                      size="small"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="installedAt"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      label={t("fields.installedAt")}
                      size="small"
                      type="date"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.description")}
                      minRows={3}
                      multiline
                      placeholder={t("placeholders.description")}
                      size="small"
                    />
                  )}
                />
              </Grid>
            </Grid>

            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Stack direction="row" spacing={1.5}>
              <Button
                disabled={isSubmitting}
                onClick={() => router.push(backHref)}
                variant="outlined"
              >
                {t("actions.cancel")}
              </Button>
              <Button disabled={isSubmitting} type="submit" variant="contained">
                {props.mode === "create" ? t("actions.create") : t("actions.save")}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
