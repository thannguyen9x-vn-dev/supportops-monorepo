// NOTE: Trang xác thực email đã bị vô hiệu hóa.
// Trang này chỉ dùng cho flow tự đăng ký (self-registration), hiện không áp dụng.
// Dự án hiện tại user được admin mời qua link invite (/invite/accept), không cần verify email.
// Giữ code bên dưới để có thể kích hoạt lại nếu cần trong tương lai.

import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/login`);
}

/*
'use client';

import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { Alert, Button } from "@mui/material";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api";

import { AuthCard } from "../../../../../components/auth/AuthCard";
import styles from "../auth.module.css";

type VerifyStatus = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.verifyEmail");

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<VerifyStatus>(token ? "verifying" : "idle");
  const [message, setMessage] = useState<string>(token ? t("verifying") : t("missingToken"));
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        await authService.verifyEmail({ token });
        if (!isMounted) {
          return;
        }

        setStatus("success");
        setMessage(t("success"));
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        const fallback = t("error");
        const nextMessage = error instanceof ApiError ? error.message : fallback;
        setStatus("error");
        setMessage(nextMessage);
      }
    };

    void verify();

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  const handleResend = async () => {
    if (!email) {
      setStatus("error");
      setMessage(t("missingEmail"));
      return;
    }

    setResendSuccess(false);
    try {
      await authService.resendVerificationEmail({ email });
      setResendSuccess(true);
    } catch (error: unknown) {
      const fallback = t("resendError");
      const nextMessage = error instanceof ApiError ? error.message : fallback;
      setStatus("error");
      setMessage(nextMessage);
    }
  };

  return (
    <AuthCard
      maxWidth={840}
      title={t("title")}
      subtitle={t("subtitle")}
      titleSx={{ fontSize: { xs: "1.9rem", md: "1.9rem" } }}
      formPanelSx={{
        justifyContent: { xs: "flex-start", md: "center" }
      }}
      illustration={<MarkEmailReadOutlinedIcon sx={{ fontSize: 120, color: "primary.main", mt: 2 }} />}
      footer={
        <>
          <span>{t("footerPrompt")}</span>
          <Link href={`/${locale}/login`}>{t("footerAction")}</Link>
        </>
      }
    >
      <div className={styles.fields}>
        <Alert severity={status === "success" ? "success" : status === "verifying" ? "info" : "warning"}>
          {message}
        </Alert>
        <Button component={Link} href={`/${locale}/login`} variant="contained" fullWidth
          sx={{
            borderRadius: 2,
            textTransform: "none",
            py: 1.2,
            fontWeight: 600,
          }}
        >
          {t("goToLogin")}
        </Button>
        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={handleResend}
          sx={{ borderRadius: 2, textTransform: "none", py: 1.2, fontWeight: 600 }}
        >
          {t("resend")}
        </Button>
        {resendSuccess ? <Alert severity="success">{t("resendSuccess")}</Alert> : null}
      </div>
    </AuthCard>
  );
}
*/
