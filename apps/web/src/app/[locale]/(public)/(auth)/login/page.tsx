'use client';

import EmailIcon from "@mui/icons-material/Email";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel } from "@mui/material";
import { TextInputField } from "@supportops/ui-form";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { authService } from "@/features/auth/services/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { tokenManager } from "@/lib/auth/tokenManager";

import { AuthCard } from "@/components/auth/AuthCard";

import styles from "../auth.module.css";

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

function resolveNextPath(nextPath: string, locale: string): string {
  if (/^\/(en|vi)(\/|$)/.test(nextPath)) {
    return nextPath;
  }

  return `/${locale}${nextPath}`;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const t = useTranslations("auth.login");
  const commonT = useTranslations("auth.common");
  const supportLabel = locale.toLowerCase().startsWith("vi") ? "Hỗ trợ kỹ thuật" : "Technical support";
  const [imageLoadError, setImageLoadError] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      remember: false
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    const nextPath = searchParams.get("next");
    if (nextPath?.startsWith("/")) {
      router.replace(resolveNextPath(nextPath, locale));
      return;
    }

    router.replace(`/${locale}/dashboard`);
  }, [isAuthenticated, isLoading, locale, router, searchParams]);

  if (isLoading || isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center"
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { data: payload } = await authService.login({
        email: data.email,
        password: data.password,
        rememberMe: data.remember
      });

      tokenManager.setAccessToken(payload.accessToken);

      const nextPath = searchParams.get("next");
      if (nextPath?.startsWith("/")) {
        router.replace(resolveNextPath(nextPath, locale));
        return;
      }

      router.replace(`/${locale}/dashboard`);
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : commonT("unableToSignIn");
      setError("root", { message });
    }
  };

  return (
    <AuthCard
      maxWidth={1040}
      title={t("title")}
      subtitle={t("subtitle")}
      titleSx={{ fontSize: { xs: "1.9rem", md: "1.9rem" } }}
      illustrationPanelSx={{
        bgcolor: "background.paper",
        backgroundColor: "background.paper",
        backgroundImage: "none !important",
        color: "text.primary",
        borderRight: { xs: "none", md: "1px solid" },
        borderColor: "divider",
      }}
      illustration={
        <>
          {!imageLoadError ? (
            <div className={styles.illustrationImageWrap}>
              <Image
                src="/images/auth/login-illustration.png"
                alt="Login illustration"
                fill
                sizes="900px"
                className={styles.illustrationImage}
                onError={() => setImageLoadError(true)}
                priority
              />
            </div>
          ) : (
            <WifiOutlinedIcon sx={{ fontSize: 120, color: "primary.main", mt: 2 }} />
          )}
        </>
      }
      footer={
        <>
          <Link href={`/${locale}/auth-support`}>{supportLabel}</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.fields}>
          <TextInputField
            name="email"
            control={control}
            label={commonT("emailLabel")}
            placeholder="Email"
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
            placeholder="Password"
            type="password"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            rules={{
              required: commonT("passwordRequired")
            }}
          />
          <div className={styles.helperRow}>
            <FormControlLabel control={<Checkbox size="small" {...register("remember")} />} label={t("rememberMe")} />
            <Link href={`/${locale}/forgot-password`}>{t("forgotPassword")}</Link>
          </div>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.2,
              fontWeight: 600,
            }}
          >
            {t("submit")}
          </Button>
          {errors.root?.message ? <Alert severity="error">{errors.root.message}</Alert> : null}
        </div>
      </form>
    </AuthCard>
  );
}
