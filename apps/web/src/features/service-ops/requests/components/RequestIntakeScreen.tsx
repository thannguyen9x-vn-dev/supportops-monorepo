"use client";

import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
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
import { SelectOptionField, TextAreaField, TextInputField } from "@supportops/ui-form";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState, type ChangeEventHandler } from "react";
import { Controller, useForm } from "react-hook-form";

import styles from "./request-intake-screen.module.css";

type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type RequestIntakeFormValues = {
  serviceType: string;
  title: string;
  description: string;
  location: string;
  priority: RequestPriority;
  assetId: string;
  impactLevel: string;
  urgency: string;
  preferredContact: string;
};

type LocalAttachment = {
  id: string;
  fileName: string;
  sizeLabel: string;
};

const DEFAULT_VALUES: RequestIntakeFormValues = {
  serviceType: "HVAC",
  title: "",
  description:
    "The main AC unit in the server room is making loud noises and the temperature is rising rapidly.",
  location: "HQ-FLOOR-2-SERVER-ROOM-B",
  priority: "HIGH",
  assetId: "SRV-AC-02",
  impactLevel: "DEPARTMENT",
  urgency: "HIGH",
  preferredContact: "Slack @john.doe",
};

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

export function RequestIntakeScreen() {
  const t = useTranslations("pages.serviceOps.requestCreateForm");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([
    { id: "sample-1", fileName: "temperature_alert.png", sizeLabel: "1.2MB" },
  ]);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RequestIntakeFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const watched = watch();

  const priorityOptions = useMemo(
    () => [
      { label: t("priority.low"), value: "LOW" as const },
      { label: t("priority.medium"), value: "MEDIUM" as const },
      { label: t("priority.high"), value: "HIGH" as const },
      { label: t("priority.critical"), value: "CRITICAL" as const },
    ],
    [t],
  );

  const onSubmit = async (values: RequestIntakeFormValues) => {
    setSubmitMessage(`${t("submitSuccess")} (${values.priority})`);
  };

  const onSaveDraft = () => {
    setSubmitMessage(t("draftSaved"));
  };

  const onPickFiles = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected: ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const next = files.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      fileName: file.name,
      sizeLabel: formatFileSize(file.size),
    }));

    setAttachments((current) => [...current, ...next].slice(0, 5));
    event.currentTarget.value = "";
  };

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
                <CardContent>
                  <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)} spacing={2.5}>
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
                      rules={{ required: t("validation.required") }}
                    />

                    <TextInputField
                      control={control}
                      helperText={errors.title ? t("validation.titleRequired") : t("hints.title")}
                      label={t("fields.title")}
                      name="title"
                      rules={{ required: t("validation.titleRequired") }}
                      startIcon={errors.title ? <ErrorOutlineIcon color="error" fontSize="small" /> : undefined}
                    />

                    <TextAreaField
                      control={control}
                      label={t("fields.description")}
                      minRows={4}
                      name="description"
                      rules={{ required: t("validation.required") }}
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
                      rules={{ required: t("validation.required") }}
                    />

                    <FormControl>
                      <FormLabel>{t("fields.priority")}</FormLabel>
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
                                value={option.value}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                    </FormControl>

                    <Divider />

                    <Typography variant="h6">{t("sections.additional")}</Typography>

                    <TextInputField control={control} label={t("fields.assetId")} name="assetId" />

                    <Box>
                      <Typography sx={{ mb: 1, fontWeight: 600 }} variant="body2">
                        {t("fields.attachments")}
                      </Typography>

                      <button className={styles.dropzone} onClick={onPickFiles} type="button">
                        <CloudUploadOutlinedIcon color="action" />
                        <Typography color="text.secondary" variant="body2">
                          {t("attachments.dropzone")}
                        </Typography>
                      </button>

                      <input
                        className={styles.hiddenInput}
                        multiple
                        onChange={onFilesSelected}
                        ref={fileInputRef}
                        type="file"
                      />

                      <Stack spacing={1} sx={{ mt: 1.2 }}>
                        {attachments.map((file) => (
                          <Box className={styles.fileRow} key={file.id}>
                            <Stack alignItems="center" direction="row" spacing={1}>
                              <AttachFileOutlinedIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {file.fileName} ({file.sizeLabel})
                              </Typography>
                            </Stack>
                            <Button
                              color="inherit"
                              onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}
                              size="small"
                              startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                              variant="text"
                            >
                              {t("attachments.remove")}
                            </Button>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

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
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextInputField
                          control={control}
                          label={t("fields.preferredContact")}
                          name="preferredContact"
                        />
                      </Grid>
                    </Grid>

                    <Divider />

                    <Stack direction="row" spacing={1.5}>
                      <Button disabled={isSubmitting} onClick={onSaveDraft} variant="outlined">
                        {t("actions.saveDraft")}
                      </Button>
                      <Button disabled={isSubmitting} type="submit" variant="contained">
                        {t("actions.submit")}
                      </Button>
                    </Stack>

                    {submitMessage ? <Alert severity="success">{submitMessage}</Alert> : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
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
                      <Typography variant="body2">{watched.serviceType}</Typography>
                    </Box>

                    <Box className={styles.summaryRow}>
                      <Typography color="text.secondary" variant="body2">
                        {t("summary.priority")}
                      </Typography>
                      <Typography variant="body2">{watched.priority}</Typography>
                    </Box>

                    <Box className={styles.summaryRow}>
                      <Typography color="text.secondary" variant="body2">
                        {t("summary.location")}
                      </Typography>
                      <Typography className={styles.summaryValue} variant="body2">
                        {watched.location}
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
