"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@mui/material";
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode as PhoneLibCountryCode
} from "libphonenumber-js";
import type { Control, UseFormHandleSubmit } from "react-hook-form";

import { PhoneNumberField, SelectDateField, SelectOptionField, TextInputField } from "@supportops/ui-form";
import type { PhoneCountryOption } from "@supportops/ui-form";

import { createCountryOptions } from "@/shared/constants/countries";

import type { ProfileFormValues, SubmitState } from "../settings.types";

import styles from "../settings.module.css";

type ProfileFormProps = {
  control: Control<ProfileFormValues>;
  handleSubmit: UseFormHandleSubmit<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  submitState: SubmitState;
};

function toFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export function ProfileForm({ control, handleSubmit, onSubmit, submitState }: ProfileFormProps) {
  const t = useTranslations("pages.settings");
  const locale = useLocale();

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

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t("profile.generalInfoTitle")}</h3>
      </div>

      <form className={styles.formGrid} onSubmit={handleSubmit(onSubmit)}>
        <TextInputField
          control={control}
          label={t("profile.fields.firstName")}
          name="firstName"
          placeholder="Thomas"
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

        <TextInputField
          control={control}
          label={t("profile.fields.lastName")}
          name="lastName"
          placeholder="Lean"
          rules={{ required: t("validation.required") }}
        />

        <TextInputField
          control={control}
          label={t("profile.fields.organization")}
          name="organization"
          placeholder="Themesberg"
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

        <SelectOptionField
          control={control}
          label={t("profile.fields.country")}
          name="country"
          noOptionsText={t("countries.noOptions")}
          options={countryOptions}
          searchable
          searchInPopup
          searchPlaceholder={t("countries.searchPlaceholder")}
        />

        <TextInputField
          control={control}
          inputType="email"
          label={t("profile.fields.email")}
          name="email"
          placeholder="name@example.com"
          rules={{
            required: t("validation.required"),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t("validation.invalidEmail"),
            },
          }}
        />
        <TextInputField
          control={control}
          label={t("profile.fields.zipCode")}
          name="zipCode"
          placeholder="123456"
        />

        <TextInputField
          control={control}
          label={t("profile.fields.department")}
          name="department"
          placeholder="Marketing"
        />
        <TextInputField
          control={control}
          label={t("profile.fields.city")}
          name="city"
          placeholder="e.g. San Francisco"
        />

        <TextInputField
          className={styles.fullRow}
          control={control}
          label={t("profile.fields.address")}
          name="address"
          placeholder="e.g. California"
        />

        <div className={styles.formActions}>
          <Button disabled={submitState === "saving"} size="medium" type="submit" variant="contained">
            {submitState === "saving" ? t("action.saving") : t("action.update")}
          </Button>
        </div>
      </form>
    </section>
  );
}
