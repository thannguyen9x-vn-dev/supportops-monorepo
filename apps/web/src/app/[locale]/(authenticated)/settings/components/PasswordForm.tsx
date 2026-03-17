"use client";

import { useTranslations } from "next-intl";
import { Button } from "@mui/material";
import { useWatch, type Control, type UseFormHandleSubmit } from "react-hook-form";

import { TextInputField } from "@supportops/ui-form";

import { PasswordRequirementChecklist } from "@/components/password/PasswordRequirementChecklist";
import { buildPasswordRules, getPasswordRequirementState } from "@/lib/validation/passwordPolicy";

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
  const newPassword = useWatch({ control, name: "newPassword" });
  const requirements = getPasswordRequirementState(newPassword ?? "");

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
          rules={buildPasswordRules<PasswordFormValues, "newPassword">({
            required: t("validation.required"),
            min: t("validation.passwordMin"),
            max: t("validation.passwordMax"),
            format: t("validation.passwordFormat")
          })}
        />
        <TextInputField
          control={control}
          label={t("password.confirmNewPassword")}
          name="confirmNewPassword"
          placeholder={t("password.placeholders.confirmNewPassword")}
          type="password"
          rules={{
            required: t("validation.required"),
            validate: (value: string) =>
              value === (newPassword ?? "") || t("validation.passwordMismatch"),
          }}
        />

        <div className={styles.passwordRequirements}>
          <h4 className={styles.passwordRequirementsTitle}>{t("password.requirements.title")}</h4>
          <p className={styles.passwordRequirementsDescription}>{t("password.requirements.description")}</p>
          <PasswordRequirementChecklist
            className={styles.passwordRequirementsList}
            items={[
              {
                key: "minLength",
                label: t("password.requirements.minLength"),
                met: requirements.minLength
              },
              {
                key: "lowercase",
                label: t("password.requirements.lowercase"),
                met: requirements.lowercase
              },
              {
                key: "uppercase",
                label: t("password.requirements.uppercase"),
                met: requirements.uppercase
              },
              {
                key: "number",
                label: t("password.requirements.number"),
                met: requirements.number
              },
              {
                key: "specialCharacter",
                label: t("password.requirements.specialCharacter"),
                met: requirements.specialCharacter
              }
            ]}
          />
        </div>

        <div className={styles.formActions}>
          <Button size="medium" disabled={submitState === "saving"} type="submit" variant="contained">
            {submitState === "saving" ? t("action.saving") : t("action.update")}
          </Button>
        </div>
      </form>
    </section>
  );
}
