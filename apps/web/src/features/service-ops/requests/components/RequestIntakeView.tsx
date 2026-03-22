"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import type { CreateServiceRequestInput, ServiceRequest } from "@supportops/types";
import { DEFAULT_FILE_UPLOAD_CONFIG } from "@supportops/types";
import { SelectOptionField, TextAreaField, TextInputField } from "@supportops/ui-form";
import { FileUploadField, type UploadedFileInfo } from "@supportops/ui-file-upload";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";

import styles from "./request-intake-screen.module.css";
import { requestService } from "../services/request.service";
import { fileService } from "@/features/files/services/file.service";
import { useToast } from "@/features/common/toast/useToast";

import { ApiError } from "@/lib/api";

type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type RequestIntakeFormValues = {
  serviceType: string;
  title: string;
  description: string;
  location: string;
  priority: RequestPriority;
  assetId: string;
  impactLevel: "" | "DEPARTMENT" | "TEAM" | "ORGANIZATION";
  urgency: "" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  preferredContact: string;
};

type RequestSubmitMode = "draft" | "submit";

export const REQUEST_INTAKE_FORM_ID = "create-request-form";

type RequestIntakeViewProps = {
  modal?: boolean;
  onSuccess?: (createdRequest: ServiceRequest) => void;
};

const DEFAULT_VALUES: RequestIntakeFormValues = {
  serviceType: "",
  title: "",
  description: "",
  location: "",
  priority: "HIGH",
  assetId: "",
  impactLevel: "",
  urgency: "",
  preferredContact: "",
};


function RequestSummaryCard({ control }: { control: Control<RequestIntakeFormValues> }) {
  const t = useTranslations("pages.serviceOps.requestCreateForm");
  const [serviceType, priority, location] = useWatch({
    control,
    name: ["serviceType", "priority", "location"],
  });

  return (
    <Card className={styles.summaryCard} variant="outlined">
      <CardContent>
        <Typography gutterBottom variant="h6">
          {t("summary.title")}
        </Typography>

        <Stack spacing={1.25}>
          <Box className={styles.summaryRow}>
            <Typography color="text.secondary" variant="body2">
              {t("summary.serviceType")}
            </Typography>
            <Typography variant="body2">{serviceType}</Typography>
          </Box>

          <Box className={styles.summaryRow}>
            <Typography color="text.secondary" variant="body2">
              {t("summary.priority")}
            </Typography>
            <Typography variant="body2">{priority}</Typography>
          </Box>

          <Box className={styles.summaryRow}>
            <Typography color="text.secondary" variant="body2">
              {t("summary.location")}
            </Typography>
            <Typography className={styles.summaryValue} variant="body2">
              {location}
            </Typography>
          </Box>

          <Box className={styles.slaBox}>
            <Typography fontWeight={700} variant="body2">
              {t("summary.expectedSla")}
            </Typography>
            <Typography variant="body1">4 {t("summary.hours")}</Typography>
          </Box>

          <Typography color="text.secondary" variant="body2">
            {t("summary.visibility")}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function RequestIntakeView({ modal = false, onSuccess }: RequestIntakeViewProps = {}) {
  const t = useTranslations("pages.serviceOps.requestCreateForm");
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "en";
  const toast = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestIntakeFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const priorityOptions = useMemo(
    () => [
      { label: t("priority.low"), value: "LOW" as const },
      { label: t("priority.medium"), value: "MEDIUM" as const },
      { label: t("priority.high"), value: "HIGH" as const },
      { label: t("priority.critical"), value: "CRITICAL" as const },
    ],
    [t],
  );

  const handleFileUpload = useCallback(
    async (
      file: { file: File },
      onProgress: (event: { progress: number }) => void,
    ): Promise<UploadedFileInfo> => {
      const files = [file.file];
      onProgress({ progress: 20 });

      const uploadedFiles = await fileService.uploadFiles(files);
      const uploadedFile = uploadedFiles[0];
      if (!uploadedFile) {
        throw new Error(t("errors.uploadNoFileReturned"));
      }
      onProgress({ progress: 100 });
      return uploadedFile;
    },
    [t],
  );

  const submitRequest = async (values: RequestIntakeFormValues, mode: RequestSubmitMode) => {
    setSubmitMessage(null);
    setSubmitError(null);

    const payload: CreateServiceRequestInput = {
      mode,
      serviceTypeCode: values.serviceType,
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location,
      priority: values.priority === "CRITICAL" ? "URGENT" : values.priority,
      assetId: values.assetId.trim() || undefined,
      impactLevel:
        values.impactLevel === "DEPARTMENT"
          ? "LOW"
          : values.impactLevel === "TEAM"
            ? "MEDIUM"
            : values.impactLevel === "ORGANIZATION"
              ? "HIGH"
              : undefined,
      urgency:
        values.urgency === "CRITICAL"
          ? "CRITICAL"
          : values.urgency === ""
            ? undefined
            : values.urgency,
      sourceChannel: "WEB",
      preferredContact: values.preferredContact.trim() || undefined,
      attachmentFileIds: uploadedFiles.map((f) => f.id),
    };

    try {
      const { data } = await requestService.create(payload);
      const successMessage = mode === "draft" ? t("draftSaved") : t("submitSuccess");
      toast.success(successMessage);
      setSubmitMessage(successMessage);

      if (modal) {
        onSuccess?.(data);
        return;
      }

      if (mode === "submit") {
        router.push(`/${locale}/requests/${data.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.error.message || t(mode === "draft" ? "errors.draftFailed" : "errors.submitFailed"));
        return;
      }

      setSubmitError(t(mode === "draft" ? "errors.draftFailed" : "errors.submitFailed"));
    }
  };

  const onSubmit = handleSubmit(async (values) => submitRequest(values, "submit"));
  const onSaveDraft = handleSubmit(async (values) => submitRequest(values, "draft"));

  const formContent = (
    <Stack component="form" id={modal ? REQUEST_INTAKE_FORM_ID : undefined} noValidate onSubmit={onSubmit} spacing={2.5}>
      <SelectOptionField
        control={control}
        disableClearable
        label={t("fields.serviceType")}
        name="serviceType"
        options={[
          { label: "HVAC / Climate Control", value: "HVAC" },
          { label: "Lighting", value: "LIGHTING" },
          { label: "Water Leakage", value: "WATER" },
          { label: "Access Card", value: "ACCESS" },
        ]}
        placeholder={t("placeholders.select")}
        rules={{ required: t("validation.required") }}
      />

      <TextInputField
        control={control}
        helperText={errors.title ? errors.title.message : t("hints.title")}
        label={t("fields.title")}
        name="title"
        placeholder={t("placeholders.title")}
        rules={{
          required: t("validation.titleRequired"),
          validate: (value) => value.trim().length > 0 || t("validation.titleRequired"),
          maxLength: {
            value: 255,
            message: t("validation.titleTooLong"),
          },
        }}
      />

      <TextAreaField
        control={control}
        helperText={errors.description ? errors.description.message : t("hints.description")}
        label={t("fields.description")}
        minRows={4}
        name="description"
        placeholder={t("placeholders.description")}
        rules={{
          required: t("validation.descriptionRequired"),
          validate: (value) => value.trim().length > 0 || t("validation.descriptionRequired"),
          maxLength: {
            value: 5000,
            message: t("validation.descriptionTooLong"),
          },
        }}
      />

      <SelectOptionField
        control={control}
        disableClearable
        label={t("fields.location")}
        name="location"
        options={[
          { label: "Headquarters - Floor 2 - Server Room B", value: "HQ-FLOOR-2-SERVER-ROOM-B" },
          { label: "Headquarters - Floor 5 - Meeting Room C", value: "HQ-FLOOR-5-MEETING-ROOM-C" },
          { label: "Branch Office - Ops Room", value: "BRANCH-OPS-ROOM" },
        ]}
        placeholder={t("placeholders.select")}
        rules={{ required: t("validation.required") }}
      />

      <FormControl>
        <FormLabel sx={{ color: "text.secondary" }}>{t("fields.priority")}</FormLabel>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <RadioGroup row {...field}>
              {priorityOptions.map((option) => (
                <FormControlLabel
                  control={<Radio size="small" />}
                  key={option.value}
                  label={option.label}
                  slotProps={{
                    typography: {
                      sx: { color: "text.primary" },
                    },
                  }}
                  value={option.value}
                />
              ))}
            </RadioGroup>
          )}
        />
      </FormControl>

      <Divider />

      <Typography variant="h6">{t("sections.additional")}</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SelectOptionField
            control={control}
            disableClearable
            label={t("fields.impactLevel")}
            name="impactLevel"
            options={[
              { label: t("impact.department"), value: "DEPARTMENT" },
              { label: t("impact.team"), value: "TEAM" },
              { label: t("impact.organization"), value: "ORGANIZATION" },
            ]}
            placeholder={t("placeholders.select")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SelectOptionField
            control={control}
            disableClearable
            label={t("fields.urgency")}
            name="urgency"
            options={[
              { label: t("urgency.low"), value: "LOW" },
              { label: t("urgency.medium"), value: "MEDIUM" },
              { label: t("urgency.high"), value: "HIGH" },
            ]}
            placeholder={t("placeholders.select")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextInputField
            control={control}
            label={t("fields.preferredContact")}
            name="preferredContact"
            placeholder={t("placeholders.preferredContact")}
          />
        </Grid>
      </Grid>

      <TextInputField
        control={control}
        label={t("fields.assetId")}
        name="assetId"
        placeholder={t("placeholders.assetId")}
      />

      <FileUploadField
        accept={DEFAULT_FILE_UPLOAD_CONFIG.accept}
        acceptedMimeTypes={DEFAULT_FILE_UPLOAD_CONFIG.allowedMimeTypes}
        disabled={isSubmitting}
        helperText={t("hints.attachments")}
        label={t("fields.attachments")}
        maxFiles={DEFAULT_FILE_UPLOAD_CONFIG.maxFiles}
        maxFileSizeBytes={DEFAULT_FILE_UPLOAD_CONFIG.maxFileSizeBytes}
        onChange={setUploadedFiles}
        onUploadError={() => {
          setUploadError(t("errors.uploadFailed"));
          toast.error(t("errors.uploadFailed"));
        }}
        onUploadSuccess={() => setUploadError(null)}
        uploadFn={handleFileUpload}
        value={uploadedFiles}
      />

      {!modal ? (
        <>
          <Divider />
          <Stack direction="row" spacing={1.5}>
            <Button disabled={isSubmitting} onClick={() => void onSaveDraft()} type="button" variant="outlined">
              {t("actions.saveDraft")}
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {t("actions.submit")}
            </Button>
          </Stack>
          {submitMessage ? <Alert severity="success">{submitMessage}</Alert> : null}
        </>
      ) : null}
      {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
      {submitError ? <Alert severity="error">{submitError}</Alert> : null}
    </Stack>
  );

  if (modal) {
    return formContent;
  }

  return (
    <Box className={styles.pageWrap}>
      <Typography className={styles.kicker} variant="body2">
        {t("kicker")}
      </Typography>

      <Card className={styles.surface} variant="outlined">
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography className={styles.pageTitle} variant="h4">
            {t("title")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card variant="outlined">
                <CardContent>{formContent}</CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <RequestSummaryCard control={control} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
