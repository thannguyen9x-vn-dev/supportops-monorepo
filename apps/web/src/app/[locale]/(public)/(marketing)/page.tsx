"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useLocale } from "next-intl";

import { LanguageMenu } from "@/features/layout/components/Header/LanguageMenu";
import { ThemeModeToggle } from "@/features/layout/components/Header/ThemeModeToggle";

const flowItems = ["Draft", "Submitted", "Triage", "Assigned", "In Progress", "Resolved", "Closed"];

export default function MarketingPage() {
  const locale = useLocale();
  const isEn = locale === "en";

  const copy = isEn
    ? {
        heroTitle: "ServiceOps for Internal Service Requests",
        heroSubtitle:
          "Create requests fast, triage with confidence, assign technicians, and keep SLA visible in one operational flow.",
        ctaPrimary: "Login",
        ctaSecondary: "See Workflow",
        sectionFlow: "Core Workflow",
        flowNote: "Optional states: Reopened, Escalated, Waiting External Vendor.",
        sectionRoles: "Roles and Responsibilities",
        roles: [
          "Requester: create request, track progress, add public comments.",
          "Ops Coordinator: triage, assign/reassign, escalate, update metadata.",
          "Technician: start work, add internal notes, submit resolution.",
          "Tenant Admin: configure workflow, SLA, permissions, and audit visibility.",
        ],
        sectionOpsInbox: "Operational Inbox in Request List",
        opsPoints: [
          "Filter by status, priority, assignee, location, SLA health.",
          "See overdue and at-risk items clearly.",
          "Open request detail directly from each row.",
        ],
        sectionDetail: "Request Detail as Single Workspace",
        detailPoints: [
          "Header with status/priority/SLA and contextual actions.",
          "Timeline and comments for collaboration and execution history.",
          "Metadata, SLA summary, and audit summary in right sidebar.",
        ],
        finalTitle: "Ready to standardize your ServiceOps workflow?",
        finalSubtitle: "Start with Create Request, Request List, and Request Detail.",
      }
    : {
        heroTitle: "ServiceOps cho quy trình yêu cầu dịch vụ nội bộ",
        heroSubtitle:
          "Tạo request nhanh, triage rõ ràng, phân công kỹ thuật viên và theo dõi SLA trong một luồng vận hành duy nhất.",
        ctaPrimary: "Đăng nhập",
        ctaSecondary: "Xem luồng xử lý",
        sectionFlow: "Luồng xử lý cốt lõi",
        flowNote: "Trạng thái mở rộng: Reopened, Escalated, Waiting External Vendor.",
        sectionRoles: "Vai trò và trách nhiệm",
        roles: [
          "Requester: tạo request, theo dõi tiến độ, thêm public comment.",
          "Ops Coordinator: triage, assign/reassign, escalate, cập nhật metadata.",
          "Technician: bắt đầu xử lý, thêm internal note, submit resolution.",
          "Tenant Admin: cấu hình workflow, SLA, permission, và audit visibility.",
        ],
        sectionOpsInbox: "Request List như Operational Inbox",
        opsPoints: [
          "Lọc theo status, priority, assignee, location, SLA health.",
          "Nhìn rõ request quá hạn và request có rủi ro SLA.",
          "Mở request detail trực tiếp từ từng row.",
        ],
        sectionDetail: "Request Detail là workspace xử lý",
        detailPoints: [
          "Header có status/priority/SLA và action theo role.",
          "Timeline + comments cho collaboration và history.",
          "Sidebar metadata, SLA summary, audit summary.",
        ],
        finalTitle: "Sẵn sàng chuẩn hóa quy trình ServiceOps?",
        finalSubtitle: "Bắt đầu từ Create Request, Request List và Request Detail.",
      };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box component="header" sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Image src="/icons/brand-mark.png" alt="ServiceOps logo" width={36} height={36} priority />
              <Typography fontWeight={700} fontSize={28}>ServiceOps</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LanguageMenu />
              <ThemeModeToggle />
              <Button component={Link} href={`/${locale}/login`} variant="text" color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
                {copy.ctaPrimary}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={8}>
          <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <CardContent sx={{ p: { xs: 3, md: 6 } }}>
              <Stack spacing={3}>
                <Chip label="ServiceOps + TeamOps Core" color="primary" sx={{ width: "fit-content", fontWeight: 700 }} />
                <Typography component="h1" fontWeight={800} sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.04, letterSpacing: "-0.02em", maxWidth: 900 }}>
                  {copy.heroTitle}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: { xs: 16, md: 20 }, maxWidth: 860, lineHeight: 1.5 }}>
                  {copy.heroSubtitle}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button component={Link} href={`/${locale}/login`} variant="contained" sx={{ textTransform: "none", fontWeight: 700, px: 3 }}>
                    {copy.ctaPrimary}
                  </Button>
                  <Button href="#workflow" component="a" variant="outlined" endIcon={<KeyboardArrowRightRoundedIcon />} sx={{ textTransform: "none", fontWeight: 700, px: 2.5 }}>
                    {copy.ctaSecondary}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack id="workflow" spacing={2}>
            <Typography variant="h4" fontWeight={800}>{copy.sectionFlow}</Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
              {flowItems.map((item) => (
                <Chip key={item} label={item} variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
              ))}
            </Stack>
            <Typography color="text.secondary">{copy.flowNote}</Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={800}>{copy.sectionRoles}</Typography>
                    {copy.roles.map((item) => (
                      <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircleRoundedIcon color="primary" sx={{ mt: 0.2, fontSize: 18 }} />
                        <Typography color="text.secondary">{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3} sx={{ height: "100%" }}>
                <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight={800}>{copy.sectionOpsInbox}</Typography>
                      {copy.opsPoints.map((item) => (
                        <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                          <CheckCircleRoundedIcon color="primary" sx={{ mt: 0.2, fontSize: 18 }} />
                          <Typography color="text.secondary">{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", flexGrow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight={800}>{copy.sectionDetail}</Typography>
                      {copy.detailPoints.map((item) => (
                        <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                          <CheckCircleRoundedIcon color="primary" sx={{ mt: 0.2, fontSize: 18 }} />
                          <Typography color="text.secondary">{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          <Card sx={{ borderRadius: 3.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                <Stack spacing={0.75}>
                  <Typography variant="h5" fontWeight={800}>{copy.finalTitle}</Typography>
                  <Typography color="text.secondary">{copy.finalSubtitle}</Typography>
                </Stack>
                <Button component={Link} href={`/${locale}/login`} variant="contained" sx={{ textTransform: "none", fontWeight: 700, px: 3 }}>
                  {copy.ctaPrimary}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
