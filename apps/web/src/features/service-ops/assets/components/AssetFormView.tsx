"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { SelectDateField, SelectOptionField, TextAreaField, TextInputField } from "@supportops/ui-form";
import type { Asset, AssetStatus, AssetType } from "@supportops/types";
import { ASSET_STATUSES } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

export const ASSET_FORM_ID = "asset-form";

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

type AssetFormCreateProps = {
  mode: "create";
  modal?: boolean;
  onSuccess?: (createdAsset: Asset) => void;
};

type AssetFormEditProps = {
  mode: "edit";
  assetId: string;
  modal?: boolean;
};

type AssetFormViewProps = AssetFormCreateProps | AssetFormEditProps;

export function AssetFormView(props: AssetFormViewProps) {
  const t = useTranslations("pages.serviceOps.assets.form");
  const tList = useTranslations("pages.serviceOps.assets.list");
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
    formState: { isSubmitting },
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
        if (props.modal) {
          props.onSuccess?.(data);
        } else {
          router.push(`/${locale}/assets/${data.id}`);
        }
      } else {
        await assetService.update(props.assetId, payload);
        toast.success(t("feedback.updateSuccess"));
        if (!props.modal) {
          router.push(`/${locale}/assets/${props.assetId}`);
        }
      }
    } catch {
      const msg = props.mode === "create" ? t("feedback.createError") : t("feedback.updateError");
      setSubmitError(msg);
    }
  };

  const title = props.mode === "create" ? t("createTitle") : t("editTitle");
  const showPageChrome = !props.modal;
  const backHref =
    `/${locale}/assets/list`;

  if (loadingAsset) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formContent = (
    <Stack
      component="form"
      id={ASSET_FORM_ID}
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
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.assetCode")}
            name="assetCode"
            placeholder={t("placeholders.assetCode")}
            rules={{ required: t("validation.assetCodeRequired") }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.name")}
            name="name"
            placeholder={t("placeholders.name")}
            rules={{ required: t("validation.nameRequired") }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectOptionField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.assetType")}
            name="assetTypeId"
            options={assetTypes.map((at) => ({ value: at.id, label: at.name }))}
            placeholder={t("fields.assetType")}
            rules={{ required: t("validation.assetTypeRequired") }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.location")}
            name="locationId"
            placeholder={t("placeholders.location")}
            rules={{ required: t("validation.locationRequired") }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectOptionField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.status")}
            name="status"
            options={ASSET_STATUSES.map((status) => ({ value: status, label: tList(`statusLabels.${status}`) }))}
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
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.serialNumber")}
            name="serialNumber"
            placeholder={t("placeholders.serialNumber")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.model")}
            name="model"
            placeholder={t("placeholders.model")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.assignedDepartment")}
            name="assignedDepartment"
            placeholder={t("placeholders.assignedDepartment")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextInputField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.responsibleTeam")}
            name="responsibleTeam"
            placeholder={t("placeholders.responsibleTeam")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectDateField
            control={control}
            hideEmptyHelperText
            label={t("fields.installedAt")}
            locale={locale}
            name="installedAt"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextAreaField
            control={control}
            fullWidth
            hideEmptyHelperText
            label={t("fields.description")}
            minRows={3}
            name="description"
            placeholder={t("placeholders.description")}
          />
        </Grid>
      </Grid>

            {submitError && <Alert severity="error">{submitError}</Alert>}

      {!props.modal ? (
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
      ) : null}
    </Stack>
  );

  return (
    <Box sx={showPageChrome ? { maxWidth: 860, mx: "auto", p: { xs: 2, md: 3 } } : undefined}>
      {showPageChrome ? (
        <Typography gutterBottom variant="h5">
          {title}
        </Typography>
      ) : null}

      {showPageChrome ? (
        <Card variant="outlined">
          <CardContent>{formContent}</CardContent>
        </Card>
      ) : formContent}
    </Box>
  );
}
