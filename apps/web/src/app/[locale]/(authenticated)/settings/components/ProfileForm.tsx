"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Divider } from "@mui/material";
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode as PhoneLibCountryCode
} from "libphonenumber-js";
import { useWatch, type Control, type UseFormHandleSubmit } from "react-hook-form";

import { PhoneNumberField, SelectDateField, SelectOptionField, TextInputField } from "@supportops/ui-form";
import type { PhoneCountryOption } from "@supportops/ui-form";

import { createCountryOptions } from "@/shared/constants/countries";
import { buildDepartmentOptions } from "@/shared/constants/departments";

import type { ProfileFormValues, SubmitState } from "../settings.types";

import styles from "../settings.module.css";

type ProfileFormProps = {
  canEditDepartment: boolean;
  control: Control<ProfileFormValues>;
  handleSubmit: UseFormHandleSubmit<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  systemRoleLabel: string;
  submitState: SubmitState;
};

function toFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export function ProfileForm({ canEditDepartment, control, handleSubmit, onSubmit, systemRoleLabel, submitState }: ProfileFormProps) {
  const t = useTranslations("pages.settings");
  const locale = useLocale();
  const departmentValue = useWatch({ control, name: "department" });
  const systemRoleValue = useWatch({ control, name: "systemRole" });

  const countryOptions = useMemo(() => createCountryOptions({ locale }), [locale]);
  const phoneCountryOptions = useMemo<PhoneCountryOption<ProfileFormValues["phoneCountry"]>[]>(
    () =>
      countryOptions.flatMap((option) => {
          try {
            const flag = toFlagEmoji(option.code);
            const dialingCode = String(getCountryCallingCode(option.code as PhoneLibCountryCode));
            return [{
              flag,
              countryName: option.label,
              dialingCode,
              label: `${flag} (+${dialingCode}) ${option.label}`,
              value: option.code,
            }];
          } catch {
            return [];
          }
        }),
    [countryOptions],
  );
  const departmentOptions = useMemo(
    () => buildDepartmentOptions(departmentValue),
    [departmentValue],
  );
  const systemRoleOptions = useMemo(
    () => [{ label: systemRoleLabel, value: systemRoleValue || systemRoleLabel }],
    [systemRoleLabel, systemRoleValue],
  );

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t("profile.generalInfoTitle")}</h3>
        <Button
          className={styles.sectionAction}
          disabled={submitState === "saving"}
          size="medium"
          type="submit"
          variant="contained"
          form="general-information-form"
        >
          {submitState === "saving" ? t("action.saving") : t("action.saveChanges")}
        </Button>
      </div>

      <form id="general-information-form" className={styles.formGrid} onSubmit={handleSubmit(onSubmit)}>
        <TextInputField
          control={control}
          label={t("profile.fields.firstName")}
          name="firstName"
          placeholder={t("profile.placeholders.firstName")}
          rules={{ required: t("validation.required") }}
        />
        <TextInputField
          control={control}
          label={t("profile.fields.lastName")}
          name="lastName"
          placeholder={t("profile.placeholders.lastName")}
          rules={{ required: t("validation.required") }}
        />
        <SelectDateField
          control={control}
          label={t("profile.fields.birthday")}
          locale={locale}
          name="birthday"
          placeholder={t("profile.placeholders.selectDate")}
          texts={{
            monthLabel: t("profile.datePicker.month"),
            yearLabel: t("profile.datePicker.year"),
            todayLabel: t("profile.datePicker.today"),
            clearLabel: t("profile.datePicker.clear"),
            keyboardHint: t("profile.datePicker.keyboardHint"),
            selectMonthAriaLabel: t("profile.datePicker.selectMonthAriaLabel"),
            selectYearAriaLabel: t("profile.datePicker.selectYearAriaLabel"),
          }}
        />

        <PhoneNumberField
          control={control}
          countryAriaLabel={t("profile.fields.phoneCountryCode")}
          countryName="phoneCountry"
          countryOptions={phoneCountryOptions}
          label={t("profile.fields.phoneNumber")}
          noOptionsText={t("countries.noOptions")}
          phoneAriaLabel={t("profile.fields.phoneNumber")}
          phoneName="phoneNumber"
          phonePlaceholder={t("profile.placeholders.phoneNumber")}
          phoneRules={{
            validate: (value, formValues) => {
              const trimmedValue = value.trim();
              if (!trimmedValue) {
                return true;
              }

              const parsed = parsePhoneNumberFromString(
                trimmedValue,
                formValues.phoneCountry as PhoneLibCountryCode,
              );

              if (!parsed?.isValid()) {
                return t("validation.invalidPhoneNumber");
              }

              return true;
            },
          }}
          popupWidthPx={340}
          searchPlaceholder={t("countries.searchPlaceholder")}
        />

        <TextInputField
          control={control}
          disabled
          inputType="email"
          label={t("profile.fields.email")}
          name="email"
          placeholder={t("profile.placeholders.email")}
          rules={{
            required: t("validation.required"),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t("validation.invalidEmail"),
            },
          }}
        />
        <SelectOptionField
          control={control}
          disabled
          hideEmptyHelperText
          label={t("profile.fields.systemRole")}
          name="systemRole"
          options={systemRoleOptions}
        />

        <SelectOptionField
          control={control}
          disabled={!canEditDepartment}
          helperText={!canEditDepartment ? t("profile.departmentLockedHint") : undefined}
          hideEmptyHelperText={canEditDepartment}
          label={t("profile.fields.department")}
          name="department"
          noOptionsText={t("countries.noOptions")}
          options={departmentOptions}
        />
        <TextInputField
          control={control}
          label={t("profile.fields.location")}
          name="city"
          placeholder={t("profile.placeholders.location")}
        />
        <div className={styles.fullRow}>
          <Divider sx={{ mb: 2 }} />
          <p className={styles.aboutWork}>
            <strong>{t("profile.aboutWorkLabel")}</strong> {t("profile.aboutWorkValue")}
          </p>
        </div>
      </form>
    </section>
  );
}
