"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChangeHistoryRoundedIcon from "@mui/icons-material/ChangeHistoryRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SentimentSatisfiedAltRoundedIcon from "@mui/icons-material/SentimentSatisfiedAltRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ViewInArRoundedIcon from "@mui/icons-material/ViewInArRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { useMemo, useState } from "react";

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
}

interface ComparisonFeature {
  name: string;
  freelancer: boolean | string;
  company: boolean | string;
  enterprise: boolean | string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FooterColumn {
  title: string;
  links: string[];
}

const plans: PricingPlan[] = [
  {
    name: "Freelancer",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "Great for personal use and side projects.",
    features: [
      "Everything you need to manage payments",
      "No setup fees, monthly fees, or hidden fees",
    ],
  },
  {
    name: "Company",
    monthlyPrice: 299,
    yearlyPrice: 249,
    description: "Best for large scale uses and extended redistribution rights.",
    features: [
      "Everything you need to manage payments",
      "No setup fees, monthly fees, or hidden fees",
      "Comprehensive security and rigorous compliance",
      "Get hundreds of feature updates each year",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 2799,
    yearlyPrice: 2399,
    description: "Best for large scale uses and extended redistribution rights.",
    features: [
      "Everything you need to manage payments",
      "No setup fees, monthly fees, or hidden fees",
      "Comprehensive security and rigorous compliance",
      "Get hundreds of feature updates each year",
      "Fast, predictable payouts to your bank accounts",
      "Financial reconciliation and reporting",
      "24x7 phone, chat, and email support",
      "Robust developer platform and third-party integrations",
    ],
  },
];

const featureIconsByPlan: Record<string, SvgIconComponent[]> = {
  Freelancer: [CurrencyExchangeRoundedIcon, SentimentSatisfiedAltRoundedIcon],
  Company: [
    CurrencyExchangeRoundedIcon,
    SentimentSatisfiedAltRoundedIcon,
    SecurityRoundedIcon,
    ChangeHistoryRoundedIcon,
  ],
  Enterprise: [
    CurrencyExchangeRoundedIcon,
    SentimentSatisfiedAltRoundedIcon,
    SecurityRoundedIcon,
    ChangeHistoryRoundedIcon,
    LocalFireDepartmentRoundedIcon,
    ShowChartRoundedIcon,
    SupportAgentRoundedIcon,
    ViewInArRoundedIcon,
  ],
};

const comparisonFeatures: ComparisonFeature[] = [
  { name: "Seperate business/personal", freelancer: true, company: true, enterprise: true },
  { name: "Estimate tax payments", freelancer: true, company: true, enterprise: true },
  { name: "Stock control", freelancer: true, company: true, enterprise: true },
  { name: "Create invoices & estimates", freelancer: false, company: true, enterprise: true },
  { name: "Manage bills & payments", freelancer: false, company: true, enterprise: true },
  { name: "Run payroll", freelancer: false, company: true, enterprise: true },
  { name: "Handle multiple currencies", freelancer: false, company: false, enterprise: true },
  { name: "Number of Users", freelancer: "1 User", company: "5-10 Users", enterprise: "20+ Users" },
  { name: "Track deductible mileage", freelancer: false, company: false, enterprise: true },
  { name: "Track employee time", freelancer: false, company: false, enterprise: true },
  { name: "Multi-device", freelancer: false, company: false, enterprise: true },
];

const faqColumns: FaqItem[][] = [
  [
    {
      question: "Why are you calling it \"early access\"?",
      answer:
        "We're really happy with the components we've put together so far, but we're still planning to build. Every component you see in the preview is available to use today, but there's still at least a few dozen more ideas we're planning to design and include.",
    },
    {
      question: "What is the difference between the Freelancer/Company/Enterprise licenses?",
      answer:
        "The Freelancer license is aimed at people who work on their own. The Enterprise license is aimed at large companies with multiple projects. Depending on the license you purchase, you can use the product in single or multiple domains.",
    },
    {
      question: "What does the Tech Support refer to?",
      answer:
        "Depending on your license type, you have a fixed period when you can submit any ticket related to not including custom features and bug fixes. You will get responses directly from product creators in 24 hours (during business days).",
    },
    {
      question: "Can I remove the copyright notice from the files?",
      answer:
        "You can remove the copyright notice if it's a premium item, but then you'll need to create a separate .txt file called LICENSE.txt and copy the copyright text in there. This file should be added to the root folder of your project.",
    },
    {
      question: "What does the Team Size refer to?",
      answer:
        "The Team size for each license reflects the number of people who can access the product. For a team of 6-10 people, you will need the Company license.",
    },
  ],
  [
    {
      question: "Why are you calling it \"early access\"?",
      answer:
        "We're really happy with the components we've put together so far, but we're still planning to build. Every component you see in the preview is available to use today, but there's still at least a few dozen more ideas we're planning to design and include.",
    },
    {
      question: "What browsers does Tailwind Dashboard support?",
      answer:
        "The components in Tailwind UI are designed to work in the latest, stable releases of all major browsers, including Chrome, Firefox, Safari, and Edge. We don't support Internet Explorer 11.",
    },
    {
      question: "What is the difference between the Freelancer/Company/Enterprise licenses?",
      answer:
        "For example, if you purchased the Freelancer License, you can create only one website. If you want to create multiple websites, you will need a bigger license (like Company or Enterprise).",
    },
    {
      question: "What does the Free Updates refer to?",
      answer:
        "Freelancer: You will receive Free Updates for 6 months. Company: You will receive Free Updates for 12 months. Enterprise: You will benefit from 24 months of Free Updates.",
    },
  ],
];

const footerColumns: FooterColumn[] = [
  { title: "Company", links: ["About", "Premium", "Blog", "Affiliate Program", "Get Coupon"] },
  { title: "Help and support", links: ["Contact Us", "Knowledge Center", "Premium Support", "Sponsorships"] },
  { title: "Resources", links: ["Third-Party Tools", "Illustrations", "Themesberg", "Bluehost", "Stock Photos"] },
  { title: "Legal", links: ["Privacy Policy", "Terms & Conditions", "EULA"] },
];

function BrandMark() {
  return (
    <Box component="svg" viewBox="0 0 64 64" aria-hidden="true" sx={{ width: 36, height: 36, color: "#1f2a3d" }}>
      <path
        d="M13 20c5-8 14-12 23-12 15 0 28 12 28 28S51 64 36 64c-9 0-18-4-23-12l9-6c3 5 8 8 14 8 10 0 18-8 18-18s-8-18-18-18c-6 0-11 3-14 8l-9-6Z"
        fill="currentColor"
      />
      <path d="M6 26h10l8 10-8 10H6l8-10-8-10Z" fill="currentColor" />
    </Box>
  );
}

function renderComparisonCell(value: boolean | string) {
  if (typeof value === "string") {
    const icon = value.includes("User") ? (
      value.startsWith("1") ? (
        <PersonRoundedIcon sx={{ fontSize: 14 }} />
      ) : (
        <Groups2RoundedIcon sx={{ fontSize: 14 }} />
      )
    ) : null;

    return (
      <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
        {icon}
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {value}
        </Typography>
      </Stack>
    );
  }

  return value ? (
    <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 16 }} aria-label="included" />
  ) : (
    <CloseRoundedIcon sx={{ color: "error.main", fontSize: 16 }} aria-label="not included" />
  );
}

export default function MarketingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const displayedPlans = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        price: isYearly ? plan.yearlyPrice : plan.monthlyPrice,
      })),
    [isYearly],
  );

  return (
    <Box sx={{ bgcolor: "#f3f4f6", minHeight: "100vh" }}>
      <Box
        component="header"
        sx={{ bgcolor: "common.white", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <BrandMark />
              <Stack direction="row" spacing={2.5}>
                {[{ label: "Dashboard", active: true }].map((item) => (
                  <Link
                    key={item.label}
                    href="#"
                    underline="none"
                    sx={{
                      color: item.active ? "primary.main" : "text.secondary",
                      fontWeight: item.active ? 700 : 500,
                      fontSize: 13,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Stack>

            <Button
              variant="text"
              color="inherit"
              startIcon={<LogoutOutlinedIcon sx={{ fontSize: 22 }} />}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              Login/Register
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        sx={{ px: { xs: 2, md: 4, lg: 6 }, py: { xs: 5, md: 6 } }}
      >
        <Stack spacing={8}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Typography
                component="h1"
                fontWeight={800}
                sx={{
                  fontSize: { xs: 21, md: 39 },
                  lineHeight: 1.06,
                  letterSpacing: "-0.02em",
                }}
              >
                Our pricing plan made simple
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 1220, fontSize: { xs: 9, md: 18 }, lineHeight: 1.35 }}
              >
                All types of businesses need access to development resources, so we give you the option to
                decide how much you need to use.
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                fontWeight={700}
                color="text.primary"
                sx={{ fontSize: { xs: 10, md: 20 }, lineHeight: 1.2 }}
              >
                Monthly
              </Typography>
              <Switch
                checked={isYearly}
                onChange={(event) => setIsYearly(event.target.checked)}
                inputProps={{ "aria-label": "Switch pricing period" }}
                sx={{
                  "& .MuiSwitch-track": { bgcolor: "#d1d5db", opacity: "1 !important" },
                }}
              />
              <Typography
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: { xs: 10, md: 20 }, lineHeight: 1.2 }}
              >
                Yearly
              </Typography>
            </Stack>

            <Grid container spacing={{ xs: 2.5, md: 3 }}>
              {displayedPlans.map((plan) => (
                <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
                  <Card
                    sx={{
                      borderRadius: 3.5,
                      border: "1px solid #d9e1ea",
                      bgcolor: "#f9fafb",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4.5 }, height: "100%" }}>
                      <Stack spacing={3} sx={{ height: "100%" }}>
                        <Typography color="text.secondary" fontWeight={700} sx={{ fontSize: { xs: 17, md: 28 } }}>
                          {plan.name}
                        </Typography>

                        <Stack direction="row" alignItems="baseline" spacing={0.75}>
                          <Typography
                            fontWeight={800}
                            sx={{ color: "text.primary", fontSize: { xs: 24, md: 44 }, lineHeight: 1 }}
                          >
                            ${plan.price}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            fontWeight={400}
                            sx={{ fontSize: { xs: 17, md: 33 }, lineHeight: 1 }}
                          >
                            /month
                          </Typography>
                        </Stack>

                        <Typography
                          color="text.secondary"
                          sx={{ minHeight: { xs: 0, md: 65 }, fontSize: { xs: 13, md: 20 }, lineHeight: 1.35 }}
                        >
                          {plan.description}
                        </Typography>

                        <Stack spacing={1.25}>
                          {plan.features.map((feature, featureIndex) => {
                            const FeatureIcon =
                              featureIconsByPlan[plan.name]?.[featureIndex] ?? CheckCircleRoundedIcon;

                            return (
                              <Stack key={feature} direction="row" spacing={1} alignItems="flex-start">
                                <FeatureIcon sx={{ color: "#21c48c", fontSize: 21, mt: 0.25 }} />
                                <Typography color="text.secondary" sx={{ fontSize: { xs: 11, md: 16 }, lineHeight: 1.35 }}>
                                  {feature}
                                </Typography>
                              </Stack>
                            );
                          })}
                        </Stack>

                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            mt: "auto",
                            textTransform: "none",
                            fontWeight: 700,
                            py: { xs: 1.2, md: 1.8 },
                            borderRadius: 2,
                            fontSize: { xs: 13, md: 20 },
                          }}
                        >
                          Choose plan
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <TableContainer sx={{ bgcolor: "transparent" }}>
            <Table aria-label="Pricing comparison table" sx={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderBottom: 0 }} />
                  <TableCell align="center" sx={{ borderBottom: 0, fontWeight: 700 }}>
                    Freelancer
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: 0, fontWeight: 700 }}>
                    Company
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: 0, fontWeight: 700 }}>
                    Enterprise
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonFeatures.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell
                      sx={{
                        bgcolor: "common.white",
                        border: 0,
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                        color: "text.secondary",
                        width: "52%",
                      }}
                    >
                      {feature.name}
                    </TableCell>
                    {[feature.freelancer, feature.company, feature.enterprise].map((value, index) => (
                      <TableCell
                        key={`${feature.name}-${index}`}
                        align="center"
                        sx={{
                          bgcolor: "common.white",
                          border: 0,
                          width: "16%",
                          ...(index === 2
                            ? {
                                borderTopRightRadius: 12,
                                borderBottomRightRadius: 12,
                              }
                            : undefined),
                        }}
                      >
                        {renderComparisonCell(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: 18, md: 28 } }}>
                Frequently asked questions
              </Typography>
              <Typography color="text.secondary" maxWidth={760}>
                All types of businesses need access to development resources, so we give you the option to
                decide how much you need to use.
              </Typography>
            </Stack>

            <Divider />

            <Grid container spacing={6}>
              {faqColumns.map((column, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Stack spacing={4}>
                    {column.map((item) => (
                      <Stack key={item.question} spacing={1.3}>
                        <Typography fontWeight={700} color="text.primary" sx={{ fontSize: 11 }}>
                          {item.question}
                        </Typography>
                        <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                          {item.answer}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Stack>
      </Container>

      <Box component="footer" sx={{ bgcolor: "common.white", borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5}>
                <BrandMark />
                <Typography color="text.secondary" maxWidth={320}>
                  UI Kits, Templates and Dashboards built on top of Tailwind, Vue.js, React, Angular, Node.js and
                  Laravel. Join over 516,257 creatives to access all our products.
                </Typography>
              </Stack>
            </Grid>

            {footerColumns.map((column) => (
              <Grid size={{ xs: 6, md: 2 }} key={column.title}>
                <Stack spacing={1.5}>
                  <Typography fontWeight={700} textTransform="uppercase" sx={{ fontSize: 13 }}>
                    {column.title}
                  </Typography>
                  {column.links.map((item) => (
                    <Link key={item} href="#" underline="hover" color="text.secondary" sx={{ fontSize: 14 }}>
                      {item}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mt: 5, mb: 2 }} />
          <Typography color="text.secondary" textAlign="center" sx={{ fontSize: 14 }}>
            © 2021 Themesberg. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
