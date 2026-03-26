// NOTE: Trang đăng ký tự do đã bị vô hiệu hóa.
// Dự án hiện tại chỉ hỗ trợ user được admin mời qua link invite (/invite/accept).
// Giữ code bên dưới để có thể kích hoạt lại nếu cần trong tương lai.

import { redirect } from "next/navigation";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/login`);
}

/*
'use client';

import EmailIcon from "@mui/icons-material/Email";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Alert, Button, Checkbox, FormControlLabel } from "@mui/material";
import { TextInputField } from "@supportops/ui-form";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api";
import { buildPasswordRules, getPasswordRequirementState } from "@/lib/validation/passwordPolicy";

import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordRequirementChecklist } from "@/components/password/PasswordRequirementChecklist";

import styles from "../auth.module.css";

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || firstName;

  return { firstName, lastName };
}

export default function RegisterPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("auth.register");
  const commonT = useTranslations("auth.common");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError
  } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    },
    mode: "onTouched",
  });

  const password = useWatch({
    control,
    name: "password"
  });
  const passwordRequirements = getPasswordRequirementState(password ?? "");

  const onSubmit = async (data: RegisterFormValues) => {
    const { firstName, lastName } = splitFullName(data.fullName);

    try {
      setSubmittedEmail(null);
      setResendSuccess(false);

      const { data: payload } = await authService.register({
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        organizationName: `${firstName || "SupportOps"} Workspace`
      });
      setSubmittedEmail(payload.email || data.email);
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : commonT("unableToRegister");
      setError("root", { message });
    }
  };

  const onResendVerificationEmail = async () => {
    if (!submittedEmail) {
      return;
    }

    setResendSuccess(false);
    try {
      await authService.resendVerificationEmail({ email: submittedEmail });
      setResendSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : t("resendError");
      setError("root", { message });
    }
  };

  return (
    <AuthCard
      maxWidth={1040}
      title={t("title")}
      subtitle={t("subtitle")}
      titleSx={{ fontSize: { xs: "1.9rem", md: "1.9rem" } }}
      illustration={
        <>
          {!imageLoadError ? (
            <div className={styles.illustrationImageWrap}>
              <Image
                src="/images/auth/register-illustration.png"
                alt="Register illustration"
                fill
                sizes="900px"
                className={styles.illustrationImage}
                onError={() => setImageLoadError(true)}
                priority
              />
            </div>
          ) : (
            <PersonOutlineIcon sx={{ fontSize: 120, color: "primary.main", mt: 2 }} />
          )}
        </>
      }
      footer={
        <>
          <span>{t("footerPrompt")}</span>
          <Link href={`/${locale}/login`}>{t("footerAction")}</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <input
          type="text"
          name="register-username"
          autoComplete="username"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
        />
        <input
          type="password"
          name="register-password"
          autoComplete="new-password"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
        />
        <div className={styles.fields}>
          <TextInputField
            name="fullName"
            control={control}
            label={t("fullNameLabel")}
            placeholder={t("fullNamePlaceholder")}
            autoComplete="off"
            startIcon={<PersonOutlineIcon fontSize="small" />}
            rules={{
              required: t("fullNameRequired")
            }}
          />
          <TextInputField
            name="email"
            control={control}
            label={commonT("emailLabel")}
            placeholder={commonT("emailPlaceholder")}
            autoComplete="off"
            startIcon={<EmailIcon fontSize="small" />}
            rules={{
              required: commonT("emailRequired"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: commonT("invalidEmail")
              }
            }}
          />
          <TextInputField
            name="password"
            control={control}
            label={commonT("passwordLabel")}
            placeholder={t("passwordPlaceholder")}
            type="password"
            autoComplete="new-password"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            rules={buildPasswordRules<RegisterFormValues, "password">({
              required: commonT("passwordRequired"),
              min: commonT("passwordMin"),
              max: commonT("passwordMax"),
              format: commonT("passwordFormat")
            })}
          />
          <PasswordRequirementChecklist
            className={styles.passwordChecklist}
            items={[
              {
                key: "minLength",
                label: t("passwordRequirements.minLength"),
                met: passwordRequirements.minLength
              },
              {
                key: "lowercase",
                label: t("passwordRequirements.lowercase"),
                met: passwordRequirements.lowercase
              },
              {
                key: "uppercase",
                label: t("passwordRequirements.uppercase"),
                met: passwordRequirements.uppercase
              },
              {
                key: "number",
                label: t("passwordRequirements.number"),
                met: passwordRequirements.number
              },
              {
                key: "specialCharacter",
                label: t("passwordRequirements.specialCharacter"),
                met: passwordRequirements.specialCharacter
              }
            ]}
          />
          <TextInputField
            name="confirmPassword"
            control={control}
            label={t("confirmPasswordLabel")}
            placeholder={t("confirmPasswordPlaceholder")}
            type="password"
            autoComplete="new-password"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            rules={{
              required: t("confirmPasswordRequired"),
              validate: (value: string) => value === password || commonT("passwordMismatch")
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                {...register("acceptTerms", {
                  required: commonT("acceptTermsRequired")
                })}
              />
            }
            label={
              <span>
                {commonT("acceptTerms")} <Link href={`/${locale}/terms`}>{commonT("termsAndConditions")}</Link>
              </span>
            }
          />
          {errors.acceptTerms?.message ? <Alert severity="error">{errors.acceptTerms.message}</Alert> : null}
          {submittedEmail ? (
            <>
              <Alert severity="success">{t("submitSuccess", { email: submittedEmail })}</Alert>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                disabled={isSubmitting}
                onClick={onResendVerificationEmail}
                sx={{ borderRadius: 2, textTransform: "none", py: 1.2, fontWeight: 600 }}
              >
                {t("resendVerificationEmail")}
              </Button>
              {resendSuccess ? <Alert severity="success">{t("resendSuccess")}</Alert> : null}
              <Button
                component={Link}
                href={`/${locale}/login`}
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  py: 1.2,
                  fontWeight: 600
                }}
              >
                {t("goToLogin")}
              </Button>
            </>
          ) : (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
                fontWeight: 600
              }}
            >
              {t("submit")}
            </Button>
          )}
          {errors.root?.message ? <Alert severity="error">{errors.root.message}</Alert> : null}
        </div>
      </form>
    </AuthCard>
  );
}
*/
