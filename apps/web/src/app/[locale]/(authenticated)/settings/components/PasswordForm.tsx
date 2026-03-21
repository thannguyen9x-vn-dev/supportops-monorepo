"use client";

import { useTranslations } from "next-intl";
import { Button } from "@mui/material";
import { type Control, type UseFormHandleSubmit } from "react-hook-form";

import { TextInputField } from "@supportops/ui-form";

import type { PasswordFormValues, SubmitState } from "../settings.types";

import styles from "../settings.module.css";

type PasswordFormProps = {
  control: Control<PasswordFormValues>;
  handleSubmit: UseFormHandleSubmit<PasswordFormValues>;
  onSubmit: (values: PasswordFormValues) => Promise<void>;
  submitState: SubmitState;
};

export function PasswordForm({ control, handleSubmit, onSubmit, submitState }: PasswordFormProps) {
  const t = useTranslations("pages.settings");

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t("password.title")}</h3>
      </div>

      <form className={styles.passwordGrid} onSubmit={handleSubmit(onSubmit)}>
        <TextInputField
          control={control}
          label={t("password.currentPassword")}
          name="currentPassword"
          placeholder={t("password.placeholders.currentPassword")}
          type="password"
          rules={{ required: t("validation.required") }}
        />
        <TextInputField
          control={control}
          label={t("password.newPassword")}
          name="newPassword"
          placeholder={t("password.placeholders.newPassword")}
          type="password"
          rules={{ required: t("validation.required") }}
        />
        <TextInputField
          control={control}
          label={t("password.confirmNewPassword")}
          name="confirmNewPassword"
          placeholder={t("password.placeholders.confirmNewPassword")}
          type="password"
          rules={{
            required: t("validation.required"),
            validate: (value: string, values: PasswordFormValues) =>
              value === (values.newPassword ?? "") || t("validation.passwordMismatch"),
          }}
        />

        <div className={styles.formActions}>
          <Button size="medium" disabled={submitState === "saving"} type="submit" variant="contained">
            {submitState === "saving" ? t("action.saving") : t("action.savePassword")}
          </Button>
        </div>
      </form>
    </section>
  );
}
