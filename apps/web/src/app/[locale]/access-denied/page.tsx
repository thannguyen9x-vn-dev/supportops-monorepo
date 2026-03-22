import BlockIcon from "@mui/icons-material/Block";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { getTranslations } from "next-intl/server";

export default async function AccessDeniedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("pages.accessDenied");

  return (
    <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(211, 47, 47, 0.08)",
            color: "error.main",
            mx: "auto",
            mb: 2,
          }}
        >
          <BlockIcon fontSize="large" />
        </Box>

        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {t("title")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t("description")}
        </Typography>

        <Button href={`/${locale}/dashboard`} size="large" startIcon={<ArrowBackIcon />} variant="contained">
          {t("goToDashboard")}
        </Button>
      </Paper>
    </Container>
  );
}
