"use client";

import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import { Alert, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";

export default function AuthSupportPage() {
  const { locale } = useParams<{ locale: string }>();
  const isVi = locale.toLowerCase().startsWith("vi");

  const copy = isVi
    ? {
        title: "Liên hệ bộ phận kỹ thuật",
        subtitle:
          "Nếu bạn gặp vấn đề khi đăng nhập, quên mật khẩu hoặc reset mật khẩu, vui lòng liên hệ để được hỗ trợ nhanh.",
        call: "Gọi hỗ trợ",
        email: "Gửi email",
        phoneLabel: "Số điện thoại hỗ trợ",
        emailLabel: "Email hỗ trợ",
        note: "Vui lòng mô tả lỗi bạn gặp (kèm email tài khoản và ảnh chụp màn hình nếu có).",
        back: "Quay lại đăng nhập",
      }
    : {
        title: "Contact Technical Support",
        subtitle:
          "If you have issues with login, forgot password, or reset password, please contact our support team.",
        call: "Call support",
        email: "Send email",
        phoneLabel: "Support phone",
        emailLabel: "Support email",
        note: "Please include your account email and a screenshot of the issue when possible.",
        back: "Back to login",
      };

  const phoneDisplay = "(+84) 349 575 601";
  const phoneHref = "tel:+84349575601";
  const supportEmail = "nguyennhamthan1010@gmail.com";

  return (
    <AuthCard
      maxWidth={860}
      title={copy.title}
      subtitle={copy.subtitle}
      titleSx={{ fontSize: { xs: "1.8rem", md: "2rem" } }}
      illustration={
        <Stack alignItems="center" spacing={1.5}>
          <HeadsetMicOutlinedIcon sx={{ fontSize: 88, color: "primary.main" }} />
          <Typography color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
            {copy.note}
          </Typography>
        </Stack>
      }
      footer={
        <Link href={`/${locale}/login`}>
          {copy.back}
        </Link>
      }
    >
      <Stack spacing={2.5}>
        <Alert severity="info">{copy.note}</Alert>

        <Stack spacing={1.25}>
          <Typography color="text.secondary" variant="body2">{copy.phoneLabel}</Typography>
          <Button
            component="a"
            href={phoneHref}
            startIcon={<PhoneInTalkRoundedIcon />}
            variant="outlined"
            sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 700 }}
          >
            {copy.call}: {phoneDisplay}
          </Button>
        </Stack>

        <Stack spacing={1.25}>
          <Typography color="text.secondary" variant="body2">{copy.emailLabel}</Typography>
          <Button
            component="a"
            href={`mailto:${supportEmail}`}
            startIcon={<MailOutlineRoundedIcon />}
            variant="outlined"
            sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 700 }}
          >
            {copy.email}: {supportEmail}
          </Button>
        </Stack>
      </Stack>
    </AuthCard>
  );
}
